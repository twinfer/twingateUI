import * as monaco from 'monaco-editor'
import tdSchema from '@/data/td-json-schema-validation.json'

// Protocol schemas
import httpSchema from '@/data/protocols/http/http.schema.json'
import mqttSchema from '@/data/protocols/mqtt/mqtt.schema.json'
import coapSchema from '@/data/protocols/coap/coap.schema.json'
import modbusSchema from '@/data/protocols/modbus/modbus.schema.json'
import bacnetSchema from '@/data/protocols/bacnet/bacnet.schema.json'
import profinetSchema from '@/data/protocols/profinet/profinet.schema.json'

/**
 * Setup Monaco Editor with Thing Description schema validation and auto-completion
 */
export function setupMonacoSchemas() {
  // Configure JSON schemas for validation
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    schemas: [
      {
        uri: 'https://www.w3.org/2019/wot/td/v1',
        fileMatch: ['*'],
        schema: tdSchema
      },
      {
        uri: 'http://w3c.github.io/wot-binding-templates/bindings/protocols/http/http.schema.json',
        fileMatch: ['*'],
        schema: httpSchema
      },
      {
        uri: 'http://w3c.github.io/wot-binding-templates/bindings/protocols/mqtt/mqtt.schema.json',
        fileMatch: ['*'],
        schema: mqttSchema
      },
      {
        uri: 'http://w3c.github.io/wot-binding-templates/bindings/protocols/coap/coap.schema.json',
        fileMatch: ['*'],
        schema: coapSchema
      },
      {
        uri: 'http://w3c.github.io/wot-binding-templates/bindings/protocols/modbus/modbus.schema.json',
        fileMatch: ['*'],
        schema: modbusSchema
      },
      {
        uri: 'http://w3c.github.io/wot-binding-templates/bindings/protocols/bacnet/bacnet.schema.json',
        fileMatch: ['*'],
        schema: bacnetSchema
      },
      {
        uri: 'http://w3c.github.io/wot-binding-templates/bindings/protocols/profinet/profinet.schema.json',
        fileMatch: ['*'],
        schema: profinetSchema
      }
    ]
  })
}

/**
 * Create auto-completion provider for Thing Description elements
 */
export function createTDCompletionProvider(): monaco.languages.CompletionItemProvider {
  return {
    provideCompletionItems: (model, position, context, token) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const suggestions: monaco.languages.CompletionItem[] = []

      // Get current line text to understand context
      const lineText = model.getLineContent(position.lineNumber).trim()
      const fullText = model.getValue()

      try {
        // Try to parse JSON to understand structure, but handle errors gracefully
        let jsonObj: any = null
        let currentPath: string[] = []
        
        try {
          // Only try to parse if the text looks like it might be valid JSON
          if (fullText.trim().startsWith('{') && fullText.trim().length > 2) {
            jsonObj = JSON.parse(fullText)
            currentPath = getCurrentJsonPath(model, position)
          } else {
            // Use text analysis for incomplete JSON
            currentPath = getCurrentJsonPathFromText(model, position)
          }
        } catch (parseError) {
          // If JSON parsing fails, try to get path from text analysis
          currentPath = getCurrentJsonPathFromText(model, position)
        }

        // Context-aware suggestions based on current path
        if (currentPath.includes('properties')) {
          suggestions.push(...getPropertySuggestions(range))
        }
        
        if (currentPath.includes('actions')) {
          suggestions.push(...getActionSuggestions(range))
        }
        
        if (currentPath.includes('events')) {
          suggestions.push(...getEventSuggestions(range))
        }

        if (currentPath.includes('forms')) {
          suggestions.push(...getFormsSuggestions(range))
        }

        if (currentPath.includes('securityDefinitions')) {
          suggestions.push(...getSecuritySuggestions(range))
        }

        // Protocol-specific suggestions
        if (lineText.includes('href') || currentPath.includes('forms')) {
          suggestions.push(...getProtocolSuggestions(range))
        }

        // Root level suggestions
        if (currentPath.length === 0 || (currentPath.length === 1 && currentPath[0] === '')) {
          suggestions.push(...getRootLevelSuggestions(range))
        }

        // If no specific suggestions found, add basic ones
        if (suggestions.length === 0) {
          suggestions.push(...getBasicSuggestions(range))
        }

      } catch (error) {
        // Fallback: provide basic suggestions without crashing
        console.warn('Error in completion provider:', error)
        suggestions.push(...getBasicSuggestions(range))
      }

      return { suggestions }
    }
  }
}

/**
 * Get current JSON path from cursor position (fallback for invalid JSON)
 */
