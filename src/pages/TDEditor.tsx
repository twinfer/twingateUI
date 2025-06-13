import { useState } from 'react'
import { TDEditor } from '@/components/td-editor/TDEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/stores/uiStore'
import { useThingsStore } from '@/stores/thingsStore'
import { ValidationResult } from '@/services/tdValidationService'
import { ArrowLeft, FileText, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function TDEditorPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { addThing } = useThingsStore()
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const handleSave = async (tdJson: string) => {
    try {
      const td = JSON.parse(tdJson)
      
      // Create a new Thing from the TD
      const newThing = {
        id: td.id || `thing-${Date.now()}`,
        title: td.title || 'Untitled Thing',
        description: td.description,
        thingDescription: td,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        online: false,
        status: 'unknown' as const,
        lastSeen: undefined,
        discoveryMethod: 'manual',
        properties: extractProperties(td),
        actions: extractActions(td),
        events: extractEvents(td),
        tags: extractTags(td),
        category: extractCategory(td)
      }

      addThing(newThing)
      
      showToast({
        title: 'Thing Description Saved',
        description: `"${newThing.title}" has been added to your Things`,
        type: 'success'
      })
      
      // Navigate to Things page
      navigate('/things')
    } catch (error) {
      showToast({
        title: 'Save Failed',
        description: 'Failed to save Thing Description. Please check the JSON format.',
        type: 'error'
      })
    }
  }

  const handleValidate = (result: ValidationResult) => {
    setValidationResult(result)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/things')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Things
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Thing Description Editor</h1>
          <p className="text-muted-foreground">
            Create and edit W3C Web of Things (WoT) Thing Descriptions
          </p>
        </div>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            About Thing Descriptions
          </CardTitle>
          <CardDescription>
            Thing Descriptions (TDs) are the core building blocks of the Web of Things. 
            They provide a standardized way to describe IoT devices, their capabilities, 
            and how to interact with them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Properties</h4>
              <p className="text-muted-foreground">
                Define readable/writable attributes of your Thing, like temperature or status.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Actions</h4>
              <p className="text-muted-foreground">
                Specify operations that can be invoked on your Thing, like turning on/off.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Events</h4>
              <p className="text-muted-foreground">
                Describe notifications your Thing can emit, like alarms or status changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main editor */}
      <TDEditor
        onSave={handleSave}
        onValidate={handleValidate}
        height="500px"
      />

      {/* Save hint */}
      {validationResult?.isValid && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Save className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Thing Description is valid!
              </p>
              <p className="text-xs text-green-600">
                Click the Save button in the editor to add this Thing to your collection.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper functions to extract TD components
function extractProperties(td: any) {
  if (!td.properties) return []
  
  return Object.entries(td.properties).map(([key, prop]: [string, any]) => ({
    id: key,
    name: prop.title || key,
    type: prop.type || 'unknown',
    value: null,
    lastUpdated: new Date().toISOString(),
    writable: prop.writeOnly !== true,
    observable: prop.observable === true,
  }))
}

function extractActions(td: any) {
  if (!td.actions) return []
  
  return Object.entries(td.actions).map(([key, action]: [string, any]) => ({
    id: key,
    name: action.title || key,
    input: action.input,
    output: action.output,
    description: action.description,
  }))
}

function extractEvents(td: any) {
  if (!td.events) return []
  
  return Object.entries(td.events).map(([key, event]: [string, any]) => ({
    id: key,
    name: event.title || key,
    data: event.data,
    description: event.description,
  }))
}

function extractTags(td: any): string[] {
  const tags: string[] = []
  
  if (td['@type']) {
    const types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']]
    tags.push(...types.filter((type: any) => typeof type === 'string'))
  }
  
  if (td.securityDefinitions) {
    Object.keys(td.securityDefinitions).forEach(scheme => {
      tags.push(`security:${scheme}`)
    })
  }
  
  return tags
}

function extractCategory(td: any): string | undefined {
  if (td['@type']) {
    const types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']]
    
    for (const type of types) {
      if (typeof type === 'string') {
        if (type.includes('Sensor')) return 'sensor'
        if (type.includes('Actuator')) return 'actuator'
        if (type.includes('Light')) return 'lighting'
        if (type.includes('Thermostat') || type.includes('Temperature')) return 'climate'
        if (type.includes('Camera') || type.includes('Video')) return 'security'
        if (type.includes('Motor') || type.includes('Pump')) return 'actuator'
      }
    }
  }
  
  return 'other'
}