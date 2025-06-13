import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useThingsStore } from '@/stores/thingsStore'
import { 
  Server, 
  Wifi, 
  Activity, 
  Zap, 
  Radio, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export function SystemStatsWidget() {
  const { things } = useThingsStore()

  const stats = useMemo(() => {
    const total = things.length
    const online = things.filter(t => t.status === 'online').length
    const offline = things.filter(t => t.status === 'offline').length
    const connecting = things.filter(t => t.status === 'connecting').length
    const unknown = things.filter(t => t.status === 'unknown').length

    // Calculate total properties, actions, and events
    let totalProperties = 0
    let totalActions = 0
    let totalEvents = 0

    things.forEach(thing => {
      if (thing.thingDescription) {
        if (thing.thingDescription.properties) {
          totalProperties += Object.keys(thing.thingDescription.properties).length
        }
        if (thing.thingDescription.actions) {
          totalActions += Object.keys(thing.thingDescription.actions).length
        }
        if (thing.thingDescription.events) {
          totalEvents += Object.keys(thing.thingDescription.events).length
        }
      }
    })

    const healthScore = total > 0 ? Math.round((online / total) * 100) : 100
    const recentlyDiscovered = things.filter(thing => {
      if (!thing.lastSeen) return false
      const lastSeen = new Date(thing.lastSeen)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return lastSeen > oneDayAgo
    }).length

    return {
      total,
      online,
      offline,
      connecting,
      unknown,
      totalProperties,
      totalActions,
      totalEvents,
      healthScore,
      recentlyDiscovered
    }
  }, [things])

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Things */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Things</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.recentlyDiscovered} discovered today
          </p>
          <div className="mt-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/things">View All</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          {getHealthIcon(stats.healthScore)}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getHealthColor(stats.healthScore)}`}>
            {stats.healthScore}%
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.online}/{stats.total} devices online
          </p>
          <div className="flex gap-1 mt-2">
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              {stats.online} online
            </Badge>
            {stats.offline > 0 && (
              <Badge variant="outline" className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                {stats.offline} offline
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProperties}</div>
          <p className="text-xs text-muted-foreground">
            Across {stats.total} devices
          </p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400">
              Real-time monitoring
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions & Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capabilities</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalActions + stats.totalEvents}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalActions} actions, {stats.totalEvents} events
          </p>
          <div className="flex gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {stats.totalActions}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Radio className="h-3 w-3 mr-1" />
              {stats.totalEvents}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
          <CardDescription>Real-time device connectivity overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Online</span>
              <Badge variant="outline">{stats.online}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Offline</span>
              <Badge variant="outline">{stats.offline}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Connecting</span>
              <Badge variant="outline">{stats.connecting}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm">Unknown</span>
              <Badge variant="outline">{stats.unknown}</Badge>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              {stats.total > 0 && (
                <>
                  <div 
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{ width: `${(stats.online / stats.total) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-yellow-500 h-full transition-all duration-300"
                    style={{ width: `${(stats.connecting / stats.total) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-500 h-full transition-all duration-300"
                    style={{ width: `${(stats.offline / stats.total) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-gray-400 h-full transition-all duration-300"
                    style={{ width: `${(stats.unknown / stats.total) * 100}%` }}
                  ></div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          <CardDescription>Common tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/things/discover" className="flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                Discover Devices
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/things/create" className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Create Thing
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/things" className="flex items-center">
                <Server className="h-4 w-4 mr-2" />
                View All Things
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/visualization" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Visualization
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}