import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useThingsStore } from '@/stores/thingsStore'
import { 
  Grid3X3, 
  Search, 
  Filter,
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  Clock,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function DeviceStatusGrid() {
  const { things } = useThingsStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredThings = things.filter(thing => {
    const matchesSearch = thing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thing.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || thing.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-3 w-3 text-green-500" />
      case 'offline':
        return <WifiOff className="h-3 w-3 text-red-500" />
      case 'connecting':
        return <Activity className="h-3 w-3 text-yellow-500 animate-pulse" />
      case 'unknown':
        return <AlertCircle className="h-3 w-3 text-gray-500" />
      default:
        return <AlertCircle className="h-3 w-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500 border-green-600'
      case 'offline':
        return 'bg-red-500 border-red-600'
      case 'connecting':
        return 'bg-yellow-500 border-yellow-600 animate-pulse'
      case 'unknown':
        return 'bg-gray-400 border-gray-500'
      default:
        return 'bg-gray-400 border-gray-500'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'unknown':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getCapabilitiesCount = (thing: any) => {
    const properties = thing.thingDescription?.properties ? Object.keys(thing.thingDescription.properties).length : 0
    const actions = thing.thingDescription?.actions ? Object.keys(thing.thingDescription.actions).length : 0
    const events = thing.thingDescription?.events ? Object.keys(thing.thingDescription.events).length : 0
    return properties + actions + events
  }

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Never'
    const now = new Date()
    const time = new Date(lastSeen)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Device Status Grid
            </CardTitle>
            <CardDescription>
              Overview of all IoT devices and their current status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="connecting">Connecting</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredThings.length} of {things.length} devices
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {things.filter(t => t.status === 'online').length} online
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {things.filter(t => t.status === 'offline').length} offline
            </span>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {filteredThings.map((thing) => (
              <div
                key={thing.id}
                className="group relative"
              >
                <Link to={`/things/${thing.id}`}>
                  <div
                    className={`w-12 h-12 rounded-lg border-2 ${getStatusColor(thing.status)} cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-500 group-hover:ring-offset-2`}
                    title={`${thing.title} - ${thing.status}`}
                  >
                    {getStatusIcon(thing.status)}
                  </div>
                </Link>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                  <div className="font-medium">{thing.title}</div>
                  <div className="text-gray-300">{thing.status}</div>
                  <div className="text-gray-300">
                    {getCapabilitiesCount(thing)} capabilities
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredThings.map((thing) => (
              <div
                key={thing.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(thing.status).split(' ')[0]}`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{thing.title}</div>
                    {thing.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {thing.description}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className={`text-xs ${getStatusBadgeColor(thing.status)}`}>
                    {thing.status}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatLastSeen(thing.lastSeen)}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {getCapabilitiesCount(thing)} cap.
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/things/${thing.id}`} className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredThings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No devices found</p>
            <p className="text-sm">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by discovering or creating your first IoT device'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <div className="mt-4">
                <Button asChild>
                  <Link to="/things/discover">Discover Devices</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}