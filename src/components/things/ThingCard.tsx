import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { 
  MoreHorizontal, 
  Settings, 
  Zap, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Clock,
  Globe,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Thing } from '@/stores/thingsStore'

interface ThingCardProps {
  thing: Thing
  onEdit?: (thing: Thing) => void
  onDelete?: (thing: Thing) => void
  onView?: (thing: Thing) => void
}

export function ThingCard({ thing, onEdit, onDelete, onView }: ThingCardProps) {
  const getStatusIcon = (status: Thing['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'unknown':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'connecting':
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadgeVariant = (status: Thing['status']) => {
    switch (status) {
      case 'online':
        return 'default'
      case 'offline':
        return 'destructive'
      case 'unknown':
        return 'secondary'
      case 'connecting':
        return 'outline'
    }
  }

  // Parse the Thing Description to get capabilities count
  const td = thing.thingDescription as any
  const propertiesCount = td.properties ? Object.keys(td.properties).length : 0
  const actionsCount = td.actions ? Object.keys(td.actions).length : 0
  const eventsCount = td.events ? Object.keys(td.events).length : 0

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1">{thing.title}</CardTitle>
            {thing.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {thing.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/things/${thing.id}`} className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(thing)}>
                  Edit Thing
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(thing)}
                  className="text-destructive"
                >
                  Delete Thing
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {getStatusIcon(thing.status)}
          <Badge variant={getStatusBadgeVariant(thing.status)}>
            {thing.status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            {thing.discoveryMethod || 'manual'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>{propertiesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>{actionsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>{eventsCount}</span>
            </div>
          </div>
          {thing.lastSeen && (
            <span className="text-xs">
              Last seen: {new Date(thing.lastSeen).toLocaleDateString()}
            </span>
          )}
        </div>

        {thing.url && (
          <div className="mt-3 text-xs text-muted-foreground font-mono truncate">
            {thing.url}
          </div>
        )}
      </CardContent>
    </Card>
  )
}