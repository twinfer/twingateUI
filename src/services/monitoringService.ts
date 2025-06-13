import { env } from '@/config/env'

export interface PropertyValue {
  thingId: string
  thingTitle: string
  propertyName: string
  value: any
  timestamp: string
  quality?: 'good' | 'bad' | 'uncertain'
  unit?: string
  dataType: string
}

export interface WoTEvent {
  id: string
  thingId: string
  thingTitle: string
  eventName: string
  data?: any
  timestamp: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  acknowledged: boolean
  description?: string
}

export interface MonitoringSubscription {
  id: string
  thingId: string
  type: 'property' | 'event' | 'all'
  target?: string // property name or event name
  active: boolean
  created: string
}

export interface AlertRule {
  id: string
  name: string
  description?: string
  thingId?: string // if null, applies to all things
  propertyName: string
  condition: {
    operator: '>' | '<' | '=' | '!=' | '>=' | '<=' | 'contains' | 'range'
    value: any
    value2?: any // for range operator
  }
  severity: 'info' | 'warning' | 'error' | 'critical'
  enabled: boolean
  notificationChannels: string[]
  cooldownMinutes: number
  created: string
  lastTriggered?: string
}

export interface Alert {
  id: string
  ruleId: string
  ruleName: string
  thingId: string
  thingTitle: string
  propertyName: string
  currentValue: any
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

class MonitoringService {
  // Connection pools for better resource management
  private eventSources = new Map<string, EventSource>()
  private websockets = new Map<string, WebSocket>()
  private subscriptions = new Map<string, MonitoringSubscription>()
  private propertyListeners = new Map<string, Set<(value: PropertyValue) => void>>()
  private eventListeners = new Map<string, Set<(event: WoTEvent) => void>>()
  private alertListeners = new Set<(alert: Alert) => void>()
  
  // Mock data generators for development
  private mockIntervals = new Map<string, NodeJS.Timeout>()
  private mockEventGenerators = new Map<string, NodeJS.Timeout>()
  
  // Connection recovery and lifecycle management
  private reconnectAttempts = new Map<string, number>()
  private readonly maxReconnectAttempts = 5
  private readonly baseReconnectDelay = 1000 // 1 second
  private readonly connectionTimeout = 10000 // 10 seconds
  private readonly maxIdleTime = 5 * 60 * 1000 // 5 minutes
  
  // Connection lifecycle tracking
  private connectionLastActivity = new Map<string, number>()
  private cleanupInterval?: NodeJS.Timeout
  private memoryCleanupInterval?: NodeJS.Timeout
  
  // Memory management
  private readonly maxListenersPerEvent = 10
  private readonly maxCachedConnections = 20

  constructor() {
    // Initialize memory management cleanup intervals
    this.startMemoryManagement()
  }

  /**
   * Start monitoring a Thing's properties and/or events
   */
  async subscribe(subscription: Omit<MonitoringSubscription, 'id' | 'created'>): Promise<string> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullSubscription: MonitoringSubscription = {
      ...subscription,
      id,
      created: new Date().toISOString(),
    }
    
    this.subscriptions.set(id, fullSubscription)
    
    // In development, start mock data generation
    if (import.meta.env.DEV) {
      this.startMockDataGeneration(fullSubscription)
    } else {
      // In production, establish real SSE/WebSocket connections
      await this.establishConnection(fullSubscription)
    }
    
    return id
  }

