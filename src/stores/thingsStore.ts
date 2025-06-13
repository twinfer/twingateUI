import { create } from 'zustand'

export interface ThingProperty {
  id: string
  name: string
  type: string
  value: unknown
  lastUpdated: string
  writable: boolean
  observable: boolean
}

export interface ThingAction {
  id: string
  name: string
  input?: unknown
  output?: unknown
  description?: string
}

export interface ThingEvent {
  id: string
  name: string
  data?: unknown
  description?: string
}

export interface WoTThingDescription {
  '@context'?: string | string[]
  '@type'?: string | string[]
  id?: string
  title?: string
  description?: string
  properties?: Record<string, any>
  actions?: Record<string, any>
  events?: Record<string, any>
  links?: any[]
  forms?: any[]
  security?: string[]
  securityDefinitions?: Record<string, any>
  support?: string
  base?: string
  version?: any
  created?: string
  modified?: string
  [key: string]: any
}

export interface Thing {
  id: string
  title: string
  description?: string
  thingDescription: WoTThingDescription
  created: string
  modified: string
  online: boolean
  status: 'online' | 'offline' | 'unknown' | 'connecting'
  url?: string
  lastSeen?: string
  discoveryMethod?: 'well-known' | 'direct-url' | 'scan'
  properties: ThingProperty[]
  actions: ThingAction[]
  events: ThingEvent[]
  // 3D visualization
  position?: { x: number; y: number; z: number }
  model?: string
  // Additional metadata
  tags: string[]
  category?: string
  // Discovery metadata
  validationStatus?: 'valid' | 'invalid' | 'warning' | 'pending'
  validationErrors?: string[]
}

export interface ThingsState {
  // State
  things: Thing[]
  selectedThing: Thing | null
  filters: {
    search: string
    category: string | null
    online: boolean | null
    tags: string[]
    discoveryEndpoint: string | null
  }
  
  // Discovery state
  discoveredThings: Thing[]
  discoveryInProgress: boolean
  
  // Actions
  setThings: (things: Thing[]) => void
  addThing: (thing: Thing) => void
  updateThing: (id: string, updates: Partial<Thing>) => void
  removeThing: (id: string) => void
  deleteThing: (id: string) => void
  setSelectedThing: (thing: Thing | null) => void
  updateFilters: (filters: Partial<ThingsState['filters']>) => void
  clearFilters: () => void
  getFilteredThings: () => Thing[]
  setDiscoveryEndpointFilter: (endpointId: string | null) => void
  
  // Discovery actions
  setDiscoveredThings: (things: Thing[]) => void
  addDiscoveredThing: (thing: Thing) => void
  setDiscoveryInProgress: (inProgress: boolean) => void
  importDiscoveredThing: (thing: Thing) => void
  
  // Property actions
  updateProperty: (thingId: string, propertyId: string, value: unknown) => void
  
  // 3D positioning
  updateThingPosition: (id: string, position: { x: number; y: number; z: number }) => void
}

export const useThingsStore = create<ThingsState>((set, get) => ({
  // Initial state
  things: [],
  selectedThing: null,
  filters: {
    search: '',
    category: null,
    online: null,
    tags: [],
    discoveryEndpoint: null,
  },
  discoveredThings: [],
  discoveryInProgress: false,

  // Actions
  setThings: (things) => {
    set({ things })
  },

  addThing: (thing) => {
    set((state) => ({
      things: [...state.things, thing],
    }))
  },

  updateThing: (id, updates) => {
    set((state) => ({
      things: state.things.map((thing) =>
        thing.id === id ? { ...thing, ...updates } : thing
      ),
      selectedThing:
        state.selectedThing?.id === id
          ? { ...state.selectedThing, ...updates }
          : state.selectedThing,
    }))
  },

  removeThing: (id) => {
    set((state) => ({
      things: state.things.filter((thing) => thing.id !== id),
      selectedThing:
        state.selectedThing?.id === id ? null : state.selectedThing,
    }))
  },

  deleteThing: (id) => {
    set((state) => ({
      things: state.things.filter((thing) => thing.id !== id),
      selectedThing:
        state.selectedThing?.id === id ? null : state.selectedThing,
    }))
  },

  setSelectedThing: (selectedThing) => {
    set({ selectedThing })
  },

  updateFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        category: null,
        online: null,
        tags: [],
        discoveryEndpoint: null,
      },
    })
  },

  getFilteredThings: () => {
    const { things, filters } = get()
    return things.filter(thing => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (!thing.title.toLowerCase().includes(search) && 
            !thing.description?.toLowerCase().includes(search)) {
          return false
        }
      }

      // Category filter
      if (filters.category && thing.category !== filters.category) {
        return false
      }

      // Online status filter
      if (filters.online !== null) {
        const isOnline = thing.status === 'online'
        if (filters.online !== isOnline) {
          return false
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        if (!filters.tags.some(tag => thing.tags.includes(tag))) {
          return false
        }
      }

      // Discovery endpoint filter
      if (filters.discoveryEndpoint) {
        if (filters.discoveryEndpoint === 'local') {
          // Local things have no URL or discoveryMethod
          if (thing.url || thing.discoveryMethod) {
            return false
          }
        } else {
          // Things from specific discovery endpoints
          const endpointStore = require('./discoveryEndpointsStore').useDiscoveryEndpointsStore.getState()
          const endpoint = endpointStore.endpoints.find(e => e.id === filters.discoveryEndpoint)
          if (!endpoint || thing.url !== endpoint.baseUrl) {
            return false
          }
        }
      }

      return true
    })
  },

  setDiscoveryEndpointFilter: (endpointId: string | null) => {
    set(state => ({
      filters: { ...state.filters, discoveryEndpoint: endpointId }
    }))
  },

  // Discovery actions
  setDiscoveredThings: (discoveredThings) => {
    set({ discoveredThings })
  },

  addDiscoveredThing: (thing) => {
    set((state) => ({
      discoveredThings: [...state.discoveredThings, thing],
    }))
  },

  setDiscoveryInProgress: (discoveryInProgress) => {
    set({ discoveryInProgress })
  },

  importDiscoveredThing: (thing) => {
    const { addThing } = get()
    addThing(thing)
    set((state) => ({
      discoveredThings: state.discoveredThings.filter((t) => t.id !== thing.id),
    }))
  },

  // Property actions
  updateProperty: (thingId, propertyId, value) => {
    set((state) => ({
      things: state.things.map((thing) =>
        thing.id === thingId
          ? {
              ...thing,
              properties: thing.properties.map((prop) =>
                prop.id === propertyId
                  ? { ...prop, value, lastUpdated: new Date().toISOString() }
                  : prop
              ),
            }
          : thing
      ),
    }))
  },

  // 3D positioning
  updateThingPosition: (id, position) => {
    get().updateThing(id, { position })
  },
}))

// Selectors
export const useFilteredThings = () => {
  const { things, filters } = useThingsStore()
  
  return things.filter((thing) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (
        !thing.title.toLowerCase().includes(searchLower) &&
        !thing.description?.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }
    
    // Category filter
    if (filters.category && thing.category !== filters.category) {
      return false
    }
    
    // Online filter
    if (filters.online !== null && thing.online !== filters.online) {
      return false
    }
    
    // Tags filter
    if (filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) => thing.tags.includes(tag))
      if (!hasAllTags) {
        return false
      }
    }
    
    return true
  })
}