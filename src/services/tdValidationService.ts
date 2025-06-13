import { simpleTDValidator } from './simpleTdValidation'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  details: ValidationDetails
}

export interface ValidationError {
  message: string
  path?: string
  line?: number
  column?: number
  severity: 'error' | 'critical'
  code?: string
  schemaPath?: string
}

export interface ValidationWarning {
  message: string
  path?: string
  line?: number
  column?: number
  type: 'deprecated' | 'best-practice' | 'optional' | 'performance' | 'protocol' | 'security'
  code?: string
}

export interface ValidationDetails {
  contextValid: boolean
  requiredFieldsPresent: boolean
  schemaValid: boolean
  assertionsValid: boolean
  securityValid: boolean
  linksValid: boolean
  formsValid: boolean
  protocolBindingsValid: boolean
  semanticAnnotationsValid: boolean
}

export interface JsonPosition {
  line: number
  column: number
  path: string
}

export class TDValidationService {
  /**
   * Validate a Thing Description using enhanced validation
   */
  async validateTD(td: string | object): Promise<ValidationResult> {
    // Input validation
    if (!td) {
      return this.createErrorResult('Thing Description cannot be empty', 'EMPTY_TD')
    }

    try {
      let tdString: string
      let parsedTD: any
      
      // Parse JSON if string provided
      if (typeof td === 'string') {
        tdString = td.trim()
        if (!tdString) {
          return this.createErrorResult('Thing Description cannot be empty', 'EMPTY_TD')
        }
        
        try {
          parsedTD = JSON.parse(tdString)
        } catch (parseError) {
          return this.createParseErrorResult(parseError as Error, tdString)
        }
      } else {
        try {
          tdString = JSON.stringify(td, null, 2)
          parsedTD = td
        } catch (stringifyError) {
          return this.createErrorResult('Failed to serialize Thing Description to JSON', 'STRINGIFY_ERROR')
        }
      }

      // Basic structure validation
      if (typeof parsedTD !== 'object' || parsedTD === null) {
        return this.createErrorResult('Thing Description must be a JSON object', 'INVALID_TYPE')
      }

      // Enhanced validation with multiple checks
      return this.performEnhancedValidation(parsedTD, tdString)

    } catch (error) {
      console.error('TD validation error:', error)
      return this.createErrorResult(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'VALIDATION_ERROR')
    }
  }

  /**
   * Perform enhanced validation combining multiple validation strategies
   */
  private async performEnhancedValidation(parsedTD: any, tdString: string): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    
    // 1. Basic structure validation
    const structureValidation = this.validateBasicStructure(parsedTD)
    errors.push(...structureValidation.errors)
    warnings.push(...structureValidation.warnings)
    
    // 2. Use browser-compatible fallback validation
    const fallbackResult = this.validateWithFallback(tdString)
    errors.push(...fallbackResult.errors)
    warnings.push(...fallbackResult.warnings)
    
    // 3. Protocol binding validation
    const protocolValidation = this.validateProtocolBindings(parsedTD)
    errors.push(...protocolValidation.errors)
    warnings.push(...protocolValidation.warnings)
    
    // 4. Semantic annotation validation
    const semanticValidation = this.validateSemanticAnnotations(parsedTD)
    warnings.push(...semanticValidation.warnings)
    
    // 5. Security validation
    const securityValidation = this.validateSecuritySchemes(parsedTD)
    errors.push(...securityValidation.errors)
    warnings.push(...securityValidation.warnings)
    
    // Determine overall validity
    const isValid = errors.length === 0
    
    const details: ValidationDetails = {
      contextValid: this.checkContext(parsedTD),
      requiredFieldsPresent: this.checkRequiredFields(parsedTD),
      schemaValid: fallbackResult.details.schemaValid,
      assertionsValid: isValid,
      securityValid: this.checkSecurity(parsedTD),
      linksValid: this.checkLinks(parsedTD),
      formsValid: this.checkForms(parsedTD),
      protocolBindingsValid: protocolValidation.errors.length === 0,
      semanticAnnotationsValid: true // Always true for warnings-only validation
    }
    
