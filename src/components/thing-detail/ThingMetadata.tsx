import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Info, ExternalLink, Shield, Link, Globe, Calendar, Tag, FileText } from 'lucide-react'
import { Thing } from '@/stores/thingsStore'

interface ThingMetadataProps {
  thing: Thing
}

export function ThingMetadata({ thing }: ThingMetadataProps) {
  const td = thing.thingDescription

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified'
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const formatVersion = (version?: string | object) => {
    if (!version) return 'Not specified'
    if (typeof version === 'object') {
      return JSON.stringify(version)
    }
    return String(version)
  }

  const getSecuritySchemes = () => {
    if (!td?.securityDefinitions) return []
    return Object.entries(td.securityDefinitions).map(([name, scheme]: [string, any]) => ({
      name,
      ...scheme
    }))
  }

  const getLinks = () => {
    if (!td?.links) return []
    return Array.isArray(td.links) ? td.links : [td.links]
  }

  const getForms = () => {
    const forms: any[] = []
    
    // Collect forms from properties
    if (td?.properties) {
      Object.entries(td.properties).forEach(([name, prop]: [string, any]) => {
        if (prop.forms) {
          prop.forms.forEach((form: any) => {
            forms.push({ ...form, source: 'property', sourceName: name })
          })
        }
      })
    }

    // Collect forms from actions
    if (td?.actions) {
      Object.entries(td.actions).forEach(([name, action]: [string, any]) => {
        if (action.forms) {
          action.forms.forEach((form: any) => {
            forms.push({ ...form, source: 'action', sourceName: name })
          })
        }
      })
    }

    // Collect forms from events
    if (td?.events) {
      Object.entries(td.events).forEach(([name, event]: [string, any]) => {
        if (event.forms) {
          event.forms.forEach((form: any) => {
            forms.push({ ...form, source: 'event', sourceName: name })
          })
        }
      })
    }

    return forms
  }

  const securitySchemes = getSecuritySchemes()
  const links = getLinks()
  const forms = getForms()

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Title</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{td?.title || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{td?.description || 'Not specified'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">ID</label>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                  {td?.id || td?.['@id'] || thing.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {td?.['@type'] ? (
                    Array.isArray(td['@type']) ? (
                      td['@type'].map((type: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {td['@type']}
                      </Badge>
                    )
                  ) : (
                    <span className="text-sm text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Version</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{formatVersion(td?.version)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(td?.created)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Modified</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(td?.modified)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Support</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {td?.support ? (
                    typeof td.support === 'string' ? (
                      <a 
                        href={td.support} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {td.support}
                        <ExternalLink className="inline h-3 w-3 ml-1" />
                      </a>
                    ) : (
                      JSON.stringify(td.support)
                    )
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Context & Namespaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Context</label>
              <div className="mt-1">
                {td?.['@context'] ? (
                  Array.isArray(td['@context']) ? (
                    <div className="space-y-1">
                      {td['@context'].map((context: string | object, index: number) => (
                        <div key={index} className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          {typeof context === 'string' ? context : JSON.stringify(context, null, 2)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {typeof td['@context'] === 'string' ? td['@context'] : JSON.stringify(td['@context'], null, 2)}
                    </div>
                  )
                ) : (
                  <span className="text-sm text-gray-500">Not specified</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Configuration */}
      {securitySchemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Configuration
            </CardTitle>
            <CardDescription>
              Authentication and security mechanisms defined for this Thing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securitySchemes.map((scheme, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{scheme.name}</h4>
                    <Badge variant="outline">{scheme.scheme || 'unknown'}</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {scheme.description && (
                      <p>{scheme.description}</p>
                    )}
                    {scheme.in && (
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-mono">{scheme.in}</span>
                      </div>
                    )}
                    {scheme.name && scheme.scheme !== scheme.name && (
                      <div className="flex justify-between">
                        <span>Parameter:</span>
                        <span className="font-mono">{scheme.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {td?.security && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Applied Security</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Array.isArray(td.security) ? (
                      td.security.map((sec: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {typeof sec === 'string' ? sec : Object.keys(sec)[0]}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {typeof td.security === 'string' ? td.security : Object.keys(td.security)[0]}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Related Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {link.title || `Link ${index + 1}`}
                    </h4>
                    <Button variant="outline" size="sm" asChild>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>URL:</span>
                      <span className="font-mono break-all">{link.href}</span>
                    </div>
                    {link.rel && (
                      <div className="flex justify-between">
                        <span>Relation:</span>
                        <span className="font-mono">{link.rel}</span>
                      </div>
                    )}
                    {link.type && (
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-mono">{link.type}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Protocol Bindings */}
      {forms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Protocol Bindings ({forms.length})
            </CardTitle>
            <CardDescription>
              Communication endpoints and protocol details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forms.map((form, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {form.source}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {form.sourceName}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {form.op || form.method || 'GET'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Endpoint:</span>
                      <span className="font-mono break-all">{form.href}</span>
                    </div>
                    {form.contentType && (
                      <div className="flex justify-between">
                        <span>Content Type:</span>
                        <span className="font-mono">{form.contentType}</span>
                      </div>
                    )}
                    {form.subprotocol && (
                      <div className="flex justify-between">
                        <span>Subprotocol:</span>
                        <span className="font-mono">{form.subprotocol}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discovery Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Discovery Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Discovery Method</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {thing.discoveryMethod || 'Manual'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Source URL</label>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                  {thing.url || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Seen</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(thing.lastSeen)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                <Badge 
                  variant="outline" 
                  className={
                    thing.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    thing.status === 'offline' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }
                >
                  {thing.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}