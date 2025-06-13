import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { monitoringService, PropertyValue, WoTEvent, Alert, AlertRule, MonitoringSubscription } from '@/services/monitoringService'

export interface MonitoringState {
  // Subscriptions
  subscriptions: MonitoringSubscription[]
  
  // Real-time data
  propertyValues: Map<string, PropertyValue> // key: thingId:propertyName
  recentEvents: WoTEvent[]
  activeAlerts: Alert[]
  
  // Alert rules
  alertRules: AlertRule[]
  
  // UI state
  selectedThingIds: string[]
  selectedProperties: string[]
  autoScroll: boolean
  maxEvents: number
  
  // Actions
  addSubscription: (subscription: Omit<MonitoringSubscription, 'id' | 'created'>) => Promise<string>
  removeSubscription: (subscriptionId: string) => Promise<void>
  updatePropertyValue: (value: PropertyValue) => void
  addEvent: (event: WoTEvent) => void
  addAlert: (alert: Alert) => void
  acknowledgeAlert: (alertId: string, userId: string) => Promise<void>
  
  // Alert rules
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'created'>) => void
  updateAlertRule: (ruleId: string, updates: Partial<AlertRule>) => void
  deleteAlertRule: (ruleId: string) => void
  toggleAlertRule: (ruleId: string) => void
  
  // Filters and UI
  setSelectedThings: (thingIds: string[]) => void
  setSelectedProperties: (properties: string[]) => void
  setAutoScroll: (enabled: boolean) => void
  setMaxEvents: (max: number) => void
  clearEvents: () => void
  clearAlerts: () => void
  
  // Data access
  getPropertyHistory: (thingId: string, propertyName: string, hours: number) => PropertyValue[]
  getEventsByThing: (thingId: string) => WoTEvent[]
  getAlertsByRule: (ruleId: string) => Alert[]
  getActiveSubscriptions: () => MonitoringSubscription[]
}

const useMonitoringStore = create<MonitoringState>()(
  persist(
    (set, get) => ({
      // Initial state
      subscriptions: [],
      propertyValues: new Map(),
      recentEvents: [],
      activeAlerts: [],
      alertRules: [],
      selectedThingIds: [],
      selectedProperties: [],
      autoScroll: true,
      maxEvents: 1000,

      // Subscription management
      addSubscription: async (subscription) => {
        const subscriptionId = await monitoringService.subscribe(subscription)
        
        set((state) => ({
          subscriptions: [...state.subscriptions, {
            ...subscription,
            id: subscriptionId,
            created: new Date().toISOString(),
          }]
        }))
        
        return subscriptionId
      },

      removeSubscription: async (subscriptionId) => {
        await monitoringService.unsubscribe(subscriptionId)
        
        set((state) => ({
          subscriptions: state.subscriptions.filter(sub => sub.id !== subscriptionId)
        }))
      },

      // Real-time data updates
      updatePropertyValue: (value) => {
        set((state) => {
          const key = `${value.thingId}:${value.propertyName}`
          const newValues = new Map(state.propertyValues)
          newValues.set(key, value)
          
          return { propertyValues: newValues }
        })
      },

      addEvent: (event) => {
        set((state) => {
          const newEvents = [event, ...state.recentEvents]
          
          // Limit the number of events to prevent memory issues
          const trimmedEvents = newEvents.slice(0, state.maxEvents)
          
          return { recentEvents: trimmedEvents }
        })
      },

      addAlert: (alert) => {
        set((state) => ({
          activeAlerts: [alert, ...state.activeAlerts]
        }))
      },

      acknowledgeAlert: async (alertId, userId) => {
        await monitoringService.acknowledgeAlert(alertId, userId)
        
        set((state) => ({
          activeAlerts: state.activeAlerts.map(alert =>
            alert.id === alertId
              ? {
                  ...alert,
                  acknowledged: true,
                  acknowledgedBy: userId,
                  acknowledgedAt: new Date().toISOString(),
                }
              : alert
          )
        }))
      },

      // Alert rules management
      addAlertRule: (rule) => {
        const newRule: AlertRule = {
          ...rule,
          id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created: new Date().toISOString(),
        }
        
        set((state) => ({
          alertRules: [...state.alertRules, newRule]
        }))
      },

      updateAlertRule: (ruleId, updates) => {
        set((state) => ({
          alertRules: state.alertRules.map(rule =>
            rule.id === ruleId ? { ...rule, ...updates } : rule
          )
        }))
      },

      deleteAlertRule: (ruleId) => {
        set((state) => ({
          alertRules: state.alertRules.filter(rule => rule.id !== ruleId)
        }))
      },

      toggleAlertRule: (ruleId) => {
        set((state) => ({
          alertRules: state.alertRules.map(rule =>
            rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
          )
        }))
      },

      // UI state management
      setSelectedThings: (thingIds) => {
        set({ selectedThingIds: thingIds })
      },

      setSelectedProperties: (properties) => {
        set({ selectedProperties: properties })
      },

      setAutoScroll: (enabled) => {
        set({ autoScroll: enabled })
      },

      setMaxEvents: (max) => {
        set({ maxEvents: max })
      },

      clearEvents: () => {
        set({ recentEvents: [] })
      },

      clearAlerts: () => {
        set({ activeAlerts: [] })
      },

      // Data access helpers
      getPropertyHistory: (thingId, propertyName, hours) => {
        const state = get()
        const key = `${thingId}:${propertyName}`
        const currentValue = state.propertyValues.get(key)
        
        if (!currentValue) return []
        
        // For now, return just the current value
        // In a real implementation, this would fetch historical data
        return [currentValue]
      },

      getEventsByThing: (thingId) => {
        const state = get()
        return state.recentEvents.filter(event => event.thingId === thingId)
      },

      getAlertsByRule: (ruleId) => {
        const state = get()
        return state.activeAlerts.filter(alert => alert.ruleId === ruleId)
      },

      getActiveSubscriptions: () => {
        const state = get()
        return state.subscriptions.filter(sub => sub.active)
      },
    }),
    {
      name: 'monitoring-store',
      partialize: (state) => ({
        alertRules: state.alertRules,
        selectedThingIds: state.selectedThingIds,
        selectedProperties: state.selectedProperties,
        autoScroll: state.autoScroll,
        maxEvents: state.maxEvents,
      }),
    }
  )
)

export { useMonitoringStore }