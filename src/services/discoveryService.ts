import { env } from '@/config/env'
import { useDiscoveryEndpointsStore } from '@/stores/discoveryEndpointsStore'

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

  /**
   * Discover Things from a list of base URLs using .well-known/wot
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

    for (const baseUrl of baseUrls) {
      if (this.abortController.signal.aborted) break

      result.progress.current = baseUrl
      onProgress?.(result.progress)

      try {
        const discovered = await this.scanWellKnown(baseUrl)
        result.discovered.push(...discovered)
      } catch (error) {
        result.errors.push({
          url: baseUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      result.progress.completed++
      onProgress?.(result.progress)
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
   * Scan a base URL for Thing Descriptions using .well-known/wot
   */
  async scanWellKnown(baseUrl: string): Promise<DiscoveredThing[]> {
    const wellKnownUrl = this.buildWellKnownUrl(baseUrl)
    
    try {
      const response = await fetch(wellKnownUrl, {
        signal: this.abortController?.signal,
        headers: {
          'Accept': 'application/json, application/ld+json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json') && !contentType.includes('application/ld+json')) {
        throw new Error('Invalid content type. Expected JSON or JSON-LD.')
      }

      const data = await response.json()
      
      // Handle different .well-known/wot response formats
      return this.parseWellKnownResponse(data, baseUrl)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Discovery cancelled')
      }
      throw new Error(`Failed to discover from ${wellKnownUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Discover a single Thing from a direct TD URL
   */
  async discoverSingleThing(url: string): Promise<DiscoveredThing> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json, application/ld+json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const td = await response.json()
      
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