function getCurrentJsonPathFromText(model: monaco.editor.ITextModel, position: monaco.Position): string[] {
  const text = model.getValueInRange({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column
  })

  const path: string[] = []
  const lines = text.split('\n')
  
  // Simple heuristic: look for key patterns in the text
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Look for property definitions
    if (trimmed.includes('"properties"') && trimmed.includes(':')) {
      path.push('properties')
    } else if (trimmed.includes('"actions"') && trimmed.includes(':')) {
      path.push('actions')
    } else if (trimmed.includes('"events"') && trimmed.includes(':')) {
      path.push('events')
    } else if (trimmed.includes('"forms"') && trimmed.includes(':')) {
      path.push('forms')
    } else if (trimmed.includes('"securityDefinitions"') && trimmed.includes(':')) {
      path.push('securityDefinitions')
    }
  }

  return path
}

/**
 * Get current JSON path from cursor position
 */
function getCurrentJsonPath(model: monaco.editor.ITextModel, position: monaco.Position): string[] {
  const text = model.getValueInRange({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column
  })

  const path: string[] = []
  let inString = false
  let currentKey = ''
  let depth = 0

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    
    if (char === '"' && text[i - 1] !== '\\') {
      inString = !inString
      if (!inString && currentKey) {
        if (text[i + 1] === ':') {
          path[depth] = currentKey
        }
        currentKey = ''
      }
    } else if (inString) {
      currentKey += char
    } else if (char === '{') {
      depth++
    } else if (char === '}') {
      depth--
      if (depth >= 0) {
        path.length = depth
      }
    }
  }

  return path.filter(Boolean)
}

/**
 * Root level TD suggestions
 */
