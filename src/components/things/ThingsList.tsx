import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List,
  RefreshCw
} from 'lucide-react'
import { useThingsStore, Thing } from '@/stores/thingsStore'
import { ThingCard } from './ThingCard'

type SortField = 'title' | 'status' | 'lastSeen' | 'discoveryMethod'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'
type StatusFilter = 'all' | 'online' | 'offline' | 'unknown' | 'connecting'

export function ThingsList() {
  const { getFilteredThings, deleteThing } = useThingsStore()
  const things = getFilteredThings()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const filteredAndSortedThings = useMemo(() => {
    let filtered = things

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(thing => 
        thing.title.toLowerCase().includes(query) ||
        thing.description?.toLowerCase().includes(query) ||
        thing.id.toLowerCase().includes(query) ||
        thing.url?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(thing => thing.status === statusFilter)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'lastSeen':
          aValue = a.lastSeen ? new Date(a.lastSeen) : new Date(0)
          bValue = b.lastSeen ? new Date(b.lastSeen) : new Date(0)
          break
        case 'discoveryMethod':
          aValue = a.discoveryMethod || 'manual'
          bValue = b.discoveryMethod || 'manual'
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [things, searchQuery, statusFilter, sortField, sortOrder])

  const handleEdit = (thing: Thing) => {
    // TODO: Implement edit functionality
    console.log('Edit thing:', thing)
  }

  const handleDelete = (thing: Thing) => {
    if (confirm(`Are you sure you want to delete "${thing.title}"?`)) {
      deleteThing(thing.id)
    }
  }

  const handleView = (thing: Thing) => {
    // TODO: Implement view details functionality
    console.log('View thing:', thing)
  }

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const statusCounts = useMemo(() => {
    return things.reduce((acc, thing) => {
      acc[thing.status] = (acc[thing.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [things])

  if (things.length === 0) {
    return null // Parent component will show empty state
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search things by title, description, or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">
                Online {statusCounts.online ? `(${statusCounts.online})` : ''}
              </SelectItem>
              <SelectItem value="offline">
                Offline {statusCounts.offline ? `(${statusCounts.offline})` : ''}
              </SelectItem>
              <SelectItem value="unknown">
                Unknown {statusCounts.unknown ? `(${statusCounts.unknown})` : ''}
              </SelectItem>
              <SelectItem value="connecting">
                Connecting {statusCounts.connecting ? `(${statusCounts.connecting})` : ''}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Sort by Title</SelectItem>
              <SelectItem value="status">Sort by Status</SelectItem>
              <SelectItem value="lastSeen">Sort by Last Seen</SelectItem>
              <SelectItem value="discoveryMethod">Sort by Discovery</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={toggleSort}>
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Showing {filteredAndSortedThings.length} of {things.length} things
        </span>
        {searchQuery && (
          <Badge variant="outline">
            Search: "{searchQuery}"
          </Badge>
        )}
        {statusFilter !== 'all' && (
          <Badge variant="outline">
            Status: {statusFilter}
          </Badge>
        )}
      </div>

      {/* Things Grid/List */}
      {filteredAndSortedThings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No things match your current filters.
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
            }}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }>
          {filteredAndSortedThings.map((thing) => (
            <ThingCard
              key={thing.id}
              thing={thing}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  )
}