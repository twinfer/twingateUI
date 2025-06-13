import { measurePerformance } from '@/lib/memoryDiagnostics'

/**
 * Network optimization service with request deduplication, caching, and batching
 */

interface RequestConfig {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: string
  timeout?: number
  retries?: number
  cacheKey?: string
  cacheTTL?: number
  priority?: 'low' | 'normal' | 'high'
}

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
  etag?: string
  lastModified?: string
}

interface PendingRequest {
  promise: Promise<any>
  timestamp: number
  resolve: (value: any) => void
  reject: (error: any) => void
  config: RequestConfig
}

interface BatchRequest {
  requests: RequestConfig[]
  timestamp: number
  timeout: NodeJS.Timeout
}

interface NetworkStats {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  deduplicatedRequests: number
  batchedRequests: number
  errors: number
  averageResponseTime: number
  bytesTransferred: number
}

class NetworkOptimizer {
  private cache = new Map<string, CacheEntry>()
  private pendingRequests = new Map<string, PendingRequest>()
  private batchQueue = new Map<string, BatchRequest>()
  
  // Configuration
  private readonly defaultTimeout = 10000 // 10 seconds
  private readonly defaultCacheTTL = 5 * 60 * 1000 // 5 minutes
  private readonly batchDelay = 100 // 100ms
  private readonly maxBatchSize = 10
  private readonly maxCacheSize = 1000
  private readonly compressionThreshold = 1024 // 1KB
  