function getRootLevelSuggestions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return [
    {
      label: '@context',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"@context": "https://www.w3.org/2019/wot/td/v1"',
      range,
      documentation: 'JSON-LD context for Thing Description'
    },
    {
      label: '@type',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"@type": "Thing"',
      range,
      documentation: 'Semantic type annotation'
    },
    {
      label: 'title',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"title": "${1:My Thing}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Human-readable name'
    },
    {
      label: 'description',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"description": "${1:Description of my Thing}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Human-readable description'
    },
    {
      label: 'id',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"id": "${1:urn:uuid:' + generateUUID() + '}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Unique identifier'
    },
    {
      label: 'properties',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"properties": {\n\t"${1:propertyName}": {\n\t\t"type": "${2:number}",\n\t\t"description": "${3:Property description}",\n\t\t"forms": [{\n\t\t\t"href": "${4:http://example.com/property}"\n\t\t}]\n\t}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Properties affordances'
    },
    {
      label: 'actions',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"actions": {\n\t"${1:actionName}": {\n\t\t"description": "${2:Action description}",\n\t\t"forms": [{\n\t\t\t"href": "${3:http://example.com/action}"\n\t\t}]\n\t}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Actions affordances'
    },
    {
      label: 'events',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"events": {\n\t"${1:eventName}": {\n\t\t"description": "${2:Event description}",\n\t\t"forms": [{\n\t\t\t"href": "${3:http://example.com/event}"\n\t\t}]\n\t}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Events affordances'
    },
    {
      label: 'securityDefinitions',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"securityDefinitions": {\n\t"${1:nosec_sc}": {\n\t\t"scheme": "nosec"\n\t}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Security scheme definitions'
    },
    {
      label: 'security',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"security": ["${1:nosec_sc}"]',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Security configuration'
    }
  ]
}

/**
 * Property-specific suggestions
 */
function getPropertySuggestions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return [
    {
      label: 'type',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"type": "${1|string,number,integer,boolean,object,array,null|}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'JSON Schema data type'
    },
    {
      label: 'readOnly',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"readOnly": ${1|true,false|}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Property is read-only'
    },
    {
      label: 'writeOnly',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"writeOnly": ${1|true,false|}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Property is write-only'
    },
    {
      label: 'observable',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"observable": ${1|true,false|}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Property can be observed'
    },
    {
      label: 'minimum',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"minimum": ${1:0}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Minimum value constraint'
    },
    {
      label: 'maximum',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"maximum": ${1:100}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Maximum value constraint'
    },
    {
      label: 'unit',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"unit": "${1:celsius}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Unit of measurement'
    }
  ]
}

/**
 * Action-specific suggestions
 */
function getActionSuggestions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return [
    {
      label: 'input',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"input": {\n\t"type": "${1:object}",\n\t"properties": {\n\t\t"${2:parameter}": {\n\t\t\t"type": "${3:string}"\n\t\t}\n\t}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Action input schema'
    },
    {
      label: 'output',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"output": {\n\t"type": "${1:object}",\n\t"properties": {\n\t\t"${2:result}": {\n\t\t\t"type": "${3:string}"\n\t\t}\n\t}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Action output schema'
    },
    {
      label: 'safe',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"safe": ${1|true,false|}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Action is safe (no side effects)'
    },
    {
      label: 'idempotent',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"idempotent": ${1|true,false|}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Action is idempotent'
    }
  ]
}

/**
 * Event-specific suggestions
 */
function getEventSuggestions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return [
    {
      label: 'data',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"data": {\n\t"type": "${1:object}",\n\t"properties": {\n\t\t"${2:eventData}": {\n\t\t\t"type": "${3:string}"\n\t\t}\n\t}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Event data schema'
    },
    {
      label: 'subscription',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"subscription": {\n\t"type": "object"\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Event subscription schema'
    },
    {
      label: 'cancellation',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"cancellation": {\n\t"type": "object"\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Event cancellation schema'
    }
  ]
}

/**
 * Forms-specific suggestions
 */
function getFormsSuggestions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return [
    {
      label: 'href',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"href": "${1:http://example.com/endpoint}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Target endpoint URL'
    },
    {
      label: 'contentType',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"contentType": "${1|application/json,text/plain,application/xml,application/cbor|}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Content media type'
    },
    {
      label: 'op',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"op": ["${1|readproperty,writeproperty,observeproperty,unobserveproperty,invokeaction,subscribeevent,unsubscribeevent|}"]',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Supported operations'
    },
    {
      label: 'htv:methodName',
      kind: monaco.languages.CompletionItemKind.Property,
      insertText: '"htv:methodName": "${1|GET,POST,PUT,DELETE,PATCH|}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'HTTP method name'
    }
  ]
}

/**
 * Security-specific suggestions
 */
function getSecuritySuggestions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return [
    {
      label: 'nosec',
      kind: monaco.languages.CompletionItemKind.Value,
      insertText: '"${1:nosec_sc}": {\n\t"scheme": "nosec"\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'No security scheme'
    },
    {
      label: 'basic',
      kind: monaco.languages.CompletionItemKind.Value,
      insertText: '"${1:basic_sc}": {\n\t"scheme": "basic"\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'HTTP Basic authentication'
    },
    {
      label: 'bearer',
      kind: monaco.languages.CompletionItemKind.Value,
      insertText: '"${1:bearer_sc}": {\n\t"scheme": "bearer",\n\t"format": "${2:jwt}"\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Bearer token authentication'
    },
    {
      label: 'oauth2',
      kind: monaco.languages.CompletionItemKind.Value,
      insertText: '"${1:oauth2_sc}": {\n\t"scheme": "oauth2",\n\t"authorization": "${2:https://example.com/oauth/authorize}",\n\t"token": "${3:https://example.com/oauth/token}",\n\t"flow": "${4|authorization_code,client_credentials|}"\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'OAuth2 authentication'
    }
  ]
}

/**
 * Protocol-specific suggestions
 */
function getProtocolSuggestions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return [
    {
      label: 'HTTP endpoint',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '"href": "http://${1:localhost:8080}/${2:endpoint}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'HTTP protocol endpoint'
    },
    {
      label: 'HTTPS endpoint',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '"href": "https://${1:localhost:8443}/${2:endpoint}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'HTTPS protocol endpoint'
    },
    {
      label: 'MQTT endpoint',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '"href": "mqtt://${1:localhost:1883}/${2:topic}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'MQTT protocol endpoint'
    },
    {
      label: 'CoAP endpoint',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '"href": "coap://${1:localhost:5683}/${2:resource}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'CoAP protocol endpoint'
    },
    {
      label: 'WebSocket endpoint',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '"href": "ws://${1:localhost:8080}/${2:endpoint}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'WebSocket protocol endpoint'
    },
    {
      label: 'Modbus endpoint',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '"href": "modbus+tcp://${1:localhost:502}/${2:unitid}/${3:address}"',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Modbus TCP protocol endpoint'
    }
  ]
}

/**
 * Basic suggestions for invalid JSON
 */
function getBasicSuggestions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return [
    {
      label: 'Basic Thing Description',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '{\n\t"@context": "https://www.w3.org/2019/wot/td/v1",\n\t"@type": "Thing",\n\t"title": "${1:My Thing}",\n\t"description": "${2:A simple Thing}",\n\t"securityDefinitions": {\n\t\t"nosec_sc": {\n\t\t\t"scheme": "nosec"\n\t\t}\n\t},\n\t"security": ["nosec_sc"]\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      documentation: 'Basic Thing Description template'
    }
  ]
}

/**
 * Generate a simple UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}