  /**
   * Stop monitoring a subscription
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) return
    
    this.subscriptions.delete(subscriptionId)
    
    // Clean up mock intervals
    const mockInterval = this.mockIntervals.get(subscriptionId)
    if (mockInterval) {
      clearInterval(mockInterval)
      this.mockIntervals.delete(subscriptionId)
    }
    
    const mockEventGen = this.mockEventGenerators.get(subscriptionId)
    if (mockEventGen) {
      clearInterval(mockEventGen)
      this.mockEventGenerators.delete(subscriptionId)
    }

    // Clean up real connections if no more subscriptions use them
    await this.cleanupUnusedConnections(subscription.thingId)
  }

  /**
   * Listen for property value updates
   */
  onPropertyUpdate(thingId: string, propertyName: string, callback: (value: PropertyValue) => void): () => void {
    const key = `${thingId}:${propertyName}`
    if (!this.propertyListeners.has(key)) {
      this.propertyListeners.set(key, new Set())
    }
    
    const listeners = this.propertyListeners.get(key)!
    
    // Prevent memory leaks by limiting listener count
    if (listeners.size >= this.maxListenersPerEvent) {
      console.warn(`Max listeners (${this.maxListenersPerEvent}) reached for property ${key}`)
      return () => {} // Return no-op cleanup function
    }
    
    listeners.add(callback)
    this.updateConnectionActivity(key)
    
    return () => {
      this.propertyListeners.get(key)?.delete(callback)
      // Clean up empty listener sets
      if (listeners.size === 0) {
        this.propertyListeners.delete(key)
      }
    }
  }

