import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { discoveryService, DiscoveredThing, DiscoveryProgress, DiscoveryResult } from '@/services/discoveryService'
import { queryKeys } from '@/config/queryClient'
import { useToast } from '@/stores/uiStore'
import { useThingsStore } from '@/stores/thingsStore'
import { useState, useCallback } from 'react'

export function useDiscoverThings() {
  const { showToast } = useToast()
  const [progress, setProgress] = useState<DiscoveryProgress | null>(null)

  const mutation = useMutation({
    mutationFn: async (baseUrls: string[]) => {
      setProgress({
        total: baseUrls.length,
        completed: 0,
        current: '',
        status: 'scanning'
      })

      return discoveryService.discoverThings(baseUrls, setProgress)
    },
    onSuccess: (result: DiscoveryResult) => {
      const { discovered, errors } = result
      
      showToast({
        title: 'Discovery completed',
        description: `Found ${discovered.length} Things${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
        type: discovered.length > 0 ? 'success' : 'warning',
      })

      // Update discovered things in store
      const { setDiscoveredThings } = useThingsStore.getState()
      setDiscoveredThings(discovered.map(transformDiscoveredThing))
    },
    onError: (error: Error) => {
      showToast({
        title: 'Discovery failed',
        description: error.message,
        type: 'error',
      })
      setProgress(null)
    },
    onSettled: () => {
      setProgress(null)
    }
  })

  const cancelDiscovery = useCallback(() => {
    discoveryService.cancelDiscovery()
    mutation.reset()
    setProgress(null)
  }, [mutation])

  return {
    discoverThings: mutation.mutate,
    isDiscovering: mutation.isPending,
    progress,
    result: mutation.data,
    error: mutation.error,
    cancelDiscovery,
  }
}

export function useDiscoverSingleThing() {
  const { showToast } = useToast()
  const { addDiscoveredThing } = useThingsStore()

  return useMutation({
    mutationFn: (url: string) => discoveryService.discoverSingleThing(url),
    onSuccess: (discovered: DiscoveredThing) => {
      showToast({
        title: 'Thing discovered',
        description: `Found "${discovered.title}"`,
        type: 'success',
      })

      // Add to discovered things
      addDiscoveredThing(transformDiscoveredThing(discovered))
    },
    onError: (error: Error) => {
      showToast({
        title: 'Discovery failed',
        description: error.message,
        type: 'error',
      })
    },
  })
}

export function useValidateTD() {
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (td: object) => discoveryService.validateTD(td),
    onSuccess: (result) => {
      const { isValid, errors, warnings } = result
      
      if (isValid) {
        showToast({
          title: 'Thing Description is valid',
          description: warnings.length > 0 ? `${warnings.length} warnings found` : undefined,
          type: 'success',
        })
      } else {
        showToast({
          title: 'Thing Description is invalid',
          description: `${errors.length} errors found`,
          type: 'error',
        })
      }
    },
    onError: (error: Error) => {
      showToast({
        title: 'Validation failed',
        description: error.message,
        type: 'error',
      })
    },
  })
}

export function useImportThing() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { importDiscoveredThing } = useThingsStore()

  return useMutation({
    mutationFn: async (discoveredThing: DiscoveredThing) => {
      // Transform discovered thing to Thing format
      const thing = transformDiscoveredThing(discoveredThing)
      
      // In a real app, you might want to save to backend here
      // For now, we'll just add to local store
      return thing
    },
    onSuccess: (thing) => {
      importDiscoveredThing(thing)
      
      // Invalidate things queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.things.all })
      
      showToast({
        title: 'Thing imported',
        description: `"${thing.title}" has been added to your Things`,
        type: 'success',
      })
    },
    onError: (error: Error) => {
      showToast({
        title: 'Import failed',
        description: error.message,
        type: 'error',
      })
    },
  })
}

export function useImportMultipleThings() {
  const { showToast } = useToast()
  const { setDiscoveredThings } = useThingsStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (discoveredThings: DiscoveredThing[]) => {
      // Transform all discovered things
      const things = discoveredThings.map(transformDiscoveredThing)
      
      // Import all things
      const { importDiscoveredThing } = useThingsStore.getState()
      for (const thing of things) {
        importDiscoveredThing(thing)
      }
      
      return things
    },
    onSuccess: (things) => {
      // Clear discovered things after import
      setDiscoveredThings([])
      
      // Invalidate things queries
      queryClient.invalidateQueries({ queryKey: queryKeys.things.all })
      
      showToast({
        title: 'Things imported',
        description: `${things.length} Things have been imported successfully`,
        type: 'success',
      })
    },
    onError: (error: Error) => {
      showToast({
        title: 'Batch import failed',
        description: error.message,
        type: 'error',
      })
    },
  })
}

// Utility function to transform DiscoveredThing to Thing
function transformDiscoveredThing(discovered: DiscoveredThing) {
  return {
    id: discovered.id,
    title: discovered.title,
    description: discovered.description,
    thingDescription: discovered.thingDescription,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    online: discovered.online,
    status: discovered.online ? 'online' as const : 'unknown' as const,
    url: discovered.url,
    lastSeen: new Date().toISOString(),
    discoveryMethod: discovered.discoveryMethod,
    properties: extractProperties(discovered.thingDescription),
    actions: extractActions(discovered.thingDescription),
    events: extractEvents(discovered.thingDescription),
    tags: extractTags(discovered.thingDescription),
    category: extractCategory(discovered.thingDescription),
  }
}

// Utility functions to extract TD components
function extractProperties(td: any) {
  if (!td.properties) return []
  
  return Object.entries(td.properties).map(([key, prop]: [string, any]) => ({
    id: key,
    name: prop.title || key,
    type: prop.type || 'unknown',
    value: null, // Will be populated when reading
    lastUpdated: new Date().toISOString(),
    writable: prop.writeOnly !== true,
    observable: prop.observable === true,
  }))
}

function extractActions(td: any) {
  if (!td.actions) return []
  
  return Object.entries(td.actions).map(([key, action]: [string, any]) => ({
    id: key,
    name: action.title || key,
    input: action.input,
    output: action.output,
    description: action.description,
  }))
}

function extractEvents(td: any) {
  if (!td.events) return []
  
  return Object.entries(td.events).map(([key, event]: [string, any]) => ({
    id: key,
    name: event.title || key,
    data: event.data,
    description: event.description,
  }))
}

function extractTags(td: any): string[] {
  const tags: string[] = []
  
  // Extract from @type
  if (td['@type']) {
    const types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']]
    tags.push(...types.filter((type: any) => typeof type === 'string'))
  }
  
  // Extract from security schemes
  if (td.securityDefinitions) {
    Object.keys(td.securityDefinitions).forEach(scheme => {
      tags.push(`security:${scheme}`)
    })
  }
  
  return tags
}

function extractCategory(td: any): string | undefined {
  // Try to determine category from @type or other metadata
  if (td['@type']) {
    const types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']]
    
    // Common IoT device categories
    for (const type of types) {
      if (typeof type === 'string') {
        if (type.includes('Sensor')) return 'sensor'
        if (type.includes('Actuator')) return 'actuator'
        if (type.includes('Light')) return 'lighting'
        if (type.includes('Thermostat') || type.includes('Temperature')) return 'climate'
        if (type.includes('Camera') || type.includes('Video')) return 'security'
        if (type.includes('Motor') || type.includes('Pump')) return 'actuator'
      }
    }
  }
  
  return 'other'
}