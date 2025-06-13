import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { useThingsStore } from '@/stores/thingsStore'
import { useImportThing, useImportMultipleThings } from '@/hooks/useDiscovery'
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Download, 
  Eye, 
  Trash2,
  Globe
} from 'lucide-react'
import { DiscoveredThing } from '@/services/discoveryService'
import { ThingPreviewDialog } from './ThingPreviewDialog'

export function DiscoveryResults() {
  const { discoveredThings, setDiscoveredThings } = useThingsStore()
  const [selectedThings, setSelectedThings] = useState<Set<string>>(new Set())
  const [previewThing, setPreviewThing] = useState<DiscoveredThing | null>(null)
  
  const importSingle = useImportThing()
  const importMultiple = useImportMultipleThings()

  const handleSelectThing = (thingId: string, checked: boolean) => {
    const newSelected = new Set(selectedThings)
    if (checked) {
      newSelected.add(thingId)
    } else {
      newSelected.delete(thingId)
    }
    setSelectedThings(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedThings(new Set(discoveredThings.map(t => t.id)))
    } else {
      setSelectedThings(new Set())
    }
  }

  const handleImportSelected = () => {
    const thingsToImport = discoveredThings.filter(t => selectedThings.has(t.id))
    importMultiple.mutate(thingsToImport)
  }

  const handleRemoveThing = (thingId: string) => {
    const filtered = discoveredThings.filter(t => t.id !== thingId)
    setDiscoveredThings(filtered)
    setSelectedThings(prev => {
      const newSet = new Set(prev)
      newSet.delete(thingId)
      return newSet
    })
  }

  const getValidationIcon = (status: DiscoveredThing['validationStatus']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getValidationBadge = (status: DiscoveredThing['validationStatus']) => {
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Valid</Badge>
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getDiscoveryMethodBadge = (method: DiscoveredThing['discoveryMethod']) => {
    const badges = {
      'well-known': <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />.well-known</Badge>,
      'direct-url': <Badge variant="secondary">Direct URL</Badge>,
      'scan': <Badge variant="default">Network Scan</Badge>
    }
    return badges[method]
  }

  if (discoveredThings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Things Discovered</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Start a discovery to find Web of Things devices and services. 
            Use the Bulk Discovery or Single URL tabs to begin.
          </p>
        </CardContent>
      </Card>
    )
  }

  const allSelected = selectedThings.size === discoveredThings.length
  const someSelected = selectedThings.size > 0

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discovery Results</CardTitle>
              <CardDescription>
                Found {discoveredThings.length} Things. Select which ones to import.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {someSelected && (
                <Button 
                  onClick={handleImportSelected}
                  disabled={importMultiple.isPending}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Import Selected ({selectedThings.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={importMultiple.isPending}
              />
              <label className="text-sm font-medium">
                Select All ({discoveredThings.length})
              </label>
            </div>

            {/* Things List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {discoveredThings.map((thing) => (
                  <Card key={thing.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedThings.has(thing.id)}
                          onCheckedChange={(checked) => 
                            handleSelectThing(thing.id, checked as boolean)
                          }
                          disabled={importMultiple.isPending}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{thing.title}</h4>
                              {thing.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {thing.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {getValidationIcon(thing.validationStatus)}
                                {getValidationBadge(thing.validationStatus)}
                                {getDiscoveryMethodBadge(thing.discoveryMethod)}
                                <Badge variant="outline" className="text-xs">
                                  {thing.url}
                                </Badge>
                              </div>
                              
                              {thing.validationErrors && thing.validationErrors.length > 0 && (
                                <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                                  <div className="font-medium text-red-800 mb-1">Validation Errors:</div>
                                  <ul className="text-red-700 space-y-1">
                                    {thing.validationErrors.slice(0, 3).map((error, idx) => (
                                      <li key={idx}>• {error}</li>
                                    ))}
                                    {thing.validationErrors.length > 3 && (
                                      <li>• ... and {thing.validationErrors.length - 3} more</li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewThing(thing)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => importSingle.mutate(thing)}
                                disabled={importSingle.isPending}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveThing(thing.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Summary */}
            <div className="pt-2 border-t">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {discoveredThings.filter(t => t.validationStatus === 'valid').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Valid</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">
                    {discoveredThings.filter(t => t.validationStatus === 'warning').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">
                    {discoveredThings.filter(t => t.validationStatus === 'invalid').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Invalid</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-600">
                    {discoveredThings.filter(t => t.validationStatus === 'pending').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {previewThing && (
        <ThingPreviewDialog
          thing={previewThing}
          open={!!previewThing}
          onOpenChange={(open) => !open && setPreviewThing(null)}
        />
      )}
    </>
  )
}