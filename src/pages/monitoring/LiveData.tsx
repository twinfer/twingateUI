import { useState, useEffect } from 'react'
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
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  Activity,
  Thermometer,
  Droplets,
  Zap,
  Search
} from 'lucide-react'
import { useThingsStore } from '@/stores/thingsStore'
import { useMonitoringStore } from '@/stores/monitoringStore'
import { PropertyValue, monitoringService } from '@/services/monitoringService'

interface PropertyStreamCardProps {
  thingId: string
  thingTitle: string
  propertyName: string
  value?: PropertyValue
  onToggleSubscription: (thingId: string, propertyName: string, subscribe: boolean) => void
  isSubscribed: boolean
}

function PropertyStreamCard({ 
  thingId, 
  thingTitle, 
  propertyName, 
  value, 
  onToggleSubscription,
  isSubscribed 
}: PropertyStreamCardProps) {
  const getPropertyIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('temperature')) return <Thermometer className="h-4 w-4" />
    if (lower.includes('humidity')) return <Droplets className="h-4 w-4" />
    if (lower.includes('power') || lower.includes('energy')) return <Zap className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getValueDisplay = (val: any, dataType: string) => {
    if (val === null || val === undefined) return 'N/A'
    
    if (dataType === 'boolean') {
      return val ? 'ON' : 'OFF'
    }
    
    if (dataType === 'number') {
      return typeof val === 'number' ? val.toFixed(2) : val.toString()
    }
    
    return val.toString()
  }

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'good': return 'text-green-600'
      case 'uncertain': return 'text-yellow-600'
      case 'bad': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    return date.toLocaleTimeString()
  }

  return (
    <Card className={`transition-all duration-200 ${isSubscribed ? 'border-blue-200 bg-blue-50/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPropertyIcon(propertyName)}
            <div>
              <CardTitle className="text-sm font-medium">{propertyName}</CardTitle>
              <p className="text-xs text-muted-foreground">{thingTitle}</p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={(checked) => onToggleSubscription(thingId, propertyName, checked)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {value ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {getValueDisplay(value.value, value.dataType)}
              </div>
              {value.unit && (
                <div className="text-sm text-muted-foreground">{value.unit}</div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <Badge variant="outline" className={getQualityColor(value.quality)}>
                {value.quality || 'unknown'}
              </Badge>
              <span className="text-muted-foreground">
                {formatTimestamp(value.timestamp)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {isSubscribed ? 'Waiting for data...' : 'Not subscribed'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function LiveData() {
  const { things } = useThingsStore()
  const { 
    propertyValues, 
    subscriptions, 
    addSubscription, 
    removeSubscription,
    updatePropertyValue 
  } = useMonitoringStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedThingId, setSelectedThingId] = useState<string>('all')
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Get all available properties from things
  const availableProperties = things.flatMap(thing => {
    const td = thing.thingDescription as any
    if (!td?.properties) return []
    
    return Object.keys(td.properties).map(propName => ({
      thingId: thing.id,
      thingTitle: thing.title,
      propertyName: propName,
      key: `${thing.id}:${propName}`
    }))
  })

  // Filter properties based on search and thing selection
  const filteredProperties = availableProperties.filter(prop => {
    if (selectedThingId !== 'all' && prop.thingId !== selectedThingId) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        prop.propertyName.toLowerCase().includes(query) ||
        prop.thingTitle.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Check if property is subscribed
  const isPropertySubscribed = (thingId: string, propertyName: string) => {
    return subscriptions.some(sub => 
      sub.thingId === thingId && 
      sub.target === propertyName && 
      sub.active
    )
  }

  // Handle subscription toggle
  const handleToggleSubscription = async (thingId: string, propertyName: string, subscribe: boolean) => {
    if (subscribe) {
      await addSubscription({
        thingId,
        type: 'property',
        target: propertyName,
        active: true,
      })
    } else {
      const subscription = subscriptions.find(sub => 
        sub.thingId === thingId && sub.target === propertyName
      )
      if (subscription) {
        await removeSubscription(subscription.id)
      }
    }
  }

  // Handle monitoring toggle
  const handleMonitoringToggle = async () => {
    if (isMonitoring) {
      // Stop all subscriptions
      for (const subscription of subscriptions) {
        await removeSubscription(subscription.id)
      }
      setIsMonitoring(false)
    } else {
      // Start monitoring all visible properties
      for (const prop of filteredProperties.slice(0, 12)) { // Limit to prevent overwhelming
        await addSubscription({
          thingId: prop.thingId,
          type: 'property',
          target: prop.propertyName,
          active: true,
        })
      }
      setIsMonitoring(true)
    }
  }

  // Subscribe to property updates
  useEffect(() => {
    const unsubscribeCallbacks: (() => void)[] = []
    
    for (const subscription of subscriptions) {
      if (subscription.type === 'property' && subscription.target) {
        const unsubscribe = monitoringService.onPropertyUpdate(
          subscription.thingId,
          subscription.target,
          (value: PropertyValue) => {
            updatePropertyValue(value)
          }
        )
        unsubscribeCallbacks.push(unsubscribe)
      }
    }
    
    return () => {
      unsubscribeCallbacks.forEach(unsub => unsub())
    }
  }, [subscriptions, updatePropertyValue])

  const activeSubscriptionsCount = subscriptions.filter(sub => sub.active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Data</h1>
          <p className="text-muted-foreground">
            Real-time property monitoring • {activeSubscriptionsCount} active streams
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
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
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

            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <span className="text-sm">Auto-refresh</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Banner */}
      {activeSubscriptionsCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
              <span className="font-medium text-blue-900">
                Monitoring {activeSubscriptionsCount} properties in real-time
              </span>
              {autoRefresh && (
                <Badge variant="secondary" className="ml-auto">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Live
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Grid */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery ? 'No properties match your search criteria.' : 'No Things with properties available.'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProperties.map((prop) => {
            const value = propertyValues.get(prop.key)
            const isSubscribed = isPropertySubscribed(prop.thingId, prop.propertyName)
            
            return (
              <PropertyStreamCard
                key={prop.key}
                thingId={prop.thingId}
                thingTitle={prop.thingTitle}
                propertyName={prop.propertyName}
                value={value}
                onToggleSubscription={handleToggleSubscription}
                isSubscribed={isSubscribed}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}