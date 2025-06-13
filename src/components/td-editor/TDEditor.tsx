import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  FileText,
  Save,
  Download,
  Upload,
  RefreshCw,
  Lightbulb
} from 'lucide-react'
import { tdValidationService, ValidationResult } from '@/services/tdValidationService'
import { tdTemplates, tdSnippets, TDTemplate } from '@/data/tdTemplates'
import { TDTemplateSelector } from './TDTemplateSelector'
import { TDValidationPanel } from './TDValidationPanel'
import { useToast } from '@/stores/uiStore'

interface TDEditorProps {
  initialValue?: string
  onSave?: (td: string) => void
  onValidate?: (result: ValidationResult) => void
  readonly?: boolean
  height?: string
}

export function TDEditor({ 
  initialValue = '', 
  onSave,
  onValidate,
  readonly = false,
  height = '600px'
}: TDEditorProps) {
  const [value, setValue] = useState(initialValue || getDefaultTD())
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showTemplates, setShowTemplates] = useState(!initialValue)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (initialValue && initialValue !== value) {
      setValue(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    // Auto-validate after changes (debounced)
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        validateTD()
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [value])

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    // Configure editor
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true
    })

    // Add custom actions
    editor.addAction({
      id: 'validate-td',
      label: 'Validate Thing Description',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR],
      run: () => validateTD()
    })

    editor.addAction({
      id: 'format-json',
      label: 'Format JSON',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      run: () => formatJSON()
    })

    // Set JSON schema for validation
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        uri: 'http://json-schema.org/draft-07/schema#',
        fileMatch: ['*'],
        schema: {
          type: 'object',
          properties: {
            '@context': {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } }
              ]
            },
            '@type': {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } }
              ]
            },
            title: { type: 'string' },
            description: { type: 'string' },
            properties: { type: 'object' },
            actions: { type: 'object' },
            events: { type: 'object' },
            securityDefinitions: { type: 'object' },
            security: {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } }
              ]
            }
          },
          required: ['@context', 'title']
        }
      }]
    })
  }

  const validateTD = async () => {
    if (!value.trim()) return

    setIsValidating(true)
    try {
      const result = await tdValidationService.validateTD(value)
      setValidationResult(result)
      onValidate?.(result)

      // Update editor markers
      if (editorRef.current) {
        const model = editorRef.current.getModel()
        if (model) {
          const markers: monaco.editor.IMarkerData[] = result.errors.map(error => ({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: error.line || 1,
            startColumn: error.column || 1,
            endLineNumber: error.line || 1,
            endColumn: (error.column || 1) + 10,
            message: error.message
          }))

          result.warnings.forEach(warning => {
            markers.push({
              severity: monaco.MarkerSeverity.Warning,
              startLineNumber: warning.line || 1,
              startColumn: warning.column || 1,
              endLineNumber: warning.line || 1,
              endColumn: (warning.column || 1) + 10,
              message: warning.message
            })
          })

          monaco.editor.setModelMarkers(model, 'td-validation', markers)
        }
      }
    } catch (error) {
      showToast({
        title: 'Validation Error',
        description: error instanceof Error ? error.message : 'Unknown validation error',
        type: 'error'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const formatJSON = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run()
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(value)
      showToast({
        title: 'Thing Description Saved',
        description: 'Your Thing Description has been saved successfully',
        type: 'success'
      })
    }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([value], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'thing-description.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showToast({
        title: 'Download Started',
        description: 'Thing Description file download started',
        type: 'success'
      })
    } catch (error) {
      showToast({
        title: 'Download Failed',
        description: 'Failed to download Thing Description',
        type: 'error'
      })
    }
  }

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          try {
            // Validate JSON
            JSON.parse(content)
            setValue(content)
            setShowTemplates(false)
            showToast({
              title: 'File Loaded',
              description: 'Thing Description loaded successfully',
              type: 'success'
            })
          } catch (error) {
            showToast({
              title: 'Invalid JSON',
              description: 'The uploaded file contains invalid JSON',
              type: 'error'
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleTemplateSelect = (template: TDTemplate) => {
    setValue(JSON.stringify(template.template, null, 2))
    setShowTemplates(false)
    showToast({
      title: 'Template Applied',
      description: `${template.name} template loaded`,
      type: 'success'
    })
  }

  const getValidationIcon = () => {
    if (isValidating) return <RefreshCw className="h-4 w-4 animate-spin" />
    if (!validationResult) return <FileText className="h-4 w-4" />
    if (validationResult.isValid) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getValidationBadge = () => {
    if (isValidating) return <Badge variant="outline">Validating...</Badge>
    if (!validationResult) return <Badge variant="secondary">Not Validated</Badge>
    if (validationResult.isValid) {
      return (
        <Badge variant="default" className="bg-green-500">
          Valid {validationResult.warnings.length > 0 && `(${validationResult.warnings.length} warnings)`}
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        Invalid ({validationResult.errors.length} errors)
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Thing Description Editor</CardTitle>
              {getValidationIcon()}
              {getValidationBadge()}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={validateTD}
                disabled={isValidating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
                Validate
              </Button>
              {onSave && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={readonly || !validationResult?.isValid}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main editor area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Editor
                height={height}
                defaultLanguage="json"
                value={value}
                onChange={(newValue) => setValue(newValue || '')}
                onMount={handleEditorDidMount}
                options={{
                  readOnly: readonly,
                  theme: 'vs-dark',
                  automaticLayout: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on'
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Validation panel */}
        <div className="space-y-4">
          <TDValidationPanel 
            validationResult={validationResult}
            isValidating={isValidating}
          />
          
          {validationResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {tdValidationService.getSuggestions(JSON.parse(value || '{}')).map((suggestion, idx) => (
                    <div key={idx} className="text-muted-foreground">
                      • {suggestion}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Template selector modal */}
      <TDTemplateSelector
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelect={handleTemplateSelect}
      />
    </div>
  )
}

function getDefaultTD(): string {
  return JSON.stringify({
    "@context": [
      "https://www.w3.org/2019/wot/td/v1",
      {"@language": "en"}
    ],
    "@type": "Thing",
    "title": "My Thing",
    "description": "A simple Thing Description",
    "securityDefinitions": {
      "nosec_sc": {"scheme": "nosec"}
    },
    "security": ["nosec_sc"]
  }, null, 2)
}