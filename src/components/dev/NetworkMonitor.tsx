import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { discoveryService } from '@/services/discoveryService'
import { 
  Activity, 
  Globe, 
  Wifi, 
  WifiOff,
  BarChart3
} from 'lucide-react'

interface NetworkMonitorProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function NetworkMonitor({ autoRefresh = true, refreshInterval = 5000 }: NetworkMonitorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState<string>('unknown')
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    // Check connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection?.effectiveType || 'unknown')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const clearAllCaches = () => {
    discoveryService.clearDiscoveryCache()
    // Suggest using React Query DevTools for cache management
    console.log('For advanced cache management, use React Query DevTools')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Network Monitor
          </CardTitle>
          <CardDescription>
            Basic network status monitoring. For detailed network insights and cache management, 
            use React Query DevTools (press F12 → React Query tab).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-6 w-6 text-green-600" />
              ) : (
                <WifiOff className="h-6 w-6 text-red-600" />
              )}
              <div>
                <div className="font-medium">Connection Status</div>
                <div className="text-sm text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                  {connectionType !== 'unknown' && (
                    <span className="ml-2">({connectionType})</span>
                  )}
                </div>
              </div>
            </div>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {/* React Query DevTools Recommendation */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-medium">Advanced Network Insights</div>
                <div className="text-sm text-muted-foreground">
                  Use React Query DevTools for detailed cache stats, request monitoring, and performance insights
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                alert('Open DevTools (F12) and look for the React Query tab for detailed network monitoring')
              }}
            >
              Learn More
            </Button>
          </div>

          {/* Discovery Cache Actions */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-medium">Discovery Cache</div>
                <div className="text-sm text-muted-foreground">
                  Clear WoT discovery cache (React Query handles API caching)
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllCaches}
            >
              Clear Discovery Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}