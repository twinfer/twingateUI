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
  private eventSource?: EventSource
  private websocket?: WebSocket
  private subscriptions = new Map<string, MonitoringSubscription>()
  private propertyListeners = new Map<string, Set<(value: PropertyValue) => void>>()
  private eventListeners = new Map<string, Set<(event: WoTEvent) => void>>()
  private alertListeners = new Set<(alert: Alert) => void>()
  
  // Mock data generators for development
  private mockIntervals = new Map<string, NodeJS.Timeout>()
  private mockEventGenerators = new Map<string, NodeJS.Timeout>()

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
  }

  /**
   * Listen for property value updates
   */
  onPropertyUpdate(thingId: string, propertyName: string, callback: (value: PropertyValue) => void): () => void {
    const key = `${thingId}:${propertyName}`
    if (!this.propertyListeners.has(key)) {
      this.propertyListeners.set(key, new Set())
    }
    this.propertyListeners.get(key)!.add(callback)
    
    return () => {
      this.propertyListeners.get(key)?.delete(callback)
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
    this.eventListeners.get(key)!.add(callback)
    
    return () => {
      this.eventListeners.get(key)?.delete(callback)
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
    // TODO: Implement real SSE/WebSocket connections to TwinCore Gateway
    console.log('TODO: Establish real connection for subscription:', subscription)
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
   * Cleanup all connections and intervals
   */
  dispose(): void {
    // Clear all mock intervals
    this.mockIntervals.forEach(interval => clearInterval(interval))
    this.mockIntervals.clear()
    
    this.mockEventGenerators.forEach(interval => clearInterval(interval))
    this.mockEventGenerators.clear()
    
    // Close connections
    if (this.eventSource) {
      this.eventSource.close()
    }
    
    if (this.websocket) {
      this.websocket.close()
    }
    
    // Clear listeners
    this.propertyListeners.clear()
    this.eventListeners.clear()
    this.alertListeners.clear()
  }
}

export const monitoringService = new MonitoringService()