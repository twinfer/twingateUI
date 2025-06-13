import { env } from '@/config/env'
import { useDiscoveryEndpointsStore } from '@/stores/discoveryEndpointsStore'
import { networkOptimizer } from './networkOptimizer'

export interface DiscoveredThing {
  id: string
  url: string
  thingDescription: object
  title: string
  description?: string
  discoveryMethod: 'well-known' | 'direct-url' | 'scan'
  lastSeen: string
  online: boolean
  validationStatus: 'valid' | 'invalid' | 'warning' | 'pending'
  validationErrors?: string[]
}

export interface DiscoveryProgress {
  total: number
  completed: number
  current: string
  status: 'scanning' | 'validating' | 'completed' | 'error'
}

export interface DiscoveryResult {
  discovered: DiscoveredThing[]
  errors: Array<{ url: string; error: string }>
  progress: DiscoveryProgress
}

class DiscoveryService {
  private abortController?: AbortController
  private readonly maxRetries = 2
  private readonly retryDelay = 1000 // 1 second
  private readonly maxConcurrentRequests = 5
  private readonly connectionPoolSize = 10
  private activeRequests = new Set<string>()
  private requestQueue: Array<() => Promise<any>> = []
  private isProcessingQueue = false

  /**
   * Retry a function with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries,
    delay: number = this.retryDelay
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries <= 0) throw error
      
      // Don't retry if operation was cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      
      // Don't retry client errors (4xx), only server errors (5xx) and network errors
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        throw error
      }
      
      console.warn(`Retrying operation after ${delay}ms. ${retries} retries left.`, error)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.retryWithBackoff(fn, retries - 1, delay * 2)
    }
  }

  /**
   * Discover Things from a list of base URLs using .well-known/wot with concurrent optimization
   */
  async discoverThings(
    baseUrls: string[],
    onProgress?: (progress: DiscoveryProgress) => void
  ): Promise<DiscoveryResult> {
    this.abortController = new AbortController()
    
    const result: DiscoveryResult = {
      discovered: [],
      errors: [],
      progress: {
        total: baseUrls.length,
        completed: 0,
        current: '',
        status: 'scanning'
      }
    }

    // Process URLs in batches for optimal network usage
    const batches = this.createBatches(baseUrls, this.maxConcurrentRequests)
    
    for (const batch of batches) {
      if (this.abortController.signal.aborted) break

      // Process batch concurrently
      const batchPromises = batch.map(async (baseUrl) => {
        result.progress.current = baseUrl
        onProgress?.(result.progress)

        try {
          const discovered = await this.retryWithBackoff(() => this.scanWellKnownOptimized(baseUrl))
          return { baseUrl, discovered, error: null }
        } catch (error) {
          return {
            baseUrl,
            discovered: [],
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      // Process batch results
      for (const promiseResult of batchResults) {
        if (promiseResult.status === 'fulfilled') {
          const { baseUrl, discovered, error } = promiseResult.value
          
          if (error) {
            result.errors.push({ url: baseUrl, error })
          } else {
            result.discovered.push(...discovered)
          }
        } else {
          // Handle promise rejection
          result.errors.push({
            url: 'unknown',
            error: promiseResult.reason?.message || 'Batch processing failed'
          })
        }

        result.progress.completed++
        onProgress?.(result.progress)
      }
    }

    // Validation phase
    result.progress.status = 'validating'
    onProgress?.(result.progress)

    for (const thing of result.discovered) {
      if (this.abortController.signal.aborted) break
      
      try {
        const validation = await this.validateTD(thing.thingDescription)
        thing.validationStatus = validation.isValid ? 'valid' : 'invalid'
        thing.validationErrors = validation.errors
      } catch (error) {
        thing.validationStatus = 'warning'
        thing.validationErrors = ['Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
      }
    }

    result.progress.status = 'completed'
    onProgress?.(result.progress)

    // Add successful endpoints to the discovery endpoints store
    for (const baseUrl of baseUrls) {
      const discovered = result.discovered.filter(thing => 
        thing.url && thing.url.startsWith(baseUrl)
      ).length
      
      if (discovered > 0) {
        // Add endpoint to the store
        const endpointsStore = useDiscoveryEndpointsStore.getState()
        endpointsStore.addEndpoint(baseUrl, discovered)
      }
    }

    return result
  }

  /**
   * Scan a base URL for Thing Descriptions using .well-known/wot (legacy method)
   */
  async scanWellKnown(baseUrl: string): Promise<DiscoveredThing[]> {
    return this.scanWellKnownOptimized(baseUrl)
  }

  /**
   * Optimized scanning with network optimizer
   */
  async scanWellKnownOptimized(baseUrl: string): Promise<DiscoveredThing[]> {
    const wellKnownUrl = this.buildWellKnownUrl(baseUrl)
    
    try {
      // Use network optimizer for request deduplication and caching
      const data = await networkOptimizer.request({
        url: wellKnownUrl,
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/ld+json',
          'Cache-Control': 'max-age=300', // Cache for 5 minutes
        },
        timeout: env.DISCOVERY_TIMEOUT,
        retries: this.maxRetries,
        cacheKey: `discovery:${wellKnownUrl}`,
        cacheTTL: 5 * 60 * 1000, // 5 minutes
        priority: 'normal'
      })
      
      // Handle different .well-known/wot response formats
      return this.parseWellKnownResponse(data, baseUrl)
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Discovery cancelled')
      }
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Network error: Unable to reach ${wellKnownUrl}. Check if the endpoint is accessible.`)
      }
      
      // Re-throw with more context
      const originalMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to discover from ${wellKnownUrl}: ${originalMessage}`)
    }
  }

  /**
   * Discover a single Thing from a direct TD URL
   */
  async discoverSingleThing(url: string): Promise<DiscoveredThing> {
    try {
      // Use network optimizer for single Thing discovery
      const td = await networkOptimizer.request({
        url,
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/ld+json',
        },
        timeout: env.DISCOVERY_TIMEOUT,
        retries: this.maxRetries,
        cacheKey: `thing:${url}`,
        cacheTTL: 10 * 60 * 1000, // 10 minutes for direct Thing descriptions
        priority: 'high'
      })
      
      return {
        id: this.generateThingId(td),
        url,
        thingDescription: td,
        title: td.title || 'Untitled Thing',
        description: td.description,
        discoveryMethod: 'direct-url',
        lastSeen: new Date().toISOString(),
        online: true,
        validationStatus: 'pending',
      }
    } catch (error) {
      throw new Error(`Failed to discover Thing from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validate a Thing Description using browser-compatible validation
   */
  async validateTD(td: object): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    try {
      // Use our browser-compatible validation service
      const { simpleTDValidator } = await import('./simpleTdValidation')
      
      const validation = simpleTDValidator.validateTD(JSON.stringify(td))
      
      return {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      }
    }
  }

  /**
   * Cancel ongoing discovery
   */
  cancelDiscovery(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
    
    // Cancel any pending network requests
    networkOptimizer.cancelAllRequests()
  }

  /**
   * Create batches for concurrent processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Batch discover multiple URLs
   */
  async batchDiscoverThings(urls: string[]): Promise<DiscoveredThing[]> {
    if (urls.length === 0) return []
    
    try {
      // Create network requests for batch processing
      const requests = urls.map(url => ({
        url: this.buildWellKnownUrl(url),
        method: 'GET' as const,
        headers: {
          'Accept': 'application/json, application/ld+json',
          'Cache-Control': 'max-age=300',
        },
        timeout: env.DISCOVERY_TIMEOUT,
        retries: this.maxRetries,
        cacheKey: `discovery:${url}`,
        cacheTTL: 5 * 60 * 1000,
        priority: 'normal' as const
      }))
      
      // Use network optimizer for batch processing
      const responses = await networkOptimizer.batchRequest(requests)
      
      const discovered: DiscoveredThing[] = []
      
      for (let i = 0; i < responses.length; i++) {
        try {
          const data = responses[i]
          const baseUrl = urls[i]
          const things = this.parseWellKnownResponse(data, baseUrl)
          discovered.push(...things)
        } catch (error) {
          console.warn(`Failed to parse response for ${urls[i]}:`, error)
        }
      }
      
      return discovered
    } catch (error) {
      console.error('Batch discovery failed:', error)
      // Fallback to sequential processing
      return this.fallbackSequentialDiscovery(urls)
    }
  }

  /**
   * Fallback sequential discovery when batch fails
   */
  private async fallbackSequentialDiscovery(urls: string[]): Promise<DiscoveredThing[]> {
    const discovered: DiscoveredThing[] = []
    
    for (const url of urls) {
      try {
        const things = await this.scanWellKnownOptimized(url)
        discovered.push(...things)
      } catch (error) {
        console.warn(`Failed to discover from ${url}:`, error)
      }
    }
    
    return discovered
  }

  /**
   * Prefetch well-known endpoints for faster discovery
   */
  async prefetchEndpoints(baseUrls: string[]): Promise<void> {
    const wellKnownUrls = baseUrls.map(url => this.buildWellKnownUrl(url))
    await networkOptimizer.prefetch(wellKnownUrls, 'low')
  }

  /**
   * Get network statistics for discovery operations
   */
  getNetworkStats() {
    return networkOptimizer.getStats()
  }

  /**
   * Clear discovery cache
   */
  clearDiscoveryCache(): void {
    networkOptimizer.clearCache('discovery:')
    networkOptimizer.clearCache('thing:')
  }

  /**
   * Build .well-known/wot URL from base URL
   */
  private buildWellKnownUrl(baseUrl: string): string {
    const url = new URL(baseUrl)
    url.pathname = env.WELL_KNOWN_PATH
    return url.toString()
  }

  /**
   * Parse different formats of .well-known/wot responses
   */
  private parseWellKnownResponse(data: any, baseUrl: string): DiscoveredThing[] {
    const discovered: DiscoveredThing[] = []
    
    try {
      // Case 1: Direct Thing Description
      if (data['@type'] || data.title) {
        discovered.push({
          id: this.generateThingId(data),
          url: baseUrl,
          thingDescription: data,
          title: data.title || 'Untitled Thing',
          description: data.description,
          discoveryMethod: 'well-known',
          lastSeen: new Date().toISOString(),
          online: true,
          validationStatus: 'pending',
        })
      }
      // Case 2: Array of Thing Descriptions
      else if (Array.isArray(data)) {
        for (const td of data) {
          if (td && typeof td === 'object') {
            discovered.push({
              id: this.generateThingId(td),
              url: baseUrl,
              thingDescription: td,
              title: td.title || 'Untitled Thing',
              description: td.description,
              discoveryMethod: 'well-known',
              lastSeen: new Date().toISOString(),
              online: true,
              validationStatus: 'pending',
            })
          }
        }
      }
      // Case 3: Directory format with links
      else if (data.things || data.links) {
        const things = data.things || data.links || []
        for (const link of things) {
          if (link.href) {
            // Fetch TD from link
            // Note: In a real implementation, you'd want to fetch these TDs
            // For now, we'll create placeholder entries
            discovered.push({
              id: this.generateThingId({ title: link.title || 'Linked Thing' }),
              url: link.href,
              thingDescription: { title: link.title || 'Linked Thing', href: link.href },
              title: link.title || 'Linked Thing',
              description: link.description,
              discoveryMethod: 'well-known',
              lastSeen: new Date().toISOString(),
              online: true,
              validationStatus: 'pending',
            })
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse .well-known/wot response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    return discovered
  }

  /**
   * Generate a unique ID for a Thing from its TD
   */
  private generateThingId(td: any): string {
    // Try to use ID from TD, fallback to title-based ID
    if (td.id) return td.id
    if (td['@id']) return td['@id']
    
    const title = td.title || 'thing'
    const timestamp = Date.now()
    return `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`
  }
}

export const discoveryService = new DiscoveryService()