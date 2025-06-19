import { QueryClient } from '@tanstack/react-query'

// Create a query client with memory-optimized defaults for IoT dashboard
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time for IoT data - 30 seconds
      staleTime: 30 * 1000,
      // Cache time - 5 minutes (reduced for memory efficiency)
      gcTime: 5 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for real-time data
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Network mode for better offline handling
      networkMode: 'online',
      // Limit concurrent queries to prevent memory spikes
      meta: {
        maxConcurrent: 10
      }
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
      // Network mode for mutations
      networkMode: 'online',
    },
  },
  // Memory management configuration
  queryCache: undefined, // Use default with our settings
  mutationCache: undefined, // Use default
})

// Query keys factory for consistent cache management
export const queryKeys = {
  // Authentication
  auth: {
    user: ['auth', 'user'] as const,
    permissions: ['auth', 'permissions'] as const,
  },
  
  // Things
  things: {
    all: ['things'] as const,
    lists: () => [...queryKeys.things.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.things.lists(), filters] as const,
    details: () => [...queryKeys.things.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.things.details(), id] as const,
    properties: (id: string) => [...queryKeys.things.detail(id), 'properties'] as const,
    actions: (id: string) => [...queryKeys.things.detail(id), 'actions'] as const,
    events: (id: string) => [...queryKeys.things.detail(id), 'events'] as const,
  },
  
  // Discovery
  discovery: {
    all: ['discovery'] as const,
    scan: (url: string) => [...queryKeys.discovery.all, 'scan', url] as const,
    wellKnown: (url: string) => [...queryKeys.discovery.all, 'well-known', url] as const,
  },
  
  // Streams
  streams: {
    all: ['streams'] as const,
    pipelines: () => [...queryKeys.streams.all, 'pipelines'] as const,
    pipeline: (id: string) => [...queryKeys.streams.pipelines(), id] as const,
  },
  
  // Configuration
  config: {
    all: ['config'] as const,
    general: () => [...queryKeys.config.all, 'general'] as const,
    users: () => [...queryKeys.config.all, 'users'] as const,
  },
} as const