import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Code, Copy, Download, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Thing } from '@/stores/thingsStore'
import { toast } from 'sonner'
import { tdValidationService } from '@/services/tdValidationService'

interface ThingDescriptionProps {
  thing: Thing
}

export function ThingDescription({ thing }: ThingDescriptionProps) {
  const [showFormatted, setShowFormatted] = useState(true)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)

  const thingDescription = thing.thingDescription || {}
  const tdJson = JSON.stringify(thingDescription, null, showFormatted ? 2 : 0)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tdJson)
      toast.success('Thing Description copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadTD = () => {
    const blob = new Blob([tdJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${thing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-td.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Thing Description downloaded')
  }

  const validateTD = async () => {
    setIsValidating(true)
    try {
      const result = await tdValidationService.validateTD(thingDescription)
      setValidationResult(result)
      
      if (result.isValid) {
        toast.success('Thing Description is valid')
      } else {
        toast.error(`Thing Description has ${result.errors.length} error(s)`)
      }
    } catch (error) {
      toast.error('Validation failed')
      setValidationResult({
        isValid: false,
        errors: [{ message: 'Validation service error', severity: 'critical' }],
        warnings: [],
        details: {}
      })
    } finally {
      setIsValidating(false)
    }
  }

  const getValidationIcon = () => {
    if (!validationResult) return null
    
    if (validationResult.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getValidationBadge = () => {
    if (!validationResult) return null
    
    if (validationResult.isValid) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Valid TD
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          {validationResult.errors.length} Error(s)
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Thing Description JSON
              </CardTitle>
              <CardDescription>
                Raw Thing Description document in W3C WoT format
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getValidationBadge()}
              <Button
                onClick={validateTD}
                disabled={isValidating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-3 w-3 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
                Validate
              </Button>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-3 w-3 mr-2" />
                Copy
              </Button>
              <Button onClick={downloadTD} variant="outline" size="sm">
                <Download className="h-3 w-3 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={showFormatted}
              onCheckedChange={setShowFormatted}
              id="format-toggle"
            />
            <Label htmlFor="format-toggle" className="text-sm">
              Pretty print (formatted JSON)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getValidationIcon()}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {validationResult.errors.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Errors</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {validationResult.warnings.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Warnings</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {validationResult.details.contextValid ? '✓' : '✗'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Context</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {validationResult.details.schemaValid ? '✓' : '✗'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Schema</div>
              </div>
            </div>

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-800 dark:text-red-300">Errors</h4>
                <div className="space-y-1">
                  {validationResult.errors.map((error: any, index: number) => (
                    <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-red-800 dark:text-red-300">{error.message}</div>
                          {error.path && (
                            <div className="text-red-600 dark:text-red-400 text-xs font-mono">
                              Path: {error.path}
                            </div>
                          )}
                          {error.line && (
                            <div className="text-red-600 dark:text-red-400 text-xs">
                              Line: {error.line}
                              {error.column && `, Column: ${error.column}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Warnings</h4>
                <div className="space-y-1">
                  {validationResult.warnings.map((warning: any, index: number) => (
                    <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-yellow-800 dark:text-yellow-300">{warning.message}</div>
                          {warning.path && (
                            <div className="text-yellow-600 dark:text-yellow-400 text-xs font-mono">
                              Path: {warning.path}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Details */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-300">Validation Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Context Valid:</span>
                  <span className={validationResult.details.contextValid ? 'text-green-600' : 'text-red-600'}>
                    {validationResult.details.contextValid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Required Fields:</span>
                  <span className={validationResult.details.requiredFieldsPresent ? 'text-green-600' : 'text-red-600'}>
                    {validationResult.details.requiredFieldsPresent ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Schema Valid:</span>
                  <span className={validationResult.details.schemaValid ? 'text-green-600' : 'text-red-600'}>
                    {validationResult.details.schemaValid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Security Valid:</span>
                  <span className={validationResult.details.securityValid ? 'text-green-600' : 'text-red-600'}>
                    {validationResult.details.securityValid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Links Valid:</span>
                  <span className={validationResult.details.linksValid ? 'text-green-600' : 'text-red-600'}>
                    {validationResult.details.linksValid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Forms Valid:</span>
                  <span className={validationResult.details.formsValid ? 'text-green-600' : 'text-red-600'}>
                    {validationResult.details.formsValid ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">JSON Content</CardTitle>
          <CardDescription>
            {Object.keys(thingDescription).length} top-level properties • {tdJson.length} characters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              value={tdJson}
              readOnly
              className="font-mono text-sm resize-none min-h-96 max-h-screen"
              style={{ 
                whiteSpace: showFormatted ? 'pre' : 'pre-wrap',
                wordBreak: 'break-all'
              }}
            />
            <div className="absolute top-2 right-2">
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {thingDescription.properties ? Object.keys(thingDescription.properties).length : 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Properties</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {thingDescription.actions ? Object.keys(thingDescription.actions).length : 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Actions</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {thingDescription.events ? Object.keys(thingDescription.events).length : 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Events</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {thingDescription.securityDefinitions ? Object.keys(thingDescription.securityDefinitions).length : 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Security Schemes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}