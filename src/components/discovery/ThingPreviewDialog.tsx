import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useImportThing } from '@/hooks/useDiscovery'
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock,
  Globe,
  Code,
  Settings,
  Activity,
  Zap
} from 'lucide-react'
import { DiscoveredThing } from '@/services/discoveryService'

interface ThingPreviewDialogProps {
  thing: DiscoveredThing
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThingPreviewDialog({ thing, open, onOpenChange }: ThingPreviewDialogProps) {
  const importThing = useImportThing()

  const handleImport = () => {
    importThing.mutate(thing)
    onOpenChange(false)
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

  const td = thing.thingDescription as any
  const properties = td.properties ? Object.entries(td.properties) : []
  const actions = td.actions ? Object.entries(td.actions) : []
  const events = td.events ? Object.entries(td.events) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{thing.title}</DialogTitle>
              {thing.description && (
                <DialogDescription className="mt-1">
                  {thing.description}
                </DialogDescription>
              )}
              <div className="flex items-center gap-2 mt-2">
                {getValidationIcon(thing.validationStatus)}
                <Badge variant={thing.validationStatus === 'valid' ? 'default' : 'destructive'}>
                  {thing.validationStatus}
                </Badge>
                <Badge variant="outline">
                  <Globe className="h-3 w-3 mr-1" />
                  {thing.discoveryMethod}
                </Badge>
              </div>
            </div>
            <Button onClick={handleImport} disabled={importThing.isPending}>
              <Download className="h-4 w-4 mr-2" />
              Import Thing
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties ({properties.length})</TabsTrigger>
            <TabsTrigger value="actions">Actions ({actions.length})</TabsTrigger>
            <TabsTrigger value="raw">Raw TD</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {td.id || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">URL:</span> {thing.url}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {td.created || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Modified:</span> {td.modified || 'Unknown'}
                    </div>
                    {td.version && (
                      <div>
                        <span className="font-medium">Version:</span> {td.version.instance}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>{properties.length} Properties</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>{actions.length} Actions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>{events.length} Events</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {thing.validationErrors && thing.validationErrors.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-red-800">Validation Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm text-red-700">
                      {thing.validationErrors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {td.links && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {td.links.map((link: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <Badge variant="outline" className="mr-2">{link.rel}</Badge>
                          <span className="font-mono text-xs">{link.href}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              {properties.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No properties defined</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {properties.map(([key, prop]: [string, any]) => (
                    <Card key={key}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{prop.title || key}</CardTitle>
                        {prop.description && (
                          <CardDescription className="text-xs">
                            {prop.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">Type: {prop.type || 'unknown'}</Badge>
                          {prop.readOnly && <Badge variant="secondary">Read Only</Badge>}
                          {prop.writeOnly && <Badge variant="secondary">Write Only</Badge>}
                          {prop.observable && <Badge variant="default">Observable</Badge>}
                          {prop.unit && <Badge variant="outline">Unit: {prop.unit}</Badge>}
                        </div>
                        {(prop.minimum !== undefined || prop.maximum !== undefined) && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Range: {prop.minimum ?? '−∞'} to {prop.maximum ?? '+∞'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              {actions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Zap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No actions defined</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {actions.map(([key, action]: [string, any]) => (
                    <Card key={key}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{action.title || key}</CardTitle>
                        {action.description && (
                          <CardDescription className="text-xs">
                            {action.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {action.input && (
                            <div>
                              <span className="text-xs font-medium">Input:</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {action.input.type || 'object'}
                              </Badge>
                            </div>
                          )}
                          {action.output && (
                            <div>
                              <span className="text-xs font-medium">Output:</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {action.output.type || 'object'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="raw" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Raw Thing Description (JSON-LD)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(thing.thingDescription, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}