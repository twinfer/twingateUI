import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DiscoveryModal } from '@/components/discovery/DiscoveryModal'
import { ThingsList } from '@/components/things/ThingsList'
import { Search, Plus, Globe } from 'lucide-react'
import { useThingsStore } from '@/stores/thingsStore'
import { useDiscoveryEndpointsStore } from '@/stores/discoveryEndpointsStore'
import { useNavigate } from 'react-router-dom'

export function Things() {
  const [discoveryModalOpen, setDiscoveryModalOpen] = useState(false)
  const { getFilteredThings } = useThingsStore()
  const { getSelectedEndpoint } = useDiscoveryEndpointsStore()
  const navigate = useNavigate()
  
  const filteredThings = getFilteredThings()
  const selectedEndpoint = getSelectedEndpoint()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Things</h1>
          {selectedEndpoint && (
            <p className="text-muted-foreground mt-1">
              Showing {filteredThings.length} things from {selectedEndpoint.name}
            </p>
          )}
          {!selectedEndpoint && (
            <p className="text-muted-foreground mt-1">
              Showing {filteredThings.length} things from all endpoints
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setDiscoveryModalOpen(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            Discover Things
          </Button>
          <Button onClick={() => navigate('/things/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Thing
          </Button>
        </div>
      </div>
      
      {filteredThings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Things Found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Start by discovering devices from your network or creating a new Thing manually.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setDiscoveryModalOpen(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                Discover Things
              </Button>
              <Button onClick={() => navigate('/things/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Thing
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ThingsList />
      )}

      <DiscoveryModal 
        open={discoveryModalOpen} 
        onOpenChange={setDiscoveryModalOpen} 
      />
    </div>
  )
}