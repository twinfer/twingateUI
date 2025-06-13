import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDiscoverThings, useDiscoverSingleThing } from '@/hooks/useDiscovery'
import { Search, Globe, Plus, X, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { DiscoveredThing } from '@/services/discoveryService'
import { DiscoveryResults } from './DiscoveryResults'

const bulkDiscoverySchema = z.object({
  urls: z.string().min(1, 'At least one URL is required'),
})

const singleDiscoverySchema = z.object({
  url: z.string().url('Please enter a valid URL'),
})

type BulkDiscoveryForm = z.infer<typeof bulkDiscoverySchema>
type SingleDiscoveryForm = z.infer<typeof singleDiscoverySchema>

interface DiscoveryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DiscoveryModal({ open, onOpenChange }: DiscoveryModalProps) {
  const [activeTab, setActiveTab] = useState('bulk')
  const [urlInputs, setUrlInputs] = useState([''])
  
  const discoverThings = useDiscoverThings()
  const discoverSingle = useDiscoverSingleThing()

  const bulkForm = useForm<BulkDiscoveryForm>({
    resolver: zodResolver(bulkDiscoverySchema),
  })

  const singleForm = useForm<SingleDiscoveryForm>({
    resolver: zodResolver(singleDiscoverySchema),
  })

  const handleBulkDiscovery = (data: BulkDiscoveryForm) => {
    const urls = data.urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .filter(url => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      })

    if (urls.length === 0) {
      return
    }

    discoverThings.discoverThings(urls)
  }

  const handleSingleDiscovery = (data: SingleDiscoveryForm) => {
    discoverSingle.mutate(data.url)
  }

  const addUrlInput = () => {
    setUrlInputs([...urlInputs, ''])
  }

  const removeUrlInput = (index: number) => {
    if (urlInputs.length > 1) {
      setUrlInputs(urlInputs.filter((_, i) => i !== index))
    }
  }

  const updateUrlInput = (index: number, value: string) => {
    const newInputs = [...urlInputs]
    newInputs[index] = value
    setUrlInputs(newInputs)
    
    // Update form value
    bulkForm.setValue('urls', newInputs.join('\n'))
  }

  const getProgressPercentage = () => {
    if (!discoverThings.progress) return 0
    return (discoverThings.progress.completed / discoverThings.progress.total) * 100
  }

  const isDiscovering = discoverThings.isDiscovering || discoverSingle.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Discover Things
          </DialogTitle>
          <DialogDescription>
            Discover Web of Things devices and services using URLs or network scanning
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bulk">Bulk Discovery</TabsTrigger>
            <TabsTrigger value="single">Single URL</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Bulk Discovery
                </CardTitle>
                <CardDescription>
                  Discover multiple Things by scanning base URLs for .well-known/wot endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={bulkForm.handleSubmit(handleBulkDiscovery)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Base URLs</Label>
                    <div className="space-y-2">
                      {urlInputs.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => updateUrlInput(index, e.target.value)}
                            disabled={isDiscovering}
                          />
                          {urlInputs.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeUrlInput(index)}
                              disabled={isDiscovering}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addUrlInput}
                      disabled={isDiscovering}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add URL
                    </Button>
                  </div>

                  {discoverThings.progress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Discovery Progress</span>
                        <span>{discoverThings.progress.completed} / {discoverThings.progress.total}</span>
                      </div>
                      <Progress value={getProgressPercentage()} />
                      <p className="text-sm text-muted-foreground">
                        {discoverThings.progress.status === 'scanning' && `Scanning: ${discoverThings.progress.current}`}
                        {discoverThings.progress.status === 'validating' && 'Validating Thing Descriptions...'}
                        {discoverThings.progress.status === 'completed' && 'Discovery completed!'}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isDiscovering || urlInputs.every(url => !url.trim())}
                      className="flex-1"
                    >
                      {discoverThings.isDiscovering ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Discovering...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Start Discovery
                        </>
                      )}
                    </Button>
                    {discoverThings.isDiscovering && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={discoverThings.cancelDiscovery}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="single" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Single Thing Discovery</CardTitle>
                <CardDescription>
                  Discover a single Thing by providing a direct URL to its Thing Description
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={singleForm.handleSubmit(handleSingleDiscovery)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="single-url">Thing Description URL</Label>
                    <Input
                      id="single-url"
                      placeholder="https://example.com/thing.jsonld"
                      {...singleForm.register('url')}
                      disabled={isDiscovering}
                    />
                    {singleForm.formState.errors.url && (
                      <p className="text-sm text-red-500">
                        {singleForm.formState.errors.url.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isDiscovering}
                    className="w-full"
                  >
                    {discoverSingle.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Discovering...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Discover Thing
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <DiscoveryResults />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}