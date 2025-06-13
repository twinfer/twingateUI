import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DiscoveryEndpoint {
  id: string
  name: string
  url: string
  baseUrl: string // The base URL (before /.well-known/wot)
  lastDiscovered?: string
  thingsCount: number
  status: 'active' | 'inactive' | 'error'
  lastError?: string
  description?: string
}

interface DiscoveryEndpointsStore {
  endpoints: DiscoveryEndpoint[]
  selectedEndpointId: string | null
  addEndpoint: (baseUrl: string, thingsFound: number) => void
  updateEndpoint: (id: string, updates: Partial<DiscoveryEndpoint>) => void
  removeEndpoint: (id: string) => void
  setSelectedEndpoint: (id: string | null) => void
  getEndpointByBaseUrl: (baseUrl: string) => DiscoveryEndpoint | undefined
  getSelectedEndpoint: () => DiscoveryEndpoint | null
}

export const useDiscoveryEndpointsStore = create<DiscoveryEndpointsStore>()(
  persist(
    (set, get) => ({
      endpoints: [
        // Initialize with some default endpoints for demo
        {
          id: 'local',
          name: 'Local Things',
          url: 'local://things',
          baseUrl: 'local',
          thingsCount: 0,
          status: 'active',
          description: 'Locally managed Thing Descriptions'
        },
        {
          id: 'eclipse-testthings',
          name: 'Eclipse Thingweb',
          url: 'https://github.com/eclipse-thingweb/test-things/.well-known/wot',
          baseUrl: 'https://github.com/eclipse-thingweb/test-things',
          thingsCount: 3,
          status: 'active',
          description: 'Eclipse Thingweb test Things collection',
          lastDiscovered: new Date().toISOString()
        }
      ],
      selectedEndpointId: null,

      addEndpoint: (baseUrl: string, thingsFound: number) => {
        const existing = get().getEndpointByBaseUrl(baseUrl)
        if (existing) {
          // Update existing endpoint
          set(state => ({
            endpoints: state.endpoints.map(endpoint =>
              endpoint.id === existing.id
                ? {
                    ...endpoint,
                    thingsCount: thingsFound,
                    lastDiscovered: new Date().toISOString(),
                    status: 'active' as const
                  }
                : endpoint
            )
          }))
        } else {
          // Add new endpoint
          const newEndpoint: DiscoveryEndpoint = {
            id: `endpoint-${Date.now()}`,
            name: extractEndpointName(baseUrl),
            url: `${baseUrl}/.well-known/wot`,
            baseUrl,
            thingsCount: thingsFound,
            status: 'active',
            lastDiscovered: new Date().toISOString(),
            description: `Discovered via ${baseUrl}`
          }
          
          set(state => ({
            endpoints: [...state.endpoints, newEndpoint]
          }))
        }
      },

      updateEndpoint: (id: string, updates: Partial<DiscoveryEndpoint>) => {
        set(state => ({
          endpoints: state.endpoints.map(endpoint =>
            endpoint.id === id ? { ...endpoint, ...updates } : endpoint
          )
        }))
      },

      removeEndpoint: (id: string) => {
        set(state => ({
          endpoints: state.endpoints.filter(endpoint => endpoint.id !== id),
          selectedEndpointId: state.selectedEndpointId === id ? null : state.selectedEndpointId
        }))
      },

      setSelectedEndpoint: (id: string | null) => {
        set({ selectedEndpointId: id })
      },

      getEndpointByBaseUrl: (baseUrl: string) => {
        return get().endpoints.find(endpoint => endpoint.baseUrl === baseUrl)
      },

      getSelectedEndpoint: () => {
        const { endpoints, selectedEndpointId } = get()
        return selectedEndpointId ? endpoints.find(e => e.id === selectedEndpointId) || null : null
      }
    }),
    {
      name: 'discovery-endpoints-storage',
      partialize: (state) => ({
        endpoints: state.endpoints,
        selectedEndpointId: state.selectedEndpointId
      })
    }
  )
)

// Helper function to extract a readable name from URL
function extractEndpointName(url: string): string {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname
    
    // Handle common cases
    if (hostname.includes('github.com')) {
      const pathParts = parsed.pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2) {
        return `${pathParts[0]}/${pathParts[1]}`
      }
    }
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return `Local (${parsed.port || '80'})`
    }
    
    // Remove www. and common subdomains
    const cleanHostname = hostname.replace(/^(www\.|api\.|iot\.)/, '')
    
    // Capitalize first letter
    return cleanHostname.charAt(0).toUpperCase() + cleanHostname.slice(1)
  } catch {
    // Fallback for invalid URLs
    return url.length > 30 ? url.substring(0, 30) + '...' : url
  }
}