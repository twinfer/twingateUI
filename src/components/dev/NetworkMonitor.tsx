import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNetworkStats, useConnectionHealth } from '@/hooks/useNetworkOptimization'
import { optimizedApiService } from '@/services/optimizedApiService'
import { discoveryService } from '@/services/discoveryService'
import { 
  Activity, 
  Globe, 
  Database, 
  Zap, 
  TrendingUp, 
  Clock, 
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Signal,
  Wifi,
  WifiOff
} from 'lucide-react'

interface NetworkMonitorProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function NetworkMonitor({ autoRefresh = true, refreshInterval = 5000 }: NetworkMonitorProps) {
  const { stats, cacheInfo, resetStats } = useNetworkStats(refreshInterval)
  const { isOnline, connectionType, lastCheck, checkConnection } = useConnectionHealth()
  const [discoveryStats, setDiscoveryStats] = useState(discoveryService.getNetworkStats())

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setDiscoveryStats(discoveryService.getNetworkStats())
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const clearAllCaches = () => {
    optimizedApiService.clearCache()
    discoveryService.clearDiscoveryCache()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const getEfficiencyScore = () => {
    const totalRequests = stats.totalRequests
    if (totalRequests === 0) return 100

    const cacheHitRate = stats.cacheHits / (stats.cacheHits + stats.cacheMisses)
    const deduplicationRate = stats.deduplicatedRequests / totalRequests
    const errorRate = stats.errors / totalRequests
    const batchingRate = stats.batchedRequests / totalRequests

    const score = (
      cacheHitRate * 40 + // 40% weight for cache hits
      deduplicationRate * 30 + // 30% weight for deduplication
      (1 - errorRate) * 20 + // 20% weight for low error rate
      batchingRate * 10 // 10% weight for batching
    ) * 100

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600 font-medium">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600 font-medium">Offline</span>
        </>
      )}
      {connectionType !== 'unknown' && (
        <Badge variant="outline" className="text-xs">
          {connectionType}
        </Badge>
      )}
    </div>
  )

  const efficiencyScore = getEfficiencyScore()

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Network Monitor
              </CardTitle>
              <CardDescription>
                Network efficiency, caching, and connection monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ConnectionStatus />
              <Button
                variant="outline"
                size="sm"
                onClick={checkConnection}
              >
                <Signal className="h-4 w-4 mr-2" />
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllCaches}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Efficiency Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Network Efficiency Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress 
                value={efficiencyScore} 
                className="h-2"
              />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{efficiencyScore}%</div>
              <div className="text-xs text-muted-foreground">
                {efficiencyScore >= 80 ? 'Excellent' : 
                 efficiencyScore >= 60 ? 'Good' : 
                 efficiencyScore >= 40 ? 'Fair' : 'Poor'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="discovery">Discovery</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Request Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(stats.bytesTransferred)} transferred
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Cache Hits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.cacheHits}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalRequests > 0 ? 
                    `${Math.round((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100)}% hit rate` : 
                    'No requests yet'
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Deduplicated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.deduplicatedRequests}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalRequests > 0 ? 
                    `${Math.round((stats.deduplicatedRequests / stats.totalRequests) * 100)}% saved` : 
                    'No duplicates'
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Batched
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.batchedRequests}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalRequests > 0 ? 
                    `${Math.round((stats.batchedRequests / stats.totalRequests) * 100)}% batched` : 
                    'No batching'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Response Time & Errors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Average Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(stats.averageResponseTime)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.averageResponseTime < 1000 ? 'Excellent' : 
                   stats.averageResponseTime < 3000 ? 'Good' : 'Slow'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalRequests > 0 ? 
                    `${Math.round((stats.errors / stats.totalRequests) * 100)}% error rate` : 
                    'No errors'
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cacheInfo.size}</div>
                <div className="text-xs text-muted-foreground">entries</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(cacheInfo.hitRate * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">cache efficiency</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(cacheInfo.totalSize)}
                </div>
                <div className="text-xs text-muted-foreground">approximate</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cached Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {cacheInfo.keys.slice(0, 20).map((key, index) => (
                    <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                      {key}
                    </div>
                  ))}
                  {cacheInfo.keys.length > 20 && (
                    <div className="text-xs text-muted-foreground p-2">
                      ... and {cacheInfo.keys.length - 20} more
                    </div>
                  )}
                  {cacheInfo.keys.length === 0 && (
                    <div className="text-sm text-muted-foreground">No cached entries</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Network Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hits</span>
                    <span className="font-medium">{stats.cacheHits} requests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Deduplicated</span>
                    <span className="font-medium">{stats.deduplicatedRequests} requests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Batched</span>
                    <span className="font-medium">{stats.batchedRequests} requests</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total Saved</span>
                      <span className="text-green-600">
                        {stats.cacheHits + stats.deduplicatedRequests + stats.batchedRequests}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Connection Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <ConnectionStatus />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Type</span>
                    <span className="font-medium">{connectionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Check</span>
                    <span className="font-medium">
                      {formatTime(Date.now() - lastCheck)} ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="discovery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Discovery Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{discoveryStats.totalRequests}</div>
                <div className="text-xs text-muted-foreground">WoT discoveries</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {discoveryStats.totalRequests > 0 ? 
                    Math.round((discoveryStats.cacheHits / (discoveryStats.cacheHits + discoveryStats.cacheMisses)) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">hit rate</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Discovery Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{discoveryStats.errors}</div>
                <div className="text-xs text-muted-foreground">failed discoveries</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetStats}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Statistics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Only render in development
export function DevNetworkMonitor(props: NetworkMonitorProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return <NetworkMonitor {...props} />
}