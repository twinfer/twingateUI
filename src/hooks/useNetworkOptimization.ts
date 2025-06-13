import { useCallback, useEffect, useRef, useState } from 'react'
import { networkOptimizer, type RequestConfig, type NetworkStats } from '@/services/networkOptimizer'
import { useMemoryManager } from './useMemoryManager'

/**
 * Hook for optimized HTTP requests with deduplication and caching
 */
export function useOptimizedRequest() {
  const { addCleanup } = useMemoryManager()

  const request = useCallback(async <T = any>(config: RequestConfig): Promise<T> => {
    return networkOptimizer.request<T>(config)
  }, [])

  const batchRequest = useCallback(async <T = any>(configs: RequestConfig[]): Promise<T[]> => {
    return networkOptimizer.batchRequest<T>(configs)
  }, [])

  const prefetch = useCallback(async (urls: string[], priority: 'low' | 'normal' | 'high' = 'low') => {
    return networkOptimizer.prefetch(urls, priority)
  }, [])

  const clearCache = useCallback((pattern?: string) => {
    networkOptimizer.clearCache(pattern)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    addCleanup(() => {
      // Cancel any pending requests when component unmounts
      networkOptimizer.cancelAllRequests()
    })
  }, [addCleanup])

  return {
    request,
    batchRequest,
    prefetch,
    clearCache
  }
}

/**
 * Hook for monitoring network performance
 */
export function useNetworkStats(refreshInterval: number = 5000) {
  const [stats, setStats] = useState<NetworkStats>(networkOptimizer.getStats())
  const [cacheInfo, setCacheInfo] = useState(networkOptimizer.getCacheInfo())
  const intervalRef = useRef<NodeJS.Timeout>()
  const { addCleanup } = useMemoryManager()

  useEffect(() => {
    const updateStats = () => {
      setStats(networkOptimizer.getStats())
      setCacheInfo(networkOptimizer.getCacheInfo())
    }

    updateStats() // Initial update
    
    intervalRef.current = setInterval(updateStats, refreshInterval)
    addCleanup(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    })

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refreshInterval, addCleanup])

  const resetStats = useCallback(() => {
    networkOptimizer.resetStats()
    setStats(networkOptimizer.getStats())
  }, [])

  return {
    stats,
    cacheInfo,
    resetStats
  }
}

/**
 * Hook for smart data fetching with network optimization
 */
export function useSmartFetch<T = any>(
  url: string | null,
  options: {
    enabled?: boolean
    cacheKey?: string
    cacheTTL?: number
    priority?: 'low' | 'normal' | 'high'
    refetchInterval?: number
    retries?: number
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  
  const { request } = useOptimizedRequest()
  const { addCleanup } = useMemoryManager()
  
  const {
    enabled = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    priority = 'normal',
    refetchInterval,
    retries = 2,
    onSuccess,
    onError
  } = options

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await request<T>({
        url,
        method: 'GET',
        cacheKey: cacheKey || `smart-fetch:${url}`,
        cacheTTL,
        priority,
        retries
      })

      setData(result)
      setLastFetch(Date.now())
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed')
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [url, enabled, cacheKey, cacheTTL, priority, retries, request, onSuccess, onError])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return

    const interval = setInterval(fetchData, refetchInterval)
    addCleanup(() => clearInterval(interval))

    return () => clearInterval(interval)
  }, [refetchInterval, enabled, fetchData, addCleanup])

  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    lastFetch,
    refetch
  }
}

/**
 * Hook for batched requests
 */
export function useBatchRequest() {
  const [pendingRequests, setPendingRequests] = useState<RequestConfig[]>([])
  const [batchResults, setBatchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const { batchRequest } = useOptimizedRequest()

  const addRequest = useCallback((config: RequestConfig) => {
    setPendingRequests(prev => [...prev, config])
  }, [])

  const removeRequest = useCallback((index: number) => {
    setPendingRequests(prev => prev.filter((_, i) => i !== index))
  }, [])

  const executeBatch = useCallback(async () => {
    if (pendingRequests.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const results = await batchRequest(pendingRequests)
      setBatchResults(results)
      setPendingRequests([]) // Clear after successful batch
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Batch request failed')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [pendingRequests, batchRequest])

  const clearBatch = useCallback(() => {
    setPendingRequests([])
    setBatchResults([])
    setError(null)
  }, [])

  return {
    pendingRequests,
    batchResults,
    loading,
    error,
    addRequest,
    removeRequest,
    executeBatch,
    clearBatch
  }
}

/**
 * Hook for prefetching resources
 */
export function usePrefetch() {
  const [prefetchedUrls, setPrefetchedUrls] = useState<Set<string>>(new Set())
  const { prefetch } = useOptimizedRequest()

  const prefetchResource = useCallback(async (
    url: string, 
    priority: 'low' | 'normal' | 'high' = 'low'
  ) => {
    if (prefetchedUrls.has(url)) return

    try {
      await prefetch([url], priority)
      setPrefetchedUrls(prev => new Set(prev).add(url))
    } catch (error) {
      console.warn('Prefetch failed for:', url, error)
    }
  }, [prefetch, prefetchedUrls])

  const prefetchMultiple = useCallback(async (
    urls: string[], 
    priority: 'low' | 'normal' | 'high' = 'low'
  ) => {
    const newUrls = urls.filter(url => !prefetchedUrls.has(url))
    if (newUrls.length === 0) return

    try {
      await prefetch(newUrls, priority)
      setPrefetchedUrls(prev => {
        const newSet = new Set(prev)
        newUrls.forEach(url => newSet.add(url))
        return newSet
      })
    } catch (error) {
      console.warn('Batch prefetch failed:', error)
    }
  }, [prefetch, prefetchedUrls])

  const isPrefetched = useCallback((url: string) => {
    return prefetchedUrls.has(url)
  }, [prefetchedUrls])

  const clearPrefetchCache = useCallback(() => {
    setPrefetchedUrls(new Set())
  }, [])

  return {
    prefetchResource,
    prefetchMultiple,
    isPrefetched,
    clearPrefetchCache,
    prefetchedCount: prefetchedUrls.size
  }
}

/**
 * Hook for connection health monitoring
 */
export function useConnectionHealth() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  const [lastCheck, setLastCheck] = useState<number>(Date.now())
  
  const { addCleanup } = useMemoryManager()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastCheck(Date.now())
    }

    const handleOffline = () => {
      setIsOnline(false)
      setLastCheck(Date.now())
    }

    // Check connection type if available
    const updateConnectionType = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown')
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    updateConnectionType()

    // Set up periodic connection checks
    const interval = setInterval(() => {
      setLastCheck(Date.now())
      updateConnectionType()
    }, 30000) // Check every 30 seconds

    addCleanup(() => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [addCleanup])

  const checkConnection = useCallback(async () => {
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      setIsOnline(response.ok)
      setLastCheck(Date.now())
      return response.ok
    } catch {
      setIsOnline(false)
      setLastCheck(Date.now())
      return false
    }
  }, [])

  return {
    isOnline,
    connectionType,
    lastCheck,
    checkConnection
  }
}