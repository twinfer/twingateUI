import { useEffect, useRef, useCallback } from 'react'
import { monitoringService } from '@/services/monitoringService'

/**
 * Hook for managing component memory lifecycle
 */
export function useMemoryManager() {
  const cleanupFunctions = useRef<Array<() => void>>([])
  const isUnmounted = useRef(false)

  const addCleanup = useCallback((cleanup: () => void) => {
    if (!isUnmounted.current) {
      cleanupFunctions.current.push(cleanup)
    }
  }, [])

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    })
    cleanupFunctions.current = []
  }, [])

  useEffect(() => {
    return () => {
      isUnmounted.current = true
      cleanup()
    }
  }, [cleanup])

  return { addCleanup, cleanup }
}

/**
 * Hook for monitoring service memory statistics
 */
export function useMemoryMonitoring(intervalMs: number = 30000) {
  const memoryStats = useRef<ReturnType<typeof monitoringService.getMemoryStats> | undefined>(undefined)
  const cleanupFunctions = useRef<Array<() => void>>([])

  useEffect(() => {
    const updateStats = () => {
      memoryStats.current = monitoringService.getMemoryStats()
    }

    // Initial update
    updateStats()

    // Set up interval
    const interval = setInterval(updateStats, intervalMs)
    cleanupFunctions.current.push(() => clearInterval(interval))

    return () => {
      clearInterval(interval)
      cleanupFunctions.current.forEach(fn => fn())
      cleanupFunctions.current = []
    }
  }, [intervalMs])

  const getStats = useCallback(() => memoryStats.current, [])

  const logStats = useCallback(() => {
    const stats = getStats()
    if (stats) {
      console.log('Memory Statistics:', stats)
    }
  }, [getStats])

  return { getStats, logStats }
}

/**
 * Hook for preventing memory leaks in event listeners
 */
export function useEventListener<T extends keyof WindowEventMap>(
  eventName: T,
  handler: (event: WindowEventMap[T]) => void,
  element: Window | Element = window,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler)
  const { addCleanup } = useMemoryManager()

  // Update ref when handler changes
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    // Create event listener that calls current handler
    const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[T])

    // Add event listener
    element.addEventListener(eventName, eventListener, options)

    // Register cleanup
    const cleanup = () => element.removeEventListener(eventName, eventListener, options)
    addCleanup(cleanup)

    // Return cleanup function
    return cleanup
  }, [eventName, element, options, addCleanup])
}

/**
 * Hook for managing WebSocket connections with automatic cleanup
 */
export function useWebSocket(url: string, options?: {
  onOpen?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  onError?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  protocols?: string | string[]
}) {
  const wsRef = useRef<WebSocket | null>(null)
  const { addCleanup } = useMemoryManager()

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return wsRef.current
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Create new connection
    const ws = new WebSocket(url, options?.protocols)
    wsRef.current = ws

    // Set up event handlers
    if (options?.onOpen) ws.addEventListener('open', options.onOpen)
    if (options?.onMessage) ws.addEventListener('message', options.onMessage)
    if (options?.onError) ws.addEventListener('error', options.onError)
    if (options?.onClose) ws.addEventListener('close', options.onClose)

    // Register cleanup
    const cleanup = () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
    addCleanup(cleanup)

    return ws
  }, [url, options, addCleanup])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data)
    } else {
      console.warn('WebSocket is not open. Current state:', wsRef.current?.readyState)
    }
  }, [])

  return {
    connect,
    disconnect,
    send,
    ws: wsRef.current,
    readyState: wsRef.current?.readyState
  }
}

/**
 * Hook for managing EventSource connections with automatic cleanup
 */
export function useEventSource(url: string, options?: {
  onOpen?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  onError?: (event: Event) => void
  withCredentials?: boolean
}) {
  const esRef = useRef<EventSource | null>(null)
  const { addCleanup } = useMemoryManager()

  const connect = useCallback(() => {
    if (esRef.current?.readyState === EventSource.OPEN) {
      return esRef.current
    }

    // Close existing connection if any
    if (esRef.current) {
      esRef.current.close()
    }

    // Create new connection
    const es = new EventSource(url, { withCredentials: options?.withCredentials })
    esRef.current = es

    // Set up event handlers
    if (options?.onOpen) es.addEventListener('open', options.onOpen)
    if (options?.onMessage) es.addEventListener('message', options.onMessage)
    if (options?.onError) es.addEventListener('error', options.onError)

    // Register cleanup
    const cleanup = () => {
      if (es.readyState !== EventSource.CLOSED) {
        es.close()
      }
    }
    addCleanup(cleanup)

    return es
  }, [url, options, addCleanup])

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
  }, [])

  return {
    connect,
    disconnect,
    eventSource: esRef.current,
    readyState: esRef.current?.readyState
  }
}

/**
 * Hook for managing intervals with automatic cleanup
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)
  const { addCleanup } = useMemoryManager()

  // Update ref when callback changes
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const interval = setInterval(() => savedCallback.current(), delay)
      addCleanup(() => clearInterval(interval))
      return () => clearInterval(interval)
    }
  }, [delay, addCleanup])
}

/**
 * Hook for managing timeouts with automatic cleanup
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)
  const { addCleanup } = useMemoryManager()

  // Update ref when callback changes
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const timeout = setTimeout(() => savedCallback.current(), delay)
      addCleanup(() => clearTimeout(timeout))
      return () => clearTimeout(timeout)
    }
  }, [delay, addCleanup])
}