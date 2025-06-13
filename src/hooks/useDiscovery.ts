import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { discoveryService, DiscoveredThing, DiscoveryProgress, DiscoveryResult } from '@/services/discoveryService'
import { queryKeys } from '@/config/queryClient'
import { useToast } from '@/stores/uiStore'
import { useThingsStore } from '@/stores/thingsStore'
import { transformDiscoveredThing } from '@/lib/thingTransforms'
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