  /**
   * Listen for WoT events
   */
  onEvent(thingId: string, eventName: string, callback: (event: WoTEvent) => void): () => void {
    const key = `${thingId}:${eventName}`
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, new Set())
    }
    
    const listeners = this.eventListeners.get(key)!
    
    // Prevent memory leaks by limiting listener count
    if (listeners.size >= this.maxListenersPerEvent) {
      console.warn(`Max listeners (${this.maxListenersPerEvent}) reached for event ${key}`)
      return () => {} // Return no-op cleanup function
    }
    
    listeners.add(callback)
    this.updateConnectionActivity(key)
    
    return () => {
      this.eventListeners.get(key)?.delete(callback)
      // Clean up empty listener sets
      if (listeners.size === 0) {
        this.eventListeners.delete(key)
      }
    }
  }

  /**
   * Listen for alerts
   */
  onAlert(callback: (alert: Alert) => void): () => void {
    this.alertListeners.add(callback)
    return () => {
      this.alertListeners.delete(callback)
    }
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(): MonitoringSubscription[] {
    return Array.from(this.subscriptions.values())
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    // In development, just simulate acknowledgment
    console.log(`Alert ${alertId} acknowledged by ${userId}`)
  }

  /**
   * Get property history (mock implementation)
   */
  async getPropertyHistory(
    thingId: string, 
    propertyName: string, 
    startTime: string, 
    endTime: string
  ): Promise<PropertyValue[]> {
    // Generate mock historical data
    const history: PropertyValue[] = []
    const start = new Date(startTime)
    const end = new Date(endTime)
    const interval = Math.max(60000, (end.getTime() - start.getTime()) / 100) // Max 100 points
    
    for (let time = start.getTime(); time <= end.getTime(); time += interval) {
      history.push({
        thingId,
        thingTitle: `Thing ${thingId}`,
        propertyName,
        value: this.generateMockValue(propertyName),
        timestamp: new Date(time).toISOString(),
        quality: 'good',
        dataType: this.getDataType(propertyName),
      })
    }
    
    return history
  }

  /**
   * Start mock data generation for development
   */
  private startMockDataGeneration(subscription: MonitoringSubscription): void {
    if (subscription.type === 'property' || subscription.type === 'all') {
      const interval = setInterval(() => {
        const propertyValue: PropertyValue = {
          thingId: subscription.thingId,
          thingTitle: `Mock Thing ${subscription.thingId}`,
          propertyName: subscription.target || 'temperature',
          value: this.generateMockValue(subscription.target || 'temperature'),
          timestamp: new Date().toISOString(),
          quality: Math.random() > 0.1 ? 'good' : 'uncertain',
          dataType: this.getDataType(subscription.target || 'temperature'),
        }
        
        this.notifyPropertyListeners(propertyValue)
      }, 2000 + Math.random() * 3000) // 2-5 second intervals
      
      this.mockIntervals.set(subscription.id, interval)
    }
    
    if (subscription.type === 'event' || subscription.type === 'all') {
      const eventInterval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance of event
          const event: WoTEvent = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            thingId: subscription.thingId,
            thingTitle: `Mock Thing ${subscription.thingId}`,
            eventName: subscription.target || 'statusChange',
            data: { reason: 'periodic update', source: 'mock' },
            timestamp: new Date().toISOString(),
            severity: this.getRandomSeverity(),
            acknowledged: false,
            description: `Mock event from ${subscription.thingId}`,
          }
          
          this.notifyEventListeners(event)
        }
      }, 5000 + Math.random() * 10000) // 5-15 second intervals
      
      this.mockEventGenerators.set(subscription.id, eventInterval)
    }
  }

  /**
   * Establish real SSE/WebSocket connection (production)
   */
  private async establishConnection(subscription: MonitoringSubscription): Promise<void> {
    const connectionKey = `${subscription.thingId}:${subscription.type}`
    
    try {
      if (subscription.type === 'property' || subscription.type === 'all') {
        await this.establishSSEConnection(subscription)
      }
      
      if (subscription.type === 'event' || subscription.type === 'all') {
        await this.establishWebSocketConnection(subscription)
      }
      
      // Reset reconnect attempts on successful connection
      this.reconnectAttempts.delete(connectionKey)
      
    } catch (error) {
      console.error('Failed to establish connection:', error)
      await this.handleConnectionError(subscription, error)
    }
  }

  /**
   * Establish SSE connection for property monitoring
   */
  private async establishSSEConnection(subscription: MonitoringSubscription): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const connectionKey = `sse_${subscription.thingId}`
        const sseUrl = `${env.SSE_URL}/things/${subscription.thingId}/properties`
        
        // Reuse existing connection if available
        if (this.eventSources.has(connectionKey)) {
          const existingSource = this.eventSources.get(connectionKey)!
          if (existingSource.readyState === EventSource.OPEN) {
            this.updateConnectionActivity(connectionKey)
            resolve()
            return
          } else {
            // Clean up failed connection
            existingSource.close()
            this.eventSources.delete(connectionKey)
          }
        }
        
        const eventSource = new EventSource(sseUrl)
        this.eventSources.set(connectionKey, eventSource)
        
        // Set connection timeout
        const timeoutId = setTimeout(() => {
          eventSource.close()
          this.eventSources.delete(connectionKey)
          reject(new Error('SSE connection timeout'))
        }, this.connectionTimeout)
        
        eventSource.onopen = () => {
          clearTimeout(timeoutId)
          this.updateConnectionActivity(connectionKey)
          console.log(`SSE connection established for ${subscription.thingId}`)
          resolve()
        }
        
        eventSource.onerror = (error) => {
          clearTimeout(timeoutId)
          console.error('SSE connection error:', error)
          this.eventSources.delete(connectionKey)
          reject(new Error('SSE connection failed'))
        }
        
        eventSource.onmessage = (event) => {
          try {
            this.updateConnectionActivity(connectionKey)
            const propertyValue: PropertyValue = JSON.parse(event.data)
            this.notifyPropertyListeners(propertyValue)
          } catch (parseError) {
            console.error('Failed to parse SSE message:', parseError)
          }
        }
        
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Establish WebSocket connection for event monitoring
   */
  private async establishWebSocketConnection(subscription: MonitoringSubscription): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const connectionKey = `ws_${subscription.thingId}`
        const wsUrl = `${env.WS_URL}/things/${subscription.thingId}/events`
        
        // Reuse existing connection if available
        if (this.websockets.has(connectionKey)) {
          const existingSocket = this.websockets.get(connectionKey)!
          if (existingSocket.readyState === WebSocket.OPEN) {
            this.updateConnectionActivity(connectionKey)
            resolve()
            return
          } else {
            // Clean up failed connection
            existingSocket.close()
            this.websockets.delete(connectionKey)
          }
        }
        
        const websocket = new WebSocket(wsUrl)
        this.websockets.set(connectionKey, websocket)
        
        // Set connection timeout
        const timeoutId = setTimeout(() => {
          websocket.close()
          this.websockets.delete(connectionKey)
          reject(new Error('WebSocket connection timeout'))
        }, this.connectionTimeout)
        
        websocket.onopen = () => {
          clearTimeout(timeoutId)
          this.updateConnectionActivity(connectionKey)
          console.log(`WebSocket connection established for ${subscription.thingId}`)
          resolve()
        }
        
        websocket.onerror = (error) => {
          clearTimeout(timeoutId)
          console.error('WebSocket connection error:', error)
          this.websockets.delete(connectionKey)
          reject(new Error('WebSocket connection failed'))
        }
        
        websocket.onmessage = (event) => {
          try {
            this.updateConnectionActivity(connectionKey)
            const wotEvent: WoTEvent = JSON.parse(event.data)
            this.notifyEventListeners(wotEvent)
          } catch (parseError) {
            console.error('Failed to parse WebSocket message:', parseError)
          }
        }
        
        websocket.onclose = (event) => {
          this.websockets.delete(connectionKey)
          if (!event.wasClean) {
            console.warn('WebSocket connection closed unexpectedly')
            this.handleConnectionError(subscription, new Error('WebSocket closed unexpectedly'))
          }
        }
        
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Handle connection errors with retry logic
   */
  private async handleConnectionError(subscription: MonitoringSubscription, error: any): Promise<void> {
    const connectionKey = `${subscription.thingId}:${subscription.type}`
    const attempts = this.reconnectAttempts.get(connectionKey) || 0
    
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${connectionKey}`)
      // Fall back to mock data generation
      this.startMockDataGeneration(subscription)
      return
    }
    
    this.reconnectAttempts.set(connectionKey, attempts + 1)
    
    const delay = this.baseReconnectDelay * Math.pow(2, attempts)
    console.log(`Attempting to reconnect ${connectionKey} in ${delay}ms (attempt ${attempts + 1}/${this.maxReconnectAttempts})`)
    
    setTimeout(async () => {
      try {
        await this.establishConnection(subscription)
      } catch (retryError) {
        console.error('Reconnection failed:', retryError)
      }
    }, delay)
  }

  /**
   * Notify property listeners
   */
  private notifyPropertyListeners(value: PropertyValue): void {
    const key = `${value.thingId}:${value.propertyName}`
    const listeners = this.propertyListeners.get(key)
    if (listeners) {
      listeners.forEach(callback => callback(value))
    }
    
    // Also notify wildcard listeners
    const wildcardKey = `${value.thingId}:*`
    const wildcardListeners = this.propertyListeners.get(wildcardKey)
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => callback(value))
    }
  }

  /**
   * Notify event listeners
   */
  private notifyEventListeners(event: WoTEvent): void {
    const key = `${event.thingId}:${event.eventName}`
    const listeners = this.eventListeners.get(key)
    if (listeners) {
      listeners.forEach(callback => callback(event))
    }
    
    // Also notify wildcard listeners
    const wildcardKey = `${event.thingId}:*`
    const wildcardListeners = this.eventListeners.get(wildcardKey)
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => callback(event))
    }
  }

  /**
   * Generate mock values based on property name
   */
  private generateMockValue(propertyName: string): any {
    const name = propertyName.toLowerCase()
    
    if (name.includes('temperature')) {
      return Math.round((18 + Math.random() * 15) * 10) / 10 // 18-33°C
    }
    if (name.includes('humidity')) {
      return Math.round((30 + Math.random() * 40) * 10) / 10 // 30-70%
    }
    if (name.includes('pressure')) {
      return Math.round((980 + Math.random() * 40) * 10) / 10 // 980-1020 hPa
    }
    if (name.includes('brightness') || name.includes('light')) {
      return Math.round(Math.random() * 1000) // 0-1000 lux
    }
    if (name.includes('power') || name.includes('energy')) {
      return Math.round((10 + Math.random() * 90) * 100) / 100 // 10-100W
    }
    if (name.includes('status') || name.includes('state')) {
      return Math.random() > 0.8 ? 'off' : 'on'
    }
    if (name.includes('level') || name.includes('volume')) {
      return Math.round(Math.random() * 100) // 0-100%
    }
    
    // Default: random number
    return Math.round(Math.random() * 100 * 100) / 100
  }

  /**
   * Get data type based on property name
   */
  private getDataType(propertyName: string): string {
    const name = propertyName.toLowerCase()
    
    if (name.includes('status') || name.includes('state')) {
      return 'string'
    }
    if (name.includes('enabled') || name.includes('active')) {
      return 'boolean'
    }
    
    return 'number'
  }

  /**
   * Get random severity for mock events
   */
  private getRandomSeverity(): WoTEvent['severity'] {
    const severities: WoTEvent['severity'][] = ['info', 'warning', 'error', 'critical']
    const weights = [0.6, 0.25, 0.1, 0.05] // Most events are info
    
    const random = Math.random()
    let cumulative = 0
    
    for (let i = 0; i < severities.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return severities[i]
      }
    }
    
    return 'info'
  }

  /**
   * Start memory management cleanup intervals
   */
  private startMemoryManagement(): void {
    // Clean up idle connections every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections()
    }, 60000)
    
    // Full memory cleanup every 5 minutes
    this.memoryCleanupInterval = setInterval(() => {
      this.performMemoryCleanup()
    }, 5 * 60000)
  }

  /**
   * Update connection activity timestamp
   */
  private updateConnectionActivity(connectionKey: string): void {
    this.connectionLastActivity.set(connectionKey, Date.now())
  }

  /**
   * Clean up unused connections for a Thing
   */
  private async cleanupUnusedConnections(thingId: string): Promise<void> {
    // Check if any active subscriptions still need this Thing's connections
    const hasActiveSubscriptions = Array.from(this.subscriptions.values()).some(
      sub => sub.thingId === thingId && sub.active
    )
    
    if (!hasActiveSubscriptions) {
      // Close SSE connection
      const sseKey = `sse_${thingId}`
      const eventSource = this.eventSources.get(sseKey)
      if (eventSource) {
        eventSource.close()
        this.eventSources.delete(sseKey)
        this.connectionLastActivity.delete(sseKey)
        console.log(`Closed unused SSE connection for ${thingId}`)
      }
      
      // Close WebSocket connection
      const wsKey = `ws_${thingId}`
      const websocket = this.websockets.get(wsKey)
      if (websocket) {
        websocket.close()
        this.websockets.delete(wsKey)
        this.connectionLastActivity.delete(wsKey)
        console.log(`Closed unused WebSocket connection for ${thingId}`)
      }
    }
  }

  /**
   * Clean up idle connections
   */
  private cleanupIdleConnections(): void {
    const now = Date.now()
    
    // Clean up idle EventSource connections
    for (const [key, eventSource] of this.eventSources.entries()) {
      const lastActivity = this.connectionLastActivity.get(key) || 0
      if (now - lastActivity > this.maxIdleTime) {
        console.log(`Closing idle SSE connection: ${key}`)
        eventSource.close()
        this.eventSources.delete(key)
        this.connectionLastActivity.delete(key)
      }
    }
    
    // Clean up idle WebSocket connections
    for (const [key, websocket] of this.websockets.entries()) {
      const lastActivity = this.connectionLastActivity.get(key) || 0
      if (now - lastActivity > this.maxIdleTime) {
        console.log(`Closing idle WebSocket connection: ${key}`)
        websocket.close()
        this.websockets.delete(key)
        this.connectionLastActivity.delete(key)
      }
    }
  }

  /**
   * Perform comprehensive memory cleanup
   */
  private performMemoryCleanup(): void {
    // Clean up empty listener sets
    for (const [key, listeners] of this.propertyListeners.entries()) {
      if (listeners.size === 0) {
        this.propertyListeners.delete(key)
      }
    }
    
    for (const [key, listeners] of this.eventListeners.entries()) {
      if (listeners.size === 0) {
        this.eventListeners.delete(key)
      }
    }
    
    // Enforce maximum cached connections
    if (this.eventSources.size > this.maxCachedConnections) {
      console.warn(`Too many EventSource connections (${this.eventSources.size}), cleaning up oldest`)
      const sortedConnections = Array.from(this.connectionLastActivity.entries())
        .filter(([key]) => key.startsWith('sse_'))
        .sort((a, b) => a[1] - b[1])
      
      // Close oldest connections
      const toClose = sortedConnections.slice(0, this.eventSources.size - this.maxCachedConnections)
      for (const [key] of toClose) {
        const eventSource = this.eventSources.get(key)
        if (eventSource) {
          eventSource.close()
          this.eventSources.delete(key)
          this.connectionLastActivity.delete(key)
        }
      }
    }
    
    if (this.websockets.size > this.maxCachedConnections) {
      console.warn(`Too many WebSocket connections (${this.websockets.size}), cleaning up oldest`)
      const sortedConnections = Array.from(this.connectionLastActivity.entries())
        .filter(([key]) => key.startsWith('ws_'))
        .sort((a, b) => a[1] - b[1])
      
      // Close oldest connections
      const toClose = sortedConnections.slice(0, this.websockets.size - this.maxCachedConnections)
      for (const [key] of toClose) {
        const websocket = this.websockets.get(key)
        if (websocket) {
          websocket.close()
          this.websockets.delete(key)
          this.connectionLastActivity.delete(key)
        }
      }
    }
    
    // Log memory statistics
    console.debug('Memory cleanup completed:', {
      eventSources: this.eventSources.size,
      websockets: this.websockets.size,
      propertyListeners: this.propertyListeners.size,
      eventListeners: this.eventListeners.size,
      alertListeners: this.alertListeners.size,
      subscriptions: this.subscriptions.size
    })
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    connections: { eventSources: number; websockets: number }
    listeners: { properties: number; events: number; alerts: number }
    subscriptions: number
    activities: number
  } {
    return {
      connections: {
        eventSources: this.eventSources.size,
        websockets: this.websockets.size
      },
      listeners: {
        properties: this.propertyListeners.size,
        events: this.eventListeners.size,
        alerts: this.alertListeners.size
      },
      subscriptions: this.subscriptions.size,
      activities: this.connectionLastActivity.size
    }
  }

  /**
   * Cleanup all connections and intervals
   */
  dispose(): void {
    // Clear cleanup intervals
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval)
    }
    
    // Clear all mock intervals
    this.mockIntervals.forEach(interval => clearInterval(interval))
    this.mockIntervals.clear()
    
    this.mockEventGenerators.forEach(interval => clearInterval(interval))
    this.mockEventGenerators.clear()
    
    // Close all connections
    this.eventSources.forEach(eventSource => eventSource.close())
    this.eventSources.clear()
    
    this.websockets.forEach(websocket => websocket.close())
    this.websockets.clear()
    
    // Clear all data structures
    this.subscriptions.clear()
    this.propertyListeners.clear()
    this.eventListeners.clear()
    this.alertListeners.clear()
    this.connectionLastActivity.clear()
    this.reconnectAttempts.clear()
    
    console.log('MonitoringService disposed - all resources cleaned up')
  }
}

export const monitoringService = new MonitoringService()