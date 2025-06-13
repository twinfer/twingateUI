import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Radio, Play, Square, Trash2, Filter, Download } from 'lucide-react'
import { Thing } from '@/stores/thingsStore'
import { toast } from 'sonner'

interface ThingEventsProps {
  thing: Thing
  events: [string, any][]
}

interface EventMessage {
  id: string
  eventName: string
  data: any
  timestamp: string
  source: 'sse' | 'websocket' | 'mock'
}

interface EventSubscription {
  eventName: string
  isActive: boolean
  messageCount: number
  lastMessage?: EventMessage
}

export function ThingEvents({ thing, events }: ThingEventsProps) {
  const [subscriptions, setSubscriptions] = useState<{ [key: string]: EventSubscription }>({})
  const [eventMessages, setEventMessages] = useState<EventMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [maxMessages, setMaxMessages] = useState(100)
  const eventSourceRef = useRef<EventSource | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const mockIntervalRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // Initialize subscriptions
  useEffect(() => {
    const initialSubscriptions: { [key: string]: EventSubscription } = {}
    events.forEach(([name]) => {
      initialSubscriptions[name] = {
        eventName: name,
        isActive: false,
        messageCount: 0
      }
    })
    setSubscriptions(initialSubscriptions)
  }, [events])

  // Mock event generation for demo purposes
  const generateMockEvent = (eventName: string, eventSchema: any) => {
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    let mockData
    if (eventSchema.data?.type === 'object' && eventSchema.data.properties) {
      mockData = {}
      Object.entries(eventSchema.data.properties).forEach(([prop, schema]: [string, any]) => {
        switch (schema.type) {
          case 'number':
            mockData[prop] = Math.round((Math.random() * 100) * 100) / 100
            break
          case 'integer':
            mockData[prop] = Math.floor(Math.random() * 100)
            break
          case 'boolean':
            mockData[prop] = Math.random() > 0.5
            break
          case 'string':
            if (schema.enum) {
              mockData[prop] = schema.enum[Math.floor(Math.random() * schema.enum.length)]
            } else {
              mockData[prop] = `value-${Math.floor(Math.random() * 1000)}`
            }
            break
          default:
            mockData[prop] = `mock-${Math.floor(Math.random() * 1000)}`
        }
      })
    } else {
      // Generate simple mock data based on event name
      if (eventName.toLowerCase().includes('temperature')) {
        mockData = { temperature: Math.round((Math.random() * 40 + 10) * 100) / 100, unit: 'celsius' }
      } else if (eventName.toLowerCase().includes('motion')) {
        mockData = { detected: Math.random() > 0.7, confidence: Math.round(Math.random() * 100) }
      } else if (eventName.toLowerCase().includes('error') || eventName.toLowerCase().includes('alert')) {
        mockData = { 
          level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
          message: 'Mock event message'
        }
      } else {
        mockData = { 
          value: Math.floor(Math.random() * 100),
          status: 'active',
          timestamp: new Date().toISOString()
        }
      }
    }

    const message: EventMessage = {
      id: eventId,
      eventName,
      data: mockData,
      timestamp: new Date().toISOString(),
      source: 'mock'
    }

    setEventMessages(prev => [message, ...prev.slice(0, maxMessages - 1)])
    setSubscriptions(prev => ({
      ...prev,
      [eventName]: {
        ...prev[eventName],
        messageCount: prev[eventName].messageCount + 1,
        lastMessage: message
      }
    }))
  }

  const toggleSubscription = (eventName: string) => {
    const currentSub = subscriptions[eventName]
    const newState = !currentSub.isActive

    setSubscriptions(prev => ({
      ...prev,
      [eventName]: {
        ...prev[eventName],
        isActive: newState
      }
    }))

    if (newState) {
      // Start mock event generation
      const eventSchema = events.find(([name]) => name === eventName)?.[1]
      const interval = setInterval(() => {
        // Generate events at random intervals (1-10 seconds)
        if (Math.random() > 0.3) { // 70% chance per interval
          generateMockEvent(eventName, eventSchema)
        }
      }, Math.random() * 5000 + 2000) // 2-7 seconds

      mockIntervalRef.current[eventName] = interval
      toast.success(`Subscribed to ${eventName} events`)
    } else {
      // Stop mock event generation
      if (mockIntervalRef.current[eventName]) {
        clearInterval(mockIntervalRef.current[eventName])
        delete mockIntervalRef.current[eventName]
      }
      toast.info(`Unsubscribed from ${eventName} events`)
    }
  }

  const connectToEventStream = () => {
    // In a real implementation, this would connect to the actual Thing's event stream
    // For demo purposes, we'll simulate connection
    setIsConnected(true)
    toast.success('Connected to event stream')
  }

  const disconnectFromEventStream = () => {
    // Stop all subscriptions
    Object.keys(subscriptions).forEach(eventName => {
      if (subscriptions[eventName].isActive) {
        toggleSubscription(eventName)
      }
    })

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (wsRef.current) {
      wsRef.current.close()
    }

    setIsConnected(false)
    toast.info('Disconnected from event stream')
  }

  const clearMessages = () => {
    setEventMessages([])
    setSubscriptions(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(key => {
        updated[key] = { ...updated[key], messageCount: 0, lastMessage: undefined }
      })
      return updated
    })
    toast.info('Event messages cleared')
  }

  const exportMessages = () => {
    const data = JSON.stringify(eventMessages, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${thing.title}-events-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Events exported')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(mockIntervalRef.current).forEach(interval => clearInterval(interval))
      if (eventSourceRef.current) eventSourceRef.current.close()
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const getEventIcon = (eventName: string) => {
    const name = eventName.toLowerCase()
    if (name.includes('radio') || name.includes('broadcast')) {
      return <Radio className="h-4 w-4" />
    }
    return <Radio className="h-4 w-4" />
  }

  const formatEventData = (data: any) => {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2)
    }
    return String(data)
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Events
          </CardTitle>
          <CardDescription>
            This Thing has no events defined.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Event Stream
              </CardTitle>
              <CardDescription>
                Real-time event monitoring and subscription management
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={isConnected ? 
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {isConnected ? (
                <Button onClick={disconnectFromEventStream} variant="outline" size="sm">
                  <Square className="h-3 w-3 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button onClick={connectToEventStream} size="sm">
                  <Play className="h-3 w-3 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Event Subscriptions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Event Subscriptions ({events.length})
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total messages: {eventMessages.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(([name, event]) => {
            const subscription = subscriptions[name]
            return (
              <Card key={name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEventIcon(name)}
                      <CardTitle className="text-sm font-medium">
                        {event.title || name}
                      </CardTitle>
                    </div>
                    <Switch
                      checked={subscription?.isActive || false}
                      onCheckedChange={() => toggleSubscription(name)}
                      disabled={!isConnected}
                    />
                  </div>
                  {event.description && (
                    <CardDescription className="text-xs">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Messages:</span>
                      <span className="font-mono">{subscription?.messageCount || 0}</span>
                    </div>
                    {subscription?.lastMessage && (
                      <div className="flex justify-between">
                        <span>Last Event:</span>
                        <span className="font-mono">
                          {new Date(subscription.lastMessage.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    {event.data?.type && (
                      <div className="flex justify-between">
                        <span>Data Type:</span>
                        <span className="font-mono">{event.data.type}</span>
                      </div>
                    )}
                  </div>
                  
                  {subscription?.isActive && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <Radio className="h-3 w-3 animate-pulse" />
                      <span>Listening</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Event Messages */}
      {eventMessages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Event Messages</CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={exportMessages} variant="outline" size="sm">
                  <Download className="h-3 w-3 mr-2" />
                  Export
                </Button>
                <Button onClick={clearMessages} variant="outline" size="sm">
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {eventMessages.map((message, index) => (
                  <div key={message.id}>
                    <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {message.eventName}
                          </Badge>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {message.source}
                          </Badge>
                        </div>
                        <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-white dark:bg-gray-900 p-2 rounded border">
                          {formatEventData(message.data)}
                        </pre>
                      </div>
                    </div>
                    {index < eventMessages.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}