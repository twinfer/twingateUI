import { networkOptimizer, type RequestConfig } from './networkOptimizer'
import { createApiConfiguration } from './api'
import { env } from '@/config/env'

/**
 * Optimized API service with request batching, deduplication, and intelligent caching
 */

interface ApiRequestOptions {
  cache?: boolean
  cacheTTL?: number
  priority?: 'low' | 'normal' | 'high'
  retries?: number
  timeout?: number
  batch?: boolean
  batchKey?: string
}

interface BatchedApiCall {
  endpoint: string
  method: string
  data?: any
  options?: ApiRequestOptions
}

interface ApiResponse<T = any> {
  data: T
  status: number
  headers: Record<string, string>
  cached: boolean
}

class OptimizedApiService {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private batchQueue = new Map<string, BatchedApiCall[]>()
  private batchTimeouts = new Map<string, NodeJS.Timeout>()
  private readonly batchDelay = 50 // 50ms batch window
  private readonly maxBatchSize = 20

  constructor() {
    const config = createApiConfiguration()
    this.baseUrl = config.basePath || env.API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(config.accessToken ? { 'Authorization': `Bearer ${config.accessToken}` } : {})
    }
  }

  /**
   * Make an optimized API request
   */
  async request<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      cache = method === 'GET',
      cacheTTL = 5 * 60 * 1000, // 5 minutes for GET requests
      priority = 'normal',
      retries = method === 'GET' ? 3 : 1,
      timeout = 30000,
      batch = false,
      batchKey
    } = options

    // Handle batching for eligible requests
    if (batch && (method === 'GET' || method === 'POST')) {
      return this.addToBatch<T>(endpoint, method, data, options, batchKey)
    }

    const url = this.buildUrl(endpoint)
    const requestConfig: RequestConfig = {
      url,
      method,
      headers: {
        ...this.defaultHeaders,
        ...(method !== 'GET' && data ? {} : { 'Cache-Control': 'max-age=300' })
      },
      body: data ? JSON.stringify(data) : undefined,
      timeout,
      retries,
      priority,
      ...(cache && {
        cacheKey: `api:${method}:${endpoint}${data ? ':' + JSON.stringify(data) : ''}`,
        cacheTTL
      })
    }

    try {
      const response = await networkOptimizer.request<any>(requestConfig)
      
      return {
        data: response,
        status: 200, // networkOptimizer doesn't expose status code directly
        headers: {},
        cached: false // This would need to be tracked by networkOptimizer
      }
    } catch (error) {
      throw this.handleApiError(error, endpoint, method)
    }
  }

  /**
   * Batch multiple API calls
   */
  private async addToBatch<T>(
    endpoint: string,
    method: string,
    data?: any,
    options?: ApiRequestOptions,
    batchKey?: string
  ): Promise<ApiResponse<T>> {
    const key = batchKey || 'default'
    
    return new Promise((resolve, reject) => {
      const batchCall: BatchedApiCall = {
        endpoint,
        method,
        data,
        options
      }

      // Add to batch queue
      if (!this.batchQueue.has(key)) {
        this.batchQueue.set(key, [])
      }
      
      const queue = this.batchQueue.get(key)!
      queue.push(batchCall)

      // Store resolve/reject for this specific call
      ;(batchCall as any)._resolve = resolve
      ;(batchCall as any)._reject = reject

      // Set up batch execution if not already scheduled
      if (!this.batchTimeouts.has(key)) {
        const timeout = setTimeout(() => {
          this.executeBatch(key)
        }, this.batchDelay)
        
        this.batchTimeouts.set(key, timeout)
      }

      // Execute immediately if batch is full
      if (queue.length >= this.maxBatchSize) {
        clearTimeout(this.batchTimeouts.get(key)!)
        this.batchTimeouts.delete(key)
        this.executeBatch(key)
      }
    })
  }

  /**
   * Execute a batch of API calls
   */
  private async executeBatch(batchKey: string): Promise<void> {
    const queue = this.batchQueue.get(batchKey)
    if (!queue || queue.length === 0) return

    // Clear the queue
    this.batchQueue.delete(batchKey)
    this.batchTimeouts.delete(batchKey)

    try {
      // Group by method for optimal batching
      const getRequests = queue.filter(call => call.method === 'GET')
      const postRequests = queue.filter(call => call.method === 'POST')

      // Execute GET requests in parallel
      if (getRequests.length > 0) {
        const getConfigs = getRequests.map(call => ({
          url: this.buildUrl(call.endpoint),
          method: 'GET' as const,
          headers: this.defaultHeaders,
          timeout: call.options?.timeout || 30000,
          retries: call.options?.retries || 3,
          priority: call.options?.priority || 'normal' as const,
          cacheKey: `api:GET:${call.endpoint}`,
          cacheTTL: call.options?.cacheTTL || 5 * 60 * 1000
        }))

        const getResults = await networkOptimizer.batchRequest(getConfigs)
        
        getRequests.forEach((call, index) => {
          const resolve = (call as any)._resolve
          if (resolve) {
            resolve({
              data: getResults[index],
              status: 200,
              headers: {},
              cached: false
            })
          }
        })
      }

      // Execute POST requests individually (usually not cacheable)
      for (const call of postRequests) {
        try {
          const result = await this.request(
            call.endpoint,
            call.method as any,
            call.data,
            { ...call.options, batch: false }
          )
          
          const resolve = (call as any)._resolve
          if (resolve) resolve(result)
        } catch (error) {
          const reject = (call as any)._reject
          if (reject) reject(error)
        }
      }

    } catch (error) {
      // Reject all pending calls in this batch
      queue.forEach(call => {
        const reject = (call as any)._reject
        if (reject) reject(error)
      })
    }
  }

  /**
   * GET request with optimized caching
   */
  async get<T = any>(
    endpoint: string, 
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
      ...options
    })
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string, 
    data?: any, 
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, {
      cache: false,
      retries: 1,
      ...options
    })
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string, 
    data?: any, 
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, {
      cache: false,
      retries: 1,
      ...options
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string, 
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, {
      cache: false,
      retries: 1,
      ...options
    })
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string, 
    data?: any, 
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data, {
      cache: false,
      retries: 1,
      ...options
    })
  }

  /**
   * Batch GET requests
   */
  async batchGet<T = any>(
    endpoints: string[], 
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>[]> {
    const requests = endpoints.map(endpoint => ({
      url: this.buildUrl(endpoint),
      method: 'GET' as const,
      headers: this.defaultHeaders,
      timeout: options?.timeout || 30000,
      retries: options?.retries || 3,
      priority: options?.priority || 'normal' as const,
      cacheKey: `api:GET:${endpoint}`,
      cacheTTL: options?.cacheTTL || 5 * 60 * 1000
    }))

    const results = await networkOptimizer.batchRequest<T>(requests)
    
    return results.map(data => ({
      data,
      status: 200,
      headers: {},
      cached: false
    }))
  }

  /**
   * Prefetch endpoints for better performance
   */
  async prefetch(
    endpoints: string[], 
    priority: 'low' | 'normal' | 'high' = 'low'
  ): Promise<void> {
    const urls = endpoints.map(endpoint => this.buildUrl(endpoint))
    await networkOptimizer.prefetch(urls, priority)
  }

  /**
   * Clear API cache
   */
  clearCache(pattern?: string): void {
    networkOptimizer.clearCache(pattern ? `api:${pattern}` : 'api:')
  }

  /**
   * Get network statistics
   */
  getNetworkStats() {
    return networkOptimizer.getStats()
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    // Clear batch queues
    for (const [key, calls] of this.batchQueue.entries()) {
      calls.forEach(call => {
        const reject = (call as any)._reject
        if (reject) reject(new Error('Request cancelled'))
      })
    }
    this.batchQueue.clear()

    // Clear timeouts
    for (const timeout of this.batchTimeouts.values()) {
      clearTimeout(timeout)
    }
    this.batchTimeouts.clear()

    // Cancel network optimizer requests
    networkOptimizer.cancelAllRequests()
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) return endpoint
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${this.baseUrl}${cleanEndpoint}`
  }

  /**
   * Handle API errors with enhanced context
   */
  private handleApiError(error: any, endpoint: string, method: string): Error {
    const message = error instanceof Error ? error.message : 'Unknown API error'
    const enhancedError = new Error(`API ${method} ${endpoint}: ${message}`)
    
    // Preserve original error properties
    if (error instanceof Error) {
      Object.assign(enhancedError, {
        name: error.name,
        stack: error.stack,
        cause: error
      })
    }
    
    return enhancedError
  }

  /**
   * Update authentication token
   */
  updateAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  /**
   * Remove authentication token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization']
  }
}

// Export singleton instance
export const optimizedApiService = new OptimizedApiService()

// Export types
export type { ApiRequestOptions, ApiResponse, BatchedApiCall }