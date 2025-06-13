import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  Zap, 
  Radio, 
  Settings, 
  Wifi, 
  Eye, 
  Plus, 
  Edit,
  Trash2,
  Clock,
  User,
  RefreshCw
} from 'lucide-react'
import { useThingsStore } from '@/stores/thingsStore'
import { Link } from 'react-router-dom'

interface ActivityItem {
  id: string
  type: 'device_discovered' | 'device_connected' | 'device_disconnected' | 'action_executed' | 'property_updated' | 'event_received' | 'thing_created' | 'thing_updated' | 'thing_deleted' | 'user_login'
  title: string
  description: string
  timestamp: string
  deviceId?: string
  deviceName?: string
  userId?: string
  userName?: string
  metadata?: any
}

export function ActivityFeedWidget() {
  const { things } = useThingsStore()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialize with some mock activities and add real-time simulation
  useEffect(() => {
    const initialActivities: ActivityItem[] = [
      {
        id: 'act-1',
        type: 'user_login',
        title: 'User logged in',
        description: 'Admin user successfully authenticated',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        userId: 'admin-user-123',
        userName: 'Admin User'
      },
      {
        id: 'act-2',
        type: 'device_connected',
        title: 'Device came online',
        description: 'Coffee Machine is now connected and responding',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        deviceId: 'coffee-machine-1',
        deviceName: 'Advanced Coffee Machine'
      },
      {
        id: 'act-3',
        type: 'action_executed',
        title: 'Action executed',
        description: 'makeDrink action completed successfully',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        deviceId: 'coffee-machine-1',
        deviceName: 'Advanced Coffee Machine'
      },
      {
        id: 'act-4',
        type: 'property_updated',
        title: 'Property updated',
        description: 'Temperature reading changed to 23.5°C',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        deviceId: 'temp-sensor-1',
        deviceName: 'Temperature Sensor'
      },
      {
        id: 'act-5',
        type: 'device_discovered',
        title: 'New device discovered',
        description: 'Smart Light bulb found via .well-known/wot',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        deviceId: 'smart-light-1',
        deviceName: 'Smart Light Bulb'
      }
    ]

    setActivities(initialActivities)

    // Simulate real-time activities
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to add activity
        const newActivity = generateRandomActivity()
        setActivities(prev => [newActivity, ...prev.slice(0, 49)]) // Keep last 50 activities
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [things])

  const generateRandomActivity = (): ActivityItem => {
    const activityTypes: ActivityItem['type'][] = [
      'property_updated',
      'action_executed', 
      'event_received',
      'device_connected',
      'device_disconnected'
    ]

    const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    const randomThing = things[Math.floor(Math.random() * things.length)]
    const id = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    switch (randomType) {
      case 'property_updated':
        const properties = randomThing?.thingDescription?.properties
        const propNames = properties ? Object.keys(properties) : ['temperature', 'humidity', 'status']
        const randomProp = propNames[Math.floor(Math.random() * propNames.length)]
        const randomValue = Math.round(Math.random() * 100)
        
        return {
          id,
          type: randomType,
          title: 'Property updated',
          description: `${randomProp} changed to ${randomValue}${properties?.[randomProp]?.unit || ''}`,
          timestamp: new Date().toISOString(),
          deviceId: randomThing?.id,
          deviceName: randomThing?.title
        }

      case 'action_executed':
        const actions = randomThing?.thingDescription?.actions
        const actionNames = actions ? Object.keys(actions) : ['toggle', 'refresh', 'reset']
        const randomAction = actionNames[Math.floor(Math.random() * actionNames.length)]
        
        return {
          id,
          type: randomType,
          title: 'Action executed',
          description: `${randomAction} action completed successfully`,
          timestamp: new Date().toISOString(),
          deviceId: randomThing?.id,
          deviceName: randomThing?.title
        }

      case 'event_received':
        const events = randomThing?.thingDescription?.events
        const eventNames = events ? Object.keys(events) : ['alert', 'notification', 'warning']
        const randomEvent = eventNames[Math.floor(Math.random() * eventNames.length)]
        
        return {
          id,
          type: randomType,
          title: 'Event received',
          description: `${randomEvent} event triggered`,
          timestamp: new Date().toISOString(),
          deviceId: randomThing?.id,
          deviceName: randomThing?.title
        }

      case 'device_connected':
        return {
          id,
          type: randomType,
          title: 'Device connected',
          description: `${randomThing?.title || 'Device'} came online`,
          timestamp: new Date().toISOString(),
          deviceId: randomThing?.id,
          deviceName: randomThing?.title
        }

      case 'device_disconnected':
        return {
          id,
          type: randomType,
          title: 'Device disconnected',
          description: `${randomThing?.title || 'Device'} went offline`,
          timestamp: new Date().toISOString(),
          deviceId: randomThing?.id,
          deviceName: randomThing?.title
        }

      default:
        return {
          id,
          type: 'property_updated',
          title: 'System activity',
          description: 'General system activity occurred',
          timestamp: new Date().toISOString()
        }
    }
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'device_discovered':
      case 'device_connected':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'device_disconnected':
        return <Wifi className="h-4 w-4 text-red-500" />
      case 'action_executed':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'property_updated':
        return <Activity className="h-4 w-4 text-orange-500" />
      case 'event_received':
        return <Radio className="h-4 w-4 text-purple-500" />
      case 'thing_created':
        return <Plus className="h-4 w-4 text-green-500" />
      case 'thing_updated':
        return <Edit className="h-4 w-4 text-blue-500" />
      case 'thing_deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />
      case 'user_login':
        return <User className="h-4 w-4 text-indigo-500" />
      default:
        return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'device_discovered':
      case 'device_connected':
      case 'thing_created':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'device_disconnected':
      case 'thing_deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'action_executed':
      case 'thing_updated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'property_updated':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'event_received':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'user_login':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const refreshActivities = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add a few new mock activities
    const newActivities = Array.from({ length: 3 }, () => generateRandomActivity())
    setActivities(prev => [...newActivities, ...prev.slice(0, 47)])
    setIsRefreshing(false)
  }

  return (
    <Card className="h-[500px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
            </CardTitle>
            <CardDescription>
              Real-time system activities and device events
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshActivities}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={activity.id}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getActivityColor(activity.type)}`}>
                          {activity.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                    {activity.deviceId && activity.deviceName && (
                      <div className="mt-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link 
                            to={`/things/${activity.deviceId}`}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View {activity.deviceName}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {index < activities.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}