  // Statistics
  private stats: NetworkStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    deduplicatedRequests: 0,
    batchedRequests: 0,
    errors: 0,
    averageResponseTime: 0,
    bytesTransferred: 0
  }

  /**
   * Make an optimized HTTP request with deduplication and caching
   */
  async request<T = any>(config: RequestConfig): Promise<T> {
    this.stats.totalRequests++
    
    const requestKey = this.generateRequestKey(config)
    const cacheKey = config.cacheKey || requestKey
    
    // Check cache first
    if (config.method === 'GET' || !config.method) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        this.stats.cacheHits++
        return cached
      }
      this.stats.cacheMisses++
    }
    
    // Check for pending identical requests (deduplication)
    const existingRequest = this.pendingRequests.get(requestKey)
    if (existingRequest) {
      this.stats.deduplicatedRequests++
      return existingRequest.promise
    }
    
    // Create new request
    const requestPromise = this.executeRequest<T>(config, cacheKey)
    
    // Store as pending
    let resolveRef: (value: any) => void
    let rejectRef: (error: any) => void
    
    const pendingPromise = new Promise<T>((resolve, reject) => {
      resolveRef = resolve
      rejectRef = reject
    })
    
    this.pendingRequests.set(requestKey, {
      promise: pendingPromise,
      timestamp: Date.now(),
      resolve: resolveRef!,
      reject: rejectRef!,
      config
    })
    
    try {
      const result = await requestPromise
      resolveRef!(result)
      return result
    } catch (error) {
      rejectRef!(error)
      throw error
    } finally {
      this.pendingRequests.delete(requestKey)
    }
  }

  /**
   * Execute the actual HTTP request with optimizations
   */
  private async executeRequest<T>(config: RequestConfig, cacheKey: string): Promise<T> {
    const startTime = performance.now()
    
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), config.timeout || this.defaultTimeout)
      
      const requestInit: RequestInit = {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
          // Add compression headers if body is large enough
          ...(config.body && config.body.length > this.compressionThreshold 
            ? { 'Accept-Encoding': 'gzip, deflate, br' }
            : {}
          )
        },
        body: config.body,
        signal: controller.signal
      }
      
      // Add conditional request headers if we have cached data
      const cachedEntry = this.cache.get(cacheKey)
      if (cachedEntry && (config.method === 'GET' || !config.method)) {
        if (cachedEntry.etag) {
          requestInit.headers = { ...requestInit.headers, 'If-None-Match': cachedEntry.etag }
        }
        if (cachedEntry.lastModified) {
          requestInit.headers = { ...requestInit.headers, 'If-Modified-Since': cachedEntry.lastModified }
        }
      }
      
      const response = await measurePerformance(
        `network-request-${config.url}`,
        () => fetch(config.url, requestInit)
      )
      
      clearTimeout(timeout)
      
      // Handle 304 Not Modified
      if (response.status === 304 && cachedEntry) {
        // Update cache timestamp but keep existing data
        cachedEntry.timestamp = Date.now()
        this.stats.cacheHits++
        return cachedEntry.data
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Track transfer size
      const contentLength = response.headers.get('content-length')
      if (contentLength) {
        this.stats.bytesTransferred += parseInt(contentLength)
      }
      
      const data = await response.json()
      
      // Cache GET requests
      if (config.method === 'GET' || !config.method) {
        this.setCache(cacheKey, data, {
          ttl: config.cacheTTL || this.defaultCacheTTL,
          etag: response.headers.get('etag') || undefined,
          lastModified: response.headers.get('last-modified') || undefined
        })
      }
      
      // Update response time statistics
      const responseTime = performance.now() - startTime
      this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2
      
      return data
      
    } catch (error) {
      this.stats.errors++
      
      // Try to serve stale cache on error for GET requests
      if ((config.method === 'GET' || !config.method) && cachedEntry) {
        console.warn('Serving stale cache due to network error:', error)
        return cachedEntry.data
      }
      
      throw error
    }
  }

  /**
   * Batch multiple requests together
   */
  async batchRequest<T = any>(requests: RequestConfig[], batchKey?: string): Promise<T[]> {
    if (requests.length === 0) return []
    
    // If only one request, process normally
    if (requests.length === 1) {
      return [await this.request(requests[0])]
    }
    
    const key = batchKey || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Check if we can add to existing batch
    const existingBatch = this.batchQueue.get(key)
    if (existingBatch && existingBatch.requests.length + requests.length <= this.maxBatchSize) {
      existingBatch.requests.push(...requests)
      return this.waitForBatch(key)
    }
    
    // Create new batch
    const batchPromise = new Promise<T[]>((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          const batch = this.batchQueue.get(key)
          if (batch) {
            this.batchQueue.delete(key)
            this.stats.batchedRequests += batch.requests.length
            
            // Execute all requests concurrently
            const results = await Promise.allSettled(
              batch.requests.map(req => this.request(req))
            )
            
            const successfulResults = results.map(result => {
              if (result.status === 'fulfilled') {
                return result.value
              } else {
                throw result.reason
              }
            })
            
            resolve(successfulResults)
          }
        } catch (error) {
          reject(error)
        }
      }, this.batchDelay)
      
      this.batchQueue.set(key, {
        requests: [...requests],
        timestamp: Date.now(),
        timeout
      })
    })
    
    return batchPromise
  }

  /**
   * Wait for an existing batch to complete
   */
  private async waitForBatch<T>(batchKey: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const checkBatch = () => {
        const batch = this.batchQueue.get(batchKey)
        if (!batch) {
          // Batch completed, but we don't have access to the result
          // This is a limitation of the current implementation
          reject(new Error('Batch completed but result unavailable'))
          return
        }
        setTimeout(checkBatch, 10)
      }
      checkBatch()
    })
  }

  /**
   * Prefetch resources
   */
  async prefetch(urls: string[], priority: 'low' | 'normal' | 'high' = 'low'): Promise<void> {
    const requests = urls.map(url => ({
      url,
      priority,
      cacheTTL: this.defaultCacheTTL * 2 // Cache prefetched content longer
    }))
    
    // Use requestIdleCallback for low priority prefetching
    if (priority === 'low' && 'requestIdleCallback' in window) {
      return new Promise(resolve => {
        requestIdleCallback(async () => {
          await Promise.allSettled(requests.map(req => this.request(req)))
          resolve()
        })
      })
    }
    
    // Execute immediately for normal/high priority
    await Promise.allSettled(requests.map(req => this.request(req)))
  }

  /**
   * Generate a unique key for request deduplication
   */
  private generateRequestKey(config: RequestConfig): string {
    const { url, method = 'GET', body, headers } = config
    const headerStr = headers ? JSON.stringify(headers) : ''
    return `${method}:${url}:${body || ''}:${headerStr}`
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  private setCache(key: string, data: any, options: { ttl: number; etag?: string; lastModified?: string }): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: options.ttl,
      etag: options.etag,
      lastModified: options.lastModified
    })
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }
    
    // Clear cache entries matching pattern
    const regex = new RegExp(pattern)
    for (const [key] of this.cache.entries()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get network statistics
   */
  getStats(): NetworkStats {
    return { ...this.stats }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      deduplicatedRequests: 0,
      batchedRequests: 0,
      errors: 0,
      averageResponseTime: 0,
      bytesTransferred: 0
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    for (const [key, request] of this.pendingRequests.entries()) {
      request.reject(new Error('Request cancelled'))
      this.pendingRequests.delete(key)
    }
    
    for (const [key, batch] of this.batchQueue.entries()) {
      clearTimeout(batch.timeout)
      this.batchQueue.delete(key)
    }
  }

  /**
   * Get cache information
   */
  getCacheInfo(): {
    size: number
    keys: string[]
    totalSize: number
    hitRate: number
  } {
    const totalRequests = this.stats.cacheHits + this.stats.cacheMisses
    const hitRate = totalRequests > 0 ? this.stats.cacheHits / totalRequests : 0
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalSize: JSON.stringify(Array.from(this.cache.values())).length,
      hitRate
    }
  }
}

// Export singleton instance
export const networkOptimizer = new NetworkOptimizer()

// Export types
export type { RequestConfig, NetworkStats }