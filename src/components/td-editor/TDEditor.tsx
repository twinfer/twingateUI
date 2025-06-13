import React, { useState, useEffect, useRef, useMemo } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { setupMonacoSchemas, createTDCompletionProvider } from './MonacoSetup'
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
import { TDEditorErrorBoundary } from './TDEditorErrorBoundary'
import { useToast } from '@/stores/uiStore'

interface TDEditorProps {
  initialValue?: string
  onSave?: (td: string) => void
  onValidate?: (result: ValidationResult) => void
  readonly?: boolean
  height?: string
  isSaving?: boolean
}

// Safe JSON parsing utility
function safeJsonParse(jsonString: string): any | null {
  try {
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

export function TDEditor({ 
  initialValue = '', 
  onSave,
  onValidate,
  readonly = false,
  height = '600px',
  isSaving = false
}: TDEditorProps) {
  // Ensure we have a safe initial value
  const safeInitialValue = useMemo(() => {
    if (!initialValue) return getDefaultTD()
    
    // Validate the initial value is valid JSON
    const parsed = safeJsonParse(initialValue)
    if (parsed === null) {
      console.warn('Invalid initial JSON provided to TDEditor, using default')
      return getDefaultTD()
    }
    
    return initialValue
  }, [initialValue])

  const [value, setValue] = useState(safeInitialValue)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showTemplates, setShowTemplates] = useState(!initialValue)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (initialValue && initialValue !== value) {
      // Validate before setting
      const parsed = safeJsonParse(initialValue)
      if (parsed !== null) {
        setValue(initialValue)
      } else {
        console.warn('Skipping invalid JSON update in TDEditor')
      }
    }
  }, [initialValue, value])

  useEffect(() => {
    // Auto-validate after changes (debounced)
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        // Let the validation service handle all JSON parsing errors
        validateTD()
      } else {
        // Clear validation result if value is empty
        setValidationResult(null)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [value])

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    // Setup enhanced schemas and validation
    setupMonacoSchemas()
    
    // Register completion provider
    monaco.languages.registerCompletionItemProvider('json', createTDCompletionProvider())
    
    // Configure editor with enhanced options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      autoIndent: 'advanced',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      },
      foldingStrategy: 'indentation',
      showFoldingControls: 'always'
    })

    // Add custom actions
    editor.addAction({
      id: 'validate-td',
      label: 'Validate Thing Description',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR],
      contextMenuGroupId: 'td-actions',
      contextMenuOrder: 1,
      run: () => validateTD()
    })

    editor.addAction({
      id: 'format-json',
      label: 'Format JSON',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      contextMenuGroupId: 'td-actions',
      contextMenuOrder: 2,
      run: () => formatJSON()
    })

    editor.addAction({
      id: 'insert-property',
      label: 'Insert Property Template',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP],
      contextMenuGroupId: 'td-templates',
      contextMenuOrder: 1,
      run: () => insertPropertyTemplate()
    })

    editor.addAction({
      id: 'insert-action',
      label: 'Insert Action Template',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyA],
      contextMenuGroupId: 'td-templates',
      contextMenuOrder: 2,
      run: () => insertActionTemplate()
    })

    editor.addAction({
      id: 'insert-event',
      label: 'Insert Event Template',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyE],
      contextMenuGroupId: 'td-templates',
      contextMenuOrder: 3,
      run: () => insertEventTemplate()
    })

    // Set focus for better UX
    editor.focus()
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

  const insertPropertyTemplate = () => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition()
      if (position) {
        const template = `"newProperty": {
  "type": "number",
  "description": "Property description",
  "minimum": 0,
  "maximum": 100,
  "unit": "celsius",
  "forms": [{
    "href": "http://example.com/property",
    "contentType": "application/json"
  }]
}`
        editorRef.current.executeEdits('insert-property', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: template
        }])
      }
    }
  }

  const insertActionTemplate = () => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition()
      if (position) {
        const template = `"newAction": {
  "description": "Action description",
  "input": {
    "type": "object",
    "properties": {
      "parameter": {
        "type": "string"
      }
    }
  },
  "output": {
    "type": "object",
    "properties": {
      "result": {
        "type": "string"
      }
    }
  },
  "forms": [{
    "href": "http://example.com/action",
    "contentType": "application/json",
    "htv:methodName": "POST"
  }]
}`
        editorRef.current.executeEdits('insert-action', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: template
        }])
      }
    }
  }

  const insertEventTemplate = () => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition()
      if (position) {
        const template = `"newEvent": {
  "description": "Event description",
  "data": {
    "type": "object",
    "properties": {
      "timestamp": {
        "type": "string",
        "format": "date-time"
      },
      "value": {
        "type": "number"
      }
    }
  },
  "forms": [{
    "href": "http://example.com/event",
    "contentType": "application/json",
    "subprotocol": "longpoll"
  }]
}`
        editorRef.current.executeEdits('insert-event', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: template
        }])
      }
    }
  }

  const handleSave = () => {
    if (onSave && !isSaving) {
      // Basic validation before calling onSave
      if (!value || !value.trim()) {
        showToast({
          title: 'Save Failed',
          description: 'Thing Description cannot be empty.',
          type: 'error'
        })
        return
      }
      
      // Check if validation result exists and is valid
      if (validationResult && !validationResult.isValid) {
        showToast({
          title: 'Save Failed',
          description: 'Please fix validation errors before saving.',
          type: 'error'
        })
        return
      }
      
      onSave(value)
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
          const parsedContent = safeJsonParse(content)
          if (parsedContent) {
            setValue(content)
            setShowTemplates(false)
            showToast({
              title: 'File Loaded',
              description: 'Thing Description loaded successfully',
              type: 'success'
            })
          } else {
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

  const getSuggestions = React.useCallback(() => {
    if (!value || !value.trim()) {
      return (
        <div className="text-muted-foreground">
          • Add content to see suggestions
        </div>
      )
    }

    // Only show suggestions if validation was successful
    if (validationResult && validationResult.isValid) {
      try {
        // Use a safer parsing approach
        const parsedValue = safeJsonParse(value)
        if (parsedValue) {
          const suggestions = tdValidationService.getSuggestions(parsedValue)
          
          if (suggestions.length === 0) {
            return (
              <div className="text-muted-foreground">
                • No suggestions available
              </div>
            )
          }

          return suggestions.map((suggestion, idx) => (
            <div key={idx} className="text-muted-foreground">
              • {suggestion}
            </div>
          ))
        }
      } catch (error) {
        console.error('Error generating suggestions:', error)
        // Fallback for any unexpected errors
      }
    }

    return (
      <div className="text-muted-foreground">
        • Fix JSON syntax errors to see suggestions
      </div>
    )
  }, [value, validationResult])

  return (
    <TDEditorErrorBoundary>
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
                    disabled={readonly || !validationResult?.isValid || isSaving}
                  >
                    <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                    {isSaving ? 'Saving...' : 'Save'}
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
            <TDEditorErrorBoundary>
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
            </TDEditorErrorBoundary>
          </div>

          {/* Validation panel */}
          <div className="space-y-4">
            <TDEditorErrorBoundary>
              <TDValidationPanel 
                validationResult={validationResult}
                isValidating={isValidating}
              />
            </TDEditorErrorBoundary>
            
            {validationResult && (
              <TDEditorErrorBoundary>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {(() => {
                        try {
                          return getSuggestions()
                        } catch (error) {
                          console.error('Error in getSuggestions:', error)
                          return (
                            <div className="text-muted-foreground">
                              • Unable to generate suggestions
                            </div>
                          )
                        }
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </TDEditorErrorBoundary>
            )}
          </div>
        </div>

        {/* Template selector modal */}
        <TDEditorErrorBoundary>
          <TDTemplateSelector
            open={showTemplates}
            onOpenChange={setShowTemplates}
            onSelect={handleTemplateSelect}
          />
        </TDEditorErrorBoundary>
      </div>
    </TDEditorErrorBoundary>
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