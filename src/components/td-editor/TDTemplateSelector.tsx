import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search,
  FileText,
  Thermometer,
  Lightbulb,
  Settings,
  Shield,
  Code2
} from 'lucide-react'
import { tdTemplates, tdSnippets, TDTemplate, TDSnippet, getTemplatesByCategory, getSnippetsByCategory } from '@/data/tdTemplates'

interface TDTemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (template: TDTemplate) => void
  onSnippetSelect?: (snippet: TDSnippet) => void
}

export function TDTemplateSelector({ 
  open, 
  onOpenChange, 
  onSelect,
  onSnippetSelect 
}: TDTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return <FileText className="h-4 w-4" />
      case 'sensor': return <Thermometer className="h-4 w-4" />
      case 'actuator': return <Lightbulb className="h-4 w-4" />
      case 'complex': return <Settings className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getSnippetIcon = (category: string) => {
    switch (category) {
      case 'property': return <FileText className="h-4 w-4" />
      case 'action': return <Settings className="h-4 w-4" />
      case 'event': return <Lightbulb className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
      case 'form': return <Code2 className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredTemplates = tdTemplates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const filteredSnippets = tdSnippets.filter(snippet => {
    const matchesSearch = searchQuery === '' || 
      snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const templateCategories = [
    { id: 'all', name: 'All Templates', count: tdTemplates.length },
    { id: 'basic', name: 'Basic', count: getTemplatesByCategory('basic').length },
    { id: 'sensor', name: 'Sensors', count: getTemplatesByCategory('sensor').length },
    { id: 'actuator', name: 'Actuators', count: getTemplatesByCategory('actuator').length },
    { id: 'complex', name: 'Complex', count: getTemplatesByCategory('complex').length },
    { id: 'security', name: 'Security', count: getTemplatesByCategory('security').length },
  ]

  const snippetCategories = [
    { id: 'property', name: 'Properties', count: getSnippetsByCategory('property').length },
    { id: 'action', name: 'Actions', count: getSnippetsByCategory('action').length },
    { id: 'event', name: 'Events', count: getSnippetsByCategory('event').length },
    { id: 'security', name: 'Security', count: getSnippetsByCategory('security').length },
    { id: 'form', name: 'Forms', count: getSnippetsByCategory('form').length },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Thing Description Templates & Snippets</DialogTitle>
          <DialogDescription>
            Choose a template to start with or browse snippets to add specific components
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates and snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="snippets">Snippets</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                {templateCategories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>

              {/* Templates grid */}
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                  {filteredTemplates.map(template => (
                    <Card 
                      key={template.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(template.category)}
                            <CardTitle className="text-sm">{template.name}</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="snippets" className="space-y-4">
              {/* Snippet categories */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {snippetCategories.map(category => (
                  <Card key={category.id} className="text-center">
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center gap-2">
                        {getSnippetIcon(category.id)}
                        <div className="text-sm font-medium">{category.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Snippets list */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {filteredSnippets.map(snippet => (
                    <Card 
                      key={snippet.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onSnippetSelect?.(snippet)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getSnippetIcon(snippet.category)}
                            <div>
                              <div className="font-medium text-sm">{snippet.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {snippet.description}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {snippet.category}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {snippet.insertText.split('\n').slice(0, 3).join('\n')}
                            {snippet.insertText.split('\n').length > 3 && '\n...'}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {filteredTemplates.length === 0 && filteredSnippets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No templates or snippets found matching your search.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}