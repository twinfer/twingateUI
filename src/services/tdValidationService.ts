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
}

export interface ValidationWarning {
  message: string
  path?: string
  line?: number
  column?: number
  type: 'deprecated' | 'best-practice' | 'optional' | 'performance'
}

export interface ValidationDetails {
  contextValid: boolean
  requiredFieldsPresent: boolean
  schemaValid: boolean
  assertionsValid: boolean
  securityValid: boolean
  linksValid: boolean
  formsValid: boolean
}

export interface JsonPosition {
  line: number
  column: number
  path: string
}

export class TDValidationService {
  /**
   * Validate a Thing Description using browser-compatible validation
   */
  async validateTD(td: string | object): Promise<ValidationResult> {
    // Input validation
    if (!td) {
      return this.createErrorResult('Thing Description cannot be empty')
    }

    try {
      let tdString: string
      let parsedTD: any
      
      // Parse JSON if string provided
      if (typeof td === 'string') {
        tdString = td.trim()
        if (!tdString) {
          return this.createErrorResult('Thing Description cannot be empty')
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
          return this.createErrorResult('Failed to serialize Thing Description to JSON')
        }
      }

      // Basic structure validation
      if (typeof parsedTD !== 'object' || parsedTD === null) {
        return this.createErrorResult('Thing Description must be a JSON object')
      }

      // Use browser-compatible fallback validation
      return this.validateWithFallback(tdString)

    } catch (error) {
      console.error('TD validation error:', error)
      return this.createErrorResult(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a standardized error result
   */
  private createErrorResult(message: string): ValidationResult {
    return {
      isValid: false,
      errors: [{
        message,
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
        formsValid: false
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
      formsValid: true  // Simple validator has basic forms validation
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
        formsValid: false
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
}

// Export singleton instance
export const tdValidationService = new TDValidationService()