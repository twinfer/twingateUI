import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { memoryDiagnostics, performanceMonitor } from '@/lib/memoryDiagnostics'
import { useMemoryMonitoring } from '@/hooks/useMemoryManager'
import { 
  Activity, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface MemoryMonitorProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function MemoryMonitor({ autoRefresh = true, refreshInterval = 10000 }: MemoryMonitorProps) {
  const [report, setReport] = useState<ReturnType<typeof memoryDiagnostics.getMemoryReport> | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { getStats } = useMemoryMonitoring(refreshInterval)

  const refreshReport = async () => {
    setIsRefreshing(true)
    try {
      const newReport = memoryDiagnostics.getMemoryReport()
      setReport(newReport)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    refreshReport()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshReport, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const exportData = () => {
    const data = memoryDiagnostics.exportSnapshots()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memory-snapshots-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearSnapshots = () => {
    memoryDiagnostics.clearSnapshots()
    refreshReport()
  }

  const formatMemory = (mb?: number) => {
    if (mb === undefined) return 'N/A'
    return `${mb.toFixed(1)} MB`
  }

  const getTrendIcon = (current: number, previous?: number) => {
    if (previous === undefined) return <Minus className="h-4 w-4 text-gray-500" />
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  const { current, analysis, history } = report
  const previous = history.length >= 2 ? history[history.length - 2] : undefined

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Memory Monitor
              </CardTitle>
              <CardDescription>
                Real-time memory usage and leak detection for development
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshReport}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={clearSnapshots}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Memory Leak Analysis */}
      {analysis.hasLeaks && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold">Potential Memory Leaks Detected</div>
              <div className="space-y-1">
                {analysis.issues.map((issue, idx) => (
                  <div key={idx} className="text-sm">• {issue}</div>
                ))}
              </div>
              <div className="mt-2">
                <div className="font-semibold text-sm">Recommendations:</div>
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="text-sm">• {rec}</div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Memory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Connections */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">EventSources</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{current.connections.eventSources}</span>
                  {getTrendIcon(current.connections.eventSources, previous?.connections.eventSources)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">WebSockets</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{current.connections.websockets}</span>
                  {getTrendIcon(current.connections.websockets, previous?.connections.websockets)}
                </div>
              </div>
              <div className="pt-1 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold">
                    {current.connections.eventSources + current.connections.websockets}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listeners */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Listeners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Properties</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{current.listeners.properties}</span>
                  {getTrendIcon(current.listeners.properties, previous?.listeners.properties)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Events</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{current.listeners.events}</span>
                  {getTrendIcon(current.listeners.events, previous?.listeners.events)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Alerts</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{current.listeners.alerts}</span>
                  {getTrendIcon(current.listeners.alerts, previous?.listeners.alerts)}
                </div>
              </div>
              <div className="pt-1 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold">
                    {current.listeners.properties + current.listeners.events + current.listeners.alerts}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Heap Used</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatMemory(current.heapUsed)}</span>
                  {getTrendIcon(current.heapUsed || 0, previous?.heapUsed)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Heap Total</span>
                <span className="font-semibold">{formatMemory(current.heapTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Subscriptions</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{current.subscriptions}</span>
                  {getTrendIcon(current.subscriptions, previous?.subscriptions)}
                </div>
              </div>
              {analysis.growthRate !== undefined && (
                <div className="pt-1 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Growth Rate</span>
                    <Badge variant={analysis.growthRate > 5 ? "destructive" : "default"}>
                      {analysis.growthRate.toFixed(1)} MB/min
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {performanceMonitor.getMetricNames().map(name => {
                const stats = performanceMonitor.getStats(name)
                if (!stats) return null
                
                return (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <div className="flex items-center gap-4">
                      <span>Avg: {stats.avg.toFixed(1)}ms</span>
                      <span>Latest: {stats.latest.toFixed(1)}ms</span>
                      <Badge variant="outline">{stats.count}</Badge>
                    </div>
                  </div>
                )
              })}
              {performanceMonitor.getMetricNames().length === 0 && (
                <div className="text-muted-foreground text-sm">No performance metrics recorded</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* History Chart */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Memory History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {history.length} snapshots over {
                ((current.timestamp - history[0].timestamp) / 60000).toFixed(1)
              } minutes
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Only render in development
export function DevMemoryMonitor(props: MemoryMonitorProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return <MemoryMonitor {...props} />
}