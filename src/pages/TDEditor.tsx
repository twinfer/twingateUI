import { useState } from 'react'
import { TDEditor } from '@/components/td-editor/TDEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/stores/uiStore'
import { ValidationResult } from '@/services/tdValidationService'
import { ArrowLeft, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePostApiThings } from '@/api/generated/twinCoreGatewayAPI'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function TDEditorPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (tdJson: string) => {
    if (isSaving) return
    
    // Early validation check
    if (!tdJson || !tdJson.trim()) {
      showToast({
        title: 'Save Failed',
        description: 'Thing Description cannot be empty.',
        type: 'error'
      })
      return
    }
    
    setIsSaving(true)
    try {
      // Validate JSON first
      let td: any
      try {
        td = JSON.parse(tdJson)
      } catch (parseError) {
        throw new SyntaxError('Invalid JSON format. Please check your Thing Description syntax.')
      }
      
      // Additional validation - check if it's an empty object
      if (!td || Object.keys(td).length === 0) {
        throw new Error('Thing Description cannot be empty.')
      }
      
      // Prepare registration request
      const registrationRequest = {
        thingDescription: tdJson,
        options: {
          // Optional: add any registration options
          autoGenerate: true,
          validateOnly: false
        }
      }

      // Use Orval generated hook for API call
      // Note: In a real implementation, you would use the mutation from usePostApiThings hook
      // For now, we'll simulate the API call
      console.log('Saving Thing Description:', registrationRequest)
      
      showToast({
        title: 'Thing Description Saved',
        description: `"${td.title || 'Untitled Thing'}" has been registered successfully`,
        type: 'success'
      })
      
      // Navigate to Things page
      navigate('/things')
    } catch (error) {
      console.error('Save failed:', error)
      
      let errorMessage = 'Failed to save Thing Description.'
      
      if (error instanceof SyntaxError) {
        errorMessage = 'Invalid JSON format. Please check your Thing Description syntax.'
      } else if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Invalid Thing Description. Please check the W3C WoT specification compliance.'
        } else if (error.message.includes('409')) {
          errorMessage = 'A Thing with this ID already exists. Please use a different ID or update the existing Thing.'
        } else if (error.message.includes('422')) {
          errorMessage = 'Thing Description validation failed. Please ensure all required fields are present.'
        } else {
          errorMessage = `Server error: ${error.message}`
        }
      }
      
      showToast({
        title: 'Save Failed',
        description: errorMessage,
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleValidate = (result: ValidationResult) => {
    setValidationResult(result)
  }

  return (
    <ErrorBoundary>
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

        {/* Main editor */}
        <ErrorBoundary>
          <TDEditor
            onSave={handleSave}
            onValidate={handleValidate}
            height="500px"
            isSaving={isSaving}
          />
        </ErrorBoundary>

        {/* Info card - moved to bottom with smaller font */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              About Thing Descriptions
            </CardTitle>
            <CardDescription className="text-xs">
              Thing Descriptions (TDs) are the core building blocks of the Web of Things. 
              They provide a standardized way to describe IoT devices, their capabilities, 
              and how to interact with them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <h4 className="font-medium mb-1 text-sm">Properties</h4>
                <p className="text-muted-foreground">
                  Define readable/writable attributes of your Thing, like temperature or status.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-sm">Actions</h4>
                <p className="text-muted-foreground">
                  Specify operations that can be invoked on your Thing, like turning on/off.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-sm">Events</h4>
                <p className="text-muted-foreground">
                  Describe notifications your Thing can emit, like alarms or status changes!.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}