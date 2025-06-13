import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Play,
  Pause,
  Trash2,
  Download
} from 'lucide-react'
import { useThingsStore } from '@/stores/thingsStore'
import { useMonitoringStore } from '@/stores/monitoringStore'
import { WoTEvent, monitoringService } from '@/services/monitoringService'
import { MonitoringErrorBoundary } from '@/components/MonitoringErrorBoundary'

interface EventCardProps {
  event: WoTEvent
  onAcknowledge?: (eventId: string) => void
}

function EventCard({ event, onAcknowledge }: EventCardProps) {
  const getSeverityIcon = (severity: WoTEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: WoTEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className={`transition-all duration-200 ${getSeverityColor(event.severity)} ${event.acknowledged ? 'opacity-60' : ''}`}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getSeverityIcon(event.severity)}
              <div>
                <h3 className="font-medium text-sm">{event.eventName}</h3>
                <p className="text-xs text-muted-foreground">{event.thingTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {event.severity}
              </Badge>
              {event.acknowledged && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  ACK
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-700">{event.description}</p>
          )}

          {/* Event Data */}
          {event.data && Object.keys(event.data).length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Event Data
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            </details>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(event.timestamp)}
            </span>
            {!event.acknowledged && onAcknowledge && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAcknowledge(event.id)}
                className="h-6 px-2 text-xs"
              >
                Acknowledge
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Events() {
  const { things } = useThingsStore()
  const { 
    recentEvents,
    subscriptions,
    autoScroll,
    maxEvents,
    addSubscription,
    removeSubscription,
    addEvent,
    setAutoScroll,
    setMaxEvents,
    clearEvents
  } = useMonitoringStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedThingId, setSelectedThingId] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [isMonitoring, setIsMonitoring] = useState(false)
  const eventsEndRef = useRef<HTMLDivElement>(null)

  // Filter events
  const filteredEvents = recentEvents.filter(event => {
    if (selectedThingId !== 'all' && event.thingId !== selectedThingId) return false
    if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        event.eventName.toLowerCase().includes(query) ||
        event.thingTitle.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredEvents.length, autoScroll])

  // Subscribe to events from monitoring service
  useEffect(() => {
    const unsubscribeCallbacks: (() => void)[] = []
    
    for (const subscription of subscriptions) {
      if (subscription.type === 'event' || subscription.type === 'all') {
        const unsubscribe = monitoringService.onEvent(
          subscription.thingId,
          subscription.target || '*',
          (event: WoTEvent) => {
            addEvent(event)
          }
        )
        unsubscribeCallbacks.push(unsubscribe)
      }
    }
    
    return () => {
      unsubscribeCallbacks.forEach(unsub => unsub())
    }
  }, [subscriptions, addEvent])

  // Handle monitoring toggle
  const handleMonitoringToggle = async () => {
    if (isMonitoring) {
      // Stop event monitoring
      const eventSubscriptions = subscriptions.filter(sub => 
        sub.type === 'event' || sub.type === 'all'
      )
      for (const subscription of eventSubscriptions) {
        await removeSubscription(subscription.id)
      }
      setIsMonitoring(false)
    } else {
      // Start monitoring events from all things
      const thingsToMonitor = selectedThingId === 'all' ? things : things.filter(t => t.id === selectedThingId)
      
      for (const thing of thingsToMonitor) {
        await addSubscription({
          thingId: thing.id,
          type: 'event',
          target: '*', // Monitor all events
          active: true,
        })
      }
      setIsMonitoring(true)
    }
  }

  const handleAcknowledgeEvent = (eventId: string) => {
    // In a real implementation, this would update the event in the backend
    console.log('Acknowledged event:', eventId)
  }

  const exportEvents = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `events-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const severityCounts = recentEvents.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const activeEventSubscriptions = subscriptions.filter(sub => 
    sub.active && (sub.type === 'event' || sub.type === 'all')
  ).length

  return (
    <MonitoringErrorBoundary componentName="Events">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Real-time event monitoring • {activeEventSubscriptions} active streams • {recentEvents.length} total events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={handleMonitoringToggle}
            className="gap-2"
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Monitoring
              </>
            )}
          </Button>
          <Button variant="outline" onClick={exportEvents} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedThingId} onValueChange={setSelectedThingId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Thing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Things</SelectItem>
                  {things.map(thing => (
                    <SelectItem key={thing.id} value={thing.id}>
                      {thing.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">
                    Critical {severityCounts.critical ? `(${severityCounts.critical})` : ''}
                  </SelectItem>
                  <SelectItem value="error">
                    Error {severityCounts.error ? `(${severityCounts.error})` : ''}
                  </SelectItem>
                  <SelectItem value="warning">
                    Warning {severityCounts.warning ? `(${severityCounts.warning})` : ''}
                  </SelectItem>
                  <SelectItem value="info">
                    Info {severityCounts.info ? `(${severityCounts.info})` : ''}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoScroll}
                    onCheckedChange={setAutoScroll}
                  />
                  <span className="text-sm">Auto-scroll</span>
                </div>
                
                <Select 
                  value={maxEvents.toString()} 
                  onValueChange={(value) => setMaxEvents(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 events</SelectItem>
                    <SelectItem value="500">500 events</SelectItem>
                    <SelectItem value="1000">1000 events</SelectItem>
                    <SelectItem value="5000">5000 events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recentEvents.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearEvents}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Events
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Banner */}
      {isMonitoring && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600 animate-pulse" />
              <span className="font-medium text-green-900">
                Monitoring events from {selectedThingId === 'all' ? 'all Things' : '1 Thing'}
              </span>
              <Badge variant="secondary" className="ml-auto">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {isMonitoring 
                ? 'Waiting for events...' 
                : 'Start monitoring to see real-time events from your Things.'
              }
            </p>
            {!isMonitoring && (
              <Button
                onClick={handleMonitoringToggle}
                className="mt-4 gap-2"
              >
                <Play className="h-4 w-4" />
                Start Monitoring
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredEvents.length} of {recentEvents.length} events
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onAcknowledge={handleAcknowledgeEvent}
              />
            ))}
            <div ref={eventsEndRef} />
          </div>
        </div>
      )}
      </div>
    </MonitoringErrorBoundary>
  )
}