    return {
      isValid,
      errors: this.deduplicateErrors(errors),
      warnings: this.deduplicateWarnings(warnings),
      details
    }
  }

  /**
   * Create a standardized error result
   */
  private createErrorResult(message: string, code?: string): ValidationResult {
    return {
      isValid: false,
      errors: [{
        message,
        severity: 'critical',
        code
      }],
      warnings: [],
      details: {
        contextValid: false,
        requiredFieldsPresent: false,
        schemaValid: false,
        assertionsValid: false,
        securityValid: false,
        linksValid: false,
        formsValid: false,
        protocolBindingsValid: false,
        semanticAnnotationsValid: false
      }
    }
  }

  /**
   * Fallback validation using simple validator
   */
  private validateWithFallback(tdString: string): ValidationResult {
    const result = simpleTDValidator.validateTD(tdString)
    
    const errors: ValidationError[] = result.errors.map(error => ({
      message: error,
      severity: 'error' as const
    }))
    
    const warnings: ValidationWarning[] = result.warnings.map(warning => ({
      message: warning,
      type: 'best-practice' as const
    }))

    const details: ValidationDetails = {
      contextValid: result.details.hasContext,
      requiredFieldsPresent: result.details.hasTitle && result.details.hasContext,
      schemaValid: result.details.hasValidJSON,
      assertionsValid: result.isValid,
      securityValid: result.details.hasSecurity,
      linksValid: true, // Simple validator doesn't check links in detail
      formsValid: true, // Simple validator has basic forms validation
      protocolBindingsValid: true, // Default to true for simple validation
      semanticAnnotationsValid: true // Default to true for simple validation
    }

    return {
      isValid: result.isValid,
      errors,
      warnings,
      details
    }
  }


  /**
   * Custom validations specific to our application
   */
  private performCustomValidations(td: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Check for missing title
    if (!td.title || typeof td.title !== 'string' || td.title.trim().length === 0) {
      errors.push({
        message: 'Thing Description must have a non-empty title',
        path: 'title',
        severity: 'error'
      })
    }

    // Check for very long titles
    if (td.title && td.title.length > 100) {
      warnings.push({
        message: 'Title is very long, consider keeping it under 100 characters',
        path: 'title',
        type: 'best-practice'
      })
    }

    // Check for missing description
    if (!td.description) {
      warnings.push({
        message: 'Consider adding a description for better documentation',
        path: 'description',
        type: 'best-practice'
      })
    }

    // Check for empty properties, actions, or events
    if (td.properties && Object.keys(td.properties).length === 0) {
      warnings.push({
        message: 'Thing has empty properties object, consider removing if unused',
        path: 'properties',
        type: 'best-practice'
      })
    }

    if (td.actions && Object.keys(td.actions).length === 0) {
      warnings.push({
        message: 'Thing has empty actions object, consider removing if unused',
        path: 'actions',
        type: 'best-practice'
      })
    }

    if (td.events && Object.keys(td.events).length === 0) {
      warnings.push({
        message: 'Thing has empty events object, consider removing if unused',
        path: 'events',
        type: 'best-practice'
      })
    }

    // Check for missing security
    if (!td.securityDefinitions || !td.security) {
      warnings.push({
        message: 'Consider defining security mechanisms for production use',
        path: 'security',
        type: 'best-practice'
      })
    }

    return { errors, warnings }
  }

  private createParseErrorResult(error: Error, jsonString: string): ValidationResult {
    const match = error.message.match(/at position (\d+)/)
    let line = 1
    let column = 1
    
    if (match) {
      const position = parseInt(match[1])
      const beforeError = jsonString.substring(0, position)
      line = (beforeError.match(/\n/g) || []).length + 1
      column = position - beforeError.lastIndexOf('\n')
    }

    return {
      isValid: false,
      errors: [{
        message: `JSON Parse Error: ${error.message}`,
        line,
        column,
        severity: 'critical'
      }],
      warnings: [],
      details: {
        contextValid: false,
        requiredFieldsPresent: false,
        schemaValid: false,
        assertionsValid: false,
        securityValid: false,
        linksValid: false,
        formsValid: false,
        protocolBindingsValid: false,
        semanticAnnotationsValid: false
      }
    }
  }

  private checkContext(td: any): boolean {
    return td['@context'] && (
      td['@context'] === 'https://www.w3.org/2019/wot/td/v1' ||
      (Array.isArray(td['@context']) && 
       td['@context'].includes('https://www.w3.org/2019/wot/td/v1'))
    )
  }

  private checkRequiredFields(td: any): boolean {
    return !!(td.title && td['@context'])
  }

  private checkSecurity(td: any): boolean {
    if (!td.securityDefinitions) return false
    if (!td.security) return false
    
    // Check if security references are valid
    const securityKeys = Object.keys(td.securityDefinitions)
    const securityRefs = Array.isArray(td.security) ? td.security : [td.security]
    
    return securityRefs.every(ref => securityKeys.includes(ref))
  }

  private checkLinks(td: any): boolean {
    if (!td.links) return true // Links are optional
    
    return Array.isArray(td.links) && td.links.every((link: any) => 
      link.href && typeof link.href === 'string'
    )
  }

  private checkForms(td: any): boolean {
    // Check forms in properties, actions, and events
    const checkFormArray = (forms: any[]) => {
      if (!Array.isArray(forms)) return false
      return forms.every(form => form.href && typeof form.href === 'string')
    }

    // Check property forms
    if (td.properties) {
      for (const prop of Object.values(td.properties)) {
        if ((prop as any).forms && !checkFormArray((prop as any).forms)) {
          return false
        }
      }
    }

    // Check action forms
    if (td.actions) {
      for (const action of Object.values(td.actions)) {
        if ((action as any).forms && !checkFormArray((action as any).forms)) {
          return false
        }
      }
    }

    // Check event forms
    if (td.events) {
      for (const event of Object.values(td.events)) {
        if ((event as any).forms && !checkFormArray((event as any).forms)) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Get suggestions for improving a Thing Description
   */
  getSuggestions(td: any): string[] {
    try {
      return simpleTDValidator.getSuggestions(td)
    } catch (error) {
      // Fallback suggestions
      const suggestions: string[] = []

      if (!td.description) {
        suggestions.push('Add a description to help users understand what this Thing does')
      }

      if (!td.properties && !td.actions && !td.events) {
        suggestions.push('Add at least one property, action, or event to make this Thing functional')
      }

      if (td.securityDefinitions && Object.keys(td.securityDefinitions).includes('nosec_sc')) {
        suggestions.push('Consider using stronger security mechanisms than "nosec" for production')
      }

      if (!td.version) {
        suggestions.push('Add version information to track changes over time')
      }

      if (!td.support) {
        suggestions.push('Add support contact information for maintainability')
      }

      return suggestions
    }
  }

  /**
   * Validate basic TD structure
   */
  private validateBasicStructure(td: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Check required fields more strictly
    if (!td['@context']) {
      errors.push({
        message: 'Missing required @context field',
        path: '@context',
        severity: 'critical',
        code: 'MISSING_CONTEXT'
      })
    }

    if (!td.title) {
      errors.push({
        message: 'Missing required title field',
        path: 'title',
        severity: 'critical',
        code: 'MISSING_TITLE'
      })
    }

    // Check ID format if present
    if (td.id && typeof td.id === 'string') {
      if (!this.isValidIRI(td.id)) {
        warnings.push({
          message: 'ID should be a valid IRI (Internationalized Resource Identifier)',
          path: 'id',
          type: 'best-practice',
          code: 'INVALID_IRI'
        })
      }
    }

    return { errors, warnings }
  }

  /**
   * Validate protocol bindings in forms
   */
  private validateProtocolBindings(td: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const checkFormProtocols = (forms: any[], affordanceType: string, affordanceName: string) => {
      if (!Array.isArray(forms)) return

      forms.forEach((form, index) => {
        if (!form.href) {
          errors.push({
            message: `Form missing required href field`,
            path: `${affordanceType}.${affordanceName}.forms[${index}].href`,
            severity: 'error',
            code: 'MISSING_HREF'
          })
          return
        }

        const protocol = this.extractProtocolFromHref(form.href)
        const protocolValidation = this.validateProtocolSpecificBinding(form, protocol)
        
        protocolValidation.errors.forEach(error => {
          errors.push({
            ...error,
            path: `${affordanceType}.${affordanceName}.forms[${index}].${error.path || ''}`
          })
        })

        protocolValidation.warnings.forEach(warning => {
          warnings.push({
            ...warning,
            path: `${affordanceType}.${affordanceName}.forms[${index}].${warning.path || ''}`
          })
        })
      })
    }

    // Check properties
    if (td.properties && typeof td.properties === 'object') {
      Object.entries(td.properties).forEach(([propName, prop]: [string, any]) => {
        if (prop.forms) {
          checkFormProtocols(prop.forms, 'properties', propName)
        }
      })
    }

    // Check actions
    if (td.actions && typeof td.actions === 'object') {
      Object.entries(td.actions).forEach(([actionName, action]: [string, any]) => {
        if (action.forms) {
          checkFormProtocols(action.forms, 'actions', actionName)
        }
      })
    }

    // Check events
    if (td.events && typeof td.events === 'object') {
      Object.entries(td.events).forEach(([eventName, event]: [string, any]) => {
        if (event.forms) {
          checkFormProtocols(event.forms, 'events', eventName)
        }
      })
    }

    return { errors, warnings }
  }

  /**
   * Validate semantic annotations
   */
  private validateSemanticAnnotations(td: any): { warnings: ValidationWarning[] } {
    const warnings: ValidationWarning[] = []

    // Check @type usage
    if (!td['@type']) {
      warnings.push({
        message: 'Consider adding @type for semantic interoperability',
        path: '@type',
        type: 'best-practice',
        code: 'MISSING_TYPE'
      })
    }

    // Check for semantic context extensions
    if (td['@context'] && Array.isArray(td['@context'])) {
      const hasSemanticExtension = td['@context'].some((ctx: any) => 
        typeof ctx === 'object' || (typeof ctx === 'string' && ctx !== 'https://www.w3.org/2019/wot/td/v1')
      )
      
      if (!hasSemanticExtension) {
        warnings.push({
          message: 'Consider adding semantic context extensions for richer annotations',
          path: '@context',
          type: 'best-practice',
          code: 'NO_SEMANTIC_EXTENSIONS'
        })
      }
    }

    return { warnings }
  }

  /**
   * Enhanced security validation
   */
  private validateSecuritySchemes(td: any): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!td.securityDefinitions) {
      warnings.push({
        message: 'No security definitions found. Consider adding security schemes.',
        path: 'securityDefinitions',
        type: 'security',
        code: 'NO_SECURITY_DEFINITIONS'
      })
      return { errors, warnings }
    }

    // Check each security scheme
    Object.entries(td.securityDefinitions).forEach(([schemeName, scheme]: [string, any]) => {
      if (!scheme.scheme) {
        errors.push({
          message: `Security scheme '${schemeName}' missing required 'scheme' field`,
          path: `securityDefinitions.${schemeName}.scheme`,
          severity: 'error',
          code: 'MISSING_SCHEME'
        })
        return
      }

      // Warn about insecure schemes
      if (scheme.scheme === 'nosec') {
        warnings.push({
          message: `Security scheme '${schemeName}' uses 'nosec'. Consider stronger security for production.`,
          path: `securityDefinitions.${schemeName}`,
          type: 'security',
          code: 'INSECURE_SCHEME'
        })
      }

      // Validate OAuth2 schemes
      if (scheme.scheme === 'oauth2') {
        if (!scheme.authorization) {
          errors.push({
            message: `OAuth2 scheme '${schemeName}' missing authorization endpoint`,
            path: `securityDefinitions.${schemeName}.authorization`,
            severity: 'error',
            code: 'MISSING_OAUTH2_AUTH'
          })
        }
        if (!scheme.token) {
          errors.push({
            message: `OAuth2 scheme '${schemeName}' missing token endpoint`,
            path: `securityDefinitions.${schemeName}.token`,
            severity: 'error',
            code: 'MISSING_OAUTH2_TOKEN'
          })
        }
      }
    })

    return { errors, warnings }
  }

  /**
   * Deduplicate errors
   */
  private deduplicateErrors(errors: ValidationError[]): ValidationError[] {
    const seen = new Set<string>()
    return errors.filter(error => {
      const key = `${error.message}-${error.path}-${error.code}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /**
   * Deduplicate warnings
   */
  private deduplicateWarnings(warnings: ValidationWarning[]): ValidationWarning[] {
    const seen = new Set<string>()
    return warnings.filter(warning => {
      const key = `${warning.message}-${warning.path}-${warning.code}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /**
   * Extract protocol from href
   */
  private extractProtocolFromHref(href: string): string {
    try {
      const url = new URL(href)
      return url.protocol.slice(0, -1) // Remove trailing colon
    } catch {
      return 'unknown'
    }
  }

  /**
   * Validate protocol-specific bindings
   */
  private validateProtocolSpecificBinding(form: any, protocol: string): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    switch (protocol) {
      case 'http':
      case 'https':
        if (form['htv:methodName'] && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(form['htv:methodName'])) {
          warnings.push({
            message: `Unusual HTTP method: ${form['htv:methodName']}`,
            path: 'htv:methodName',
            type: 'protocol',
            code: 'UNUSUAL_HTTP_METHOD'
          })
        }
        break

      case 'mqtt':
        if (!form['mqv:topic'] && !this.extractTopicFromMqttHref(form.href)) {
          warnings.push({
            message: 'MQTT form should specify topic either in href or mqv:topic',
            path: 'mqv:topic',
            type: 'protocol',
            code: 'MISSING_MQTT_TOPIC'
          })
        }
        break

      case 'coap':
        if (form['cov:method'] && !['GET', 'POST', 'PUT', 'DELETE'].includes(form['cov:method'])) {
          warnings.push({
            message: `Invalid CoAP method: ${form['cov:method']}`,
            path: 'cov:method',
            type: 'protocol',
            code: 'INVALID_COAP_METHOD'
          })
        }
        break

      case 'modbus':
        if (!form['modv:function']) {
          warnings.push({
            message: 'Modbus form should specify function code',
            path: 'modv:function',
            type: 'protocol',
            code: 'MISSING_MODBUS_FUNCTION'
          })
        }
        break
    }

    return { errors, warnings }
  }

  /**
   * Extract topic from MQTT href
   */
  private extractTopicFromMqttHref(href: string): string | null {
    try {
      const url = new URL(href)
      return url.pathname.length > 1 ? url.pathname.slice(1) : null
    } catch {
      return null
    }
  }

  /**
   * Check if string is a valid IRI
   */
  private isValidIRI(iri: string): boolean {
    try {
      new URL(iri)
      return true
    } catch {
      // Check for URN format
      return /^urn:[a-z0-9][a-z0-9-]{0,31}:[a-z0-9()+,\-.:=@;$_!*'%/?#]+$/i.test(iri)
    }
  }
}

// Export singleton instance
export const tdValidationService = new TDValidationService()