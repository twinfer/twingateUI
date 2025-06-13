import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Thermometer,
  Droplets,
  Settings,
  Maximize2,
  Grid3X3,
  LayoutDashboard
} from 'lucide-react'
import { useThingsStore } from '@/stores/thingsStore'
import { useMonitoringStore } from '@/stores/monitoringStore'
import { PropertyChart } from '@/components/monitoring/PropertyChart'

interface DashboardWidget {
  id: string
  type: 'chart' | 'stats' | 'alerts' | 'events'
  title: string
  thingId?: string
  propertyName?: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
}

export function MonitoringDashboard() {
  const { things } = useThingsStore()
  const { 
    propertyValues, 
    activeAlerts, 
    recentEvents, 
    subscriptions,
    addSubscription 
  } = useMonitoringStore()
  
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'stats-overview',
      type: 'stats',
      title: 'System Overview',
      size: 'large',
      position: { x: 0, y: 0 }
    },
    {
      id: 'active-alerts',
      type: 'alerts',
      title: 'Active Alerts',
      size: 'medium',
      position: { x: 1, y: 0 }
    },
    {
      id: 'recent-events',
      type: 'events',
      title: 'Recent Events',
      size: 'medium',
      position: { x: 2, y: 0 }
    }
  ])
  
  const [isAutoMonitoring, setIsAutoMonitoring] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')

  // Auto-start monitoring for key properties
  useEffect(() => {
    if (isAutoMonitoring && things.length > 0) {
      const importantProperties = ['temperature', 'humidity', 'power', 'status']
      
      for (const thing of things.slice(0, 5)) { // Limit to 5 things
        const td = thing.thingDescription as any
        if (td?.properties) {
          for (const propName of Object.keys(td.properties)) {
            if (importantProperties.some(imp => propName.toLowerCase().includes(imp))) {
              addSubscription({
                thingId: thing.id,
                type: 'property',
                target: propName,
                active: true,
              })
            }
          }
        }
      }
    }
  }, [isAutoMonitoring, things, addSubscription])

  const getSystemStats = () => {
    const totalThings = things.length
    const onlineThings = things.filter(t => t.status === 'online').length
    const activeSubscriptions = subscriptions.filter(s => s.active).length
    const unacknowledgedAlerts = activeAlerts.filter(a => !a.acknowledged).length
    const recentEventCount = recentEvents.filter(e => 
      new Date(e.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    ).length

    return {
      totalThings,
      onlineThings,
      activeSubscriptions,
      unacknowledgedAlerts,
      recentEventCount,
      systemHealth: Math.round((onlineThings / Math.max(totalThings, 1)) * 100)
    }
  }

  const getTopProperties = () => {
    const propertyCount = new Map<string, number>()
    
    for (const thing of things) {
      const td = thing.thingDescription as any
      if (td?.properties) {
        for (const propName of Object.keys(td.properties)) {
          propertyCount.set(propName, (propertyCount.get(propName) || 0) + 1)
        }
      }
    }
    
    return Array.from(propertyCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }))
  }

  const addChartWidget = (thingId: string, propertyName: string) => {
    const newWidget: DashboardWidget = {
      id: `chart-${thingId}-${propertyName}-${Date.now()}`,
      type: 'chart',
      title: `${things.find(t => t.id === thingId)?.title} - ${propertyName}`,
      thingId,
      propertyName,
      size: 'medium',
      position: { x: widgets.length % 3, y: Math.floor(widgets.length / 3) + 1 }
    }
    
    setWidgets(prev => [...prev, newWidget])
    
    // Auto-subscribe to this property
    addSubscription({
      thingId,
      type: 'property',
      target: propertyName,
      active: true,
    })
  }

  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId))
  }

  const stats = getSystemStats()
  const topProperties = getTopProperties()

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'stats':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalThings}</div>
                  <div className="text-sm text-muted-foreground">Total Things</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.onlineThings}</div>
                  <div className="text-sm text-muted-foreground">Online</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.activeSubscriptions}</div>
                  <div className="text-sm text-muted-foreground">Active Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.unacknowledgedAlerts}</div>
                  <div className="text-sm text-muted-foreground">Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.recentEventCount}</div>
                  <div className="text-sm text-muted-foreground">Events (1h)</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    stats.systemHealth >= 80 ? 'text-green-600' :
                    stats.systemHealth >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stats.systemHealth}%
                  </div>
                  <div className="text-sm text-muted-foreground">Health</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'alerts':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {widget.title}
                <Badge variant="destructive" className="ml-auto">
                  {stats.unacknowledgedAlerts}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'error' ? 'bg-red-400' :
                      alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{alert.ruleName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {alert.thingTitle}
                      </div>
                    </div>
                    {alert.acknowledged && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
                {activeAlerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No active alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'events':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {widget.title}
                <Badge variant="outline" className="ml-auto">
                  {recentEvents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentEvents.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      event.severity === 'critical' ? 'bg-red-500' :
                      event.severity === 'error' ? 'bg-red-400' :
                      event.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{event.eventName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {event.thingTitle} • {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {recentEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No recent events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'chart':
        if (!widget.thingId || !widget.propertyName) return null
        const thing = things.find(t => t.id === widget.thingId)
        if (!thing) return null
        
        return (
          <div className="relative">
            <PropertyChart
              thingId={widget.thingId}
              thingTitle={thing.title}
              propertyName={widget.propertyName}
              height={200}
              timeRange={selectedTimeRange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeWidget(widget.id)}
              className="absolute top-2 right-2 h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring overview • {stats.activeSubscriptions} active streams
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={isAutoMonitoring}
              onCheckedChange={setIsAutoMonitoring}
            />
            <span className="text-sm">Auto-monitor</span>
          </div>
          
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="6h">6h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Add Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Property Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {topProperties.map(({ name, count }) => (
              <Select key={name} onValueChange={(thingId) => addChartWidget(thingId, name)}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder={
                    <div className="flex items-center gap-1">
                      {name.toLowerCase().includes('temp') && <Thermometer className="h-3 w-3" />}
                      {name.toLowerCase().includes('hum') && <Droplets className="h-3 w-3" />}
                      {name.toLowerCase().includes('power') && <Zap className="h-3 w-3" />}
                      <span className="text-xs">{name} ({count})</span>
                    </div>
                  } />
                </SelectTrigger>
                <SelectContent>
                  {things
                    .filter(thing => {
                      const td = thing.thingDescription as any
                      return td?.properties?.[name]
                    })
                    .map(thing => (
                      <SelectItem key={thing.id} value={thing.id}>
                        {thing.title}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {widgets.map(widget => (
          <div key={widget.id} className={
            widget.size === 'large' ? 'lg:col-span-3' :
            widget.size === 'medium' ? 'lg:col-span-1' : 'lg:col-span-1'
          }>
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {/* Status Footer */}
      {stats.activeSubscriptions > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="font-medium text-blue-900">
                  Dashboard is live • Monitoring {stats.activeSubscriptions} properties
                </span>
              </div>
              <Badge variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}