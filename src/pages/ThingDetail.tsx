import { useParams, useNavigate } from 'react-router-dom'
import { useThingsStore } from '@/stores/thingsStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Play, Activity, Info, Code, Wifi, WifiOff } from 'lucide-react'
import { ThingProperties } from '@/components/thing-detail/ThingProperties'
import { ThingActions } from '@/components/thing-detail/ThingActions'
import { ThingEvents } from '@/components/thing-detail/ThingEvents'
import { ThingMetadata } from '@/components/thing-detail/ThingMetadata'
import { ThingDescription } from '@/components/thing-detail/ThingDescription'

export function ThingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { things } = useThingsStore()
  
  const thing = things.find(t => t.id === id)
  
  if (!thing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Thing Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The Thing you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/things')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Things
          </Button>
        </div>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (thing.status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />
      case 'connecting':
        return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (thing.status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const thingDescription = thing.thingDescription
  const properties = thingDescription?.properties ? Object.entries(thingDescription.properties) : []
  const actions = thingDescription?.actions ? Object.entries(thingDescription.actions) : []
  const events = thingDescription?.events ? Object.entries(thingDescription.events) : []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/things')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {thing.title}
              </h1>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <Badge variant="outline" className={getStatusColor()}>
                  {thing.status}
                </Badge>
              </div>
            </div>
            {thing.description && (
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                {thing.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/things/editor?edit=${thing.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {properties.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {actions.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {events.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Last Seen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {thing.lastSeen ? new Date(thing.lastSeen).toLocaleString() : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="description" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            TD JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <ThingProperties 
            thing={thing} 
            properties={properties}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <ThingActions 
            thing={thing} 
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <ThingEvents 
            thing={thing} 
            events={events}
          />
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <ThingMetadata thing={thing} />
        </TabsContent>

        <TabsContent value="description" className="space-y-6">
          <ThingDescription thing={thing} />
        </TabsContent>
      </Tabs>
    </div>
  )
}