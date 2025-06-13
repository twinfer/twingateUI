# W3C WoT Dashboard - Chapter 4: WoT Tools Integration

## Eclipse editdor Integration

### Editor Component Wrapper
```typescript
// features/wot/editor/EditdorWrapper.tsx
interface EditdorWrapperProps {
  initialValue?: ThingDescription;
  onChange?: (td: ThingDescription) => void;
  onValidate?: (errors: ValidationError[]) => void;
  options?: {
    readOnly?: boolean;
    theme?: 'light' | 'dark';
    showMinimap?: boolean;
  };
}

// Integration approach:
// 1. Lazy load editdor to reduce initial bundle
// 2. Sync with form state via onChange
// 3. Real-time validation feedback
// 4. Custom toolbar for WoT actions
```

### Editor Configuration
```typescript
// features/wot/editor/config.ts
export const editdorConfig = {
  // Schema for auto-completion
  schemas: {
    td: 'https://www.w3.org/2022/wot/td/v1.1',
    tm: 'https://www.w3.org/2022/wot/tm'
  },
  
  // Custom snippets for common patterns
  snippets: {
    property: {
      label: 'Property',
      insertText: `"$1": {
  "type": "$2",
  "title": "$3",
  "forms": [{
    "href": "$4",
    "op": ["readproperty", "writeproperty"]
  }]
}`
    },
    action: {
      label: 'Action',
      insertText: `"$1": {
  "title": "$2",
  "input": { "type": "$3" },
  "output": { "type": "$4" },
  "forms": [{
    "href": "$5",
    "op": "invokeaction"
  }]
}`
    }
  }
};
```

## ThingWeb Playground Integration

### Playground Wrapper Component
```tsx
// features/wot/playground/PlaygroundWrapper.tsx
interface PlaygroundWrapperProps {
  thingDescription: ThingDescription;
  mode: 'validate' | 'consume' | 'test';
  onValidationComplete?: (result: ValidationResult) => void;
}

// Validation result interface
interface ValidationResult {
  valid: boolean;
  errors: Array<{
    level: 'error' | 'warning' | 'info';
    path: string;
    message: string;
    suggestion?: string;
  }>;
  report: {
    json: boolean;
    defaults: boolean;
    jsonld: boolean;
    schema: boolean;
  };
}
```

### Validation Service
```typescript
// features/wot/validation/ValidationService.ts
export class ValidationService {
  private playground: ThingWebPlayground;
  
  async validateTD(td: ThingDescription): Promise<ValidationResult> {
    // 1. JSON Schema validation
    const schemaResult = await this.validateSchema(td);
    
    // 2. JSON-LD validation
    const jsonldResult = await this.validateJsonLD(td);
    
    // 3. Protocol binding validation
    const bindingResult = await this.validateBindings(td);
    
    // 4. Business logic validation
    const logicResult = await this.validateBusinessLogic(td);
    
    return this.mergeResults([
      schemaResult,
      jsonldResult,
      bindingResult,
      logicResult
    ]);
  }
  
  async validateWithCache(td: ThingDescription): Promise<ValidationResult> {
    const cacheKey = this.generateCacheKey(td);
    const cached = await this.cache.get(cacheKey);
    
    if (cached && !this.isStale(cached)) {
      return cached.result;
    }
    
    const result = await this.validateTD(td);
    await this.cache.set(cacheKey, { result, timestamp: Date.now() });
    
    return result;
  }
}
```

## Visual TD Builder

### Form-Based TD Creator
```tsx
// features/wot/builder/TDBuilder.tsx
interface TDBuilderProps {
  onGenerate: (td: ThingDescription) => void;
  template?: 'sensor' | 'actuator' | 'device' | 'custom';
}

// Step-based wizard interface
interface BuilderSteps {
  metadata: {
    title: string;
    description: string;
    '@type': string[];
  };
  
  properties: Array<{
    name: string;
    type: DataType;
    unit?: string;
    observable?: boolean;
  }>;
  
  actions: Array<{
    name: string;
    input?: DataSchema;
    output?: DataSchema;
    safe?: boolean;
  }>;
  
  events: Array<{
    name: string;
    data?: DataSchema;
    subscription?: DataSchema;
  }>;
  
  forms: {
    baseUrl: string;
    protocol: 'http' | 'mqtt' | 'coap';
    security: SecurityScheme;
  };
}
```

### Property Builder Component
```tsx
// features/wot/builder/PropertyBuilder.tsx
interface PropertyBuilderProps {
  onAdd: (property: PropertyDefinition) => void;
  existingProperties: PropertyDefinition[];
}

// Visual property configuration
// - Drag & drop reordering
// - Type selection with preview
// - Unit selection from ontology
// - Form binding generator
// - Validation rules builder
```

## TD Import/Export Tools

### Import Handler
```typescript
// features/wot/import/ImportHandler.ts
export class TDImportHandler {
  async importFromFile(file: File): Promise<ThingDescription> {
    const content = await this.readFile(file);
    const td = JSON.parse(content);
    
    // Validate before import
    const validation = await this.validator.validateTD(td);
    if (!validation.valid) {
      throw new ImportError('Invalid TD', validation.errors);
    }
    
    return this.normalizeImportedTD(td);
  }
  
  async importFromUrl(url: string): Promise<ThingDescription> {
    const response = await fetch(url);
    const td = await response.json();
    
    return this.importFromJson(td);
  }
  
  async importFromDevice(deviceUrl: string): Promise<ThingDescription> {
    // Fetch TD directly from device
    const tdUrl = new URL('/.well-known/wot-thing-description', deviceUrl);
    return this.importFromUrl(tdUrl.toString());
  }
}
```

### Export Options
```typescript
// features/wot/export/ExportOptions.tsx
interface ExportOptionsProps {
  td: ThingDescription;
  onExport: (format: ExportFormat, content: string) => void;
}

type ExportFormat = 
  | 'json'           // Standard JSON
  | 'json-minified'  // Minified JSON
  | 'yaml'           // YAML format
  | 'turtle'         // RDF Turtle
  | 'json-ld'        // JSON-LD expanded
  | 'typescript';    // TypeScript interfaces

// Export features:
// - Format selection
// - Validation before export
// - Code generation for bindings
// - Documentation generation
```

## Integration with Thing Management

### TD Validation Pipeline
```tsx
// features/things/hooks/useThingValidation.ts
export function useThingValidation(td: ThingDescription) {
  const [validation, setValidation] = useState<ValidationResult>();
  const [isValidating, setIsValidating] = useState(false);
  
  const validate = useCallback(async () => {
    setIsValidating(true);
    try {
      // 1. Playground validation
      const playgroundResult = await validateWithPlayground(td);
      
      // 2. Custom business rules
      const businessResult = await validateBusinessRules(td);
      
      // 3. API compatibility check
      const apiResult = await checkAPICompatibility(td);
      
      setValidation(mergeValidationResults([
        playgroundResult,
        businessResult,
        apiResult
      ]));
    } finally {
      setIsValidating(false);
    }
  }, [td]);
  
  return { validation, isValidating, validate };
}
```