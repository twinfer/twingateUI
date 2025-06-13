// Simplified TD validation for browser environment
export interface SimpleTDValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  details: {
    hasContext: boolean
    hasTitle: boolean
    hasValidJSON: boolean
    hasProperties: boolean
    hasActions: boolean
    hasEvents: boolean
    hasSecurity: boolean
  }
}

export class SimpleTDValidator {
  validateTD(tdString: string): SimpleTDValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let td: any = null

    // 1. JSON validation
    try {
      td = JSON.parse(tdString)
    } catch (error) {
      return {
        isValid: false,
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Parse error'}`],
        warnings: [],
        details: {
          hasContext: false,
          hasTitle: false,
          hasValidJSON: false,
          hasProperties: false,
          hasActions: false,
          hasEvents: false,
          hasSecurity: false
        }
      }
    }

    // 2. Required fields validation
    if (!td['@context']) {
      errors.push('Missing required field: @context')
    } else {
      const context = Array.isArray(td['@context']) ? td['@context'] : [td['@context']]
      if (!context.includes('https://www.w3.org/2019/wot/td/v1')) {
        errors.push('@context must include "https://www.w3.org/2019/wot/td/v1"')
      }
    }

    if (!td.title) {
      errors.push('Missing required field: title')
    } else if (typeof td.title !== 'string') {
      errors.push('title must be a string')
    }

    // 3. Security validation
    if (!td.securityDefinitions) {
      warnings.push('No security definitions provided')
    }
    if (!td.security) {
      warnings.push('No security configuration provided')
    }

    // 4. Capabilities validation
    const hasProperties = td.properties && Object.keys(td.properties).length > 0
    const hasActions = td.actions && Object.keys(td.actions).length > 0
    const hasEvents = td.events && Object.keys(td.events).length > 0

    if (!hasProperties && !hasActions && !hasEvents) {
      warnings.push('Thing has no properties, actions, or events')
    }

    // 5. Forms validation
    this.validateForms(td, errors, warnings)

    // 6. Data schema validation
    this.validateDataSchemas(td, errors, warnings)

    const details = {
      hasContext: !!td['@context'],
      hasTitle: !!td.title,
      hasValidJSON: true,
      hasProperties,
      hasActions,
      hasEvents,
      hasSecurity: !!(td.securityDefinitions && td.security)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      details
    }
  }

  private validateForms(td: any, errors: string[], warnings: string[]) {
    // Validate forms in properties
    if (td.properties) {
      Object.entries(td.properties).forEach(([key, property]: [string, any]) => {
        if (property.forms && Array.isArray(property.forms)) {
          property.forms.forEach((form: any, index: number) => {
            if (!form.href) {
              errors.push(`Property "${key}" form ${index} missing href`)
            }
          })
        } else if (!property.forms) {
          warnings.push(`Property "${key}" has no forms`)
        }
      })
    }

    // Validate forms in actions
    if (td.actions) {
      Object.entries(td.actions).forEach(([key, action]: [string, any]) => {
        if (action.forms && Array.isArray(action.forms)) {
          action.forms.forEach((form: any, index: number) => {
            if (!form.href) {
              errors.push(`Action "${key}" form ${index} missing href`)
            }
          })
        } else if (!action.forms) {
          warnings.push(`Action "${key}" has no forms`)
        }
      })
    }

    // Validate forms in events
    if (td.events) {
      Object.entries(td.events).forEach(([key, event]: [string, any]) => {
        if (event.forms && Array.isArray(event.forms)) {
          event.forms.forEach((form: any, index: number) => {
            if (!form.href) {
              errors.push(`Event "${key}" form ${index} missing href`)
            }
          })
        } else if (!event.forms) {
          warnings.push(`Event "${key}" has no forms`)
        }
      })
    }
  }

  private validateDataSchemas(td: any, errors: string[], warnings: string[]) {
    // Validate property data schemas
    if (td.properties) {
      Object.entries(td.properties).forEach(([key, property]: [string, any]) => {
        if (!property.type) {
          warnings.push(`Property "${key}" has no type specified`)
        }
        
        if (property.type === 'number' || property.type === 'integer') {
          if (property.minimum !== undefined && property.maximum !== undefined) {
            if (property.minimum > property.maximum) {
              errors.push(`Property "${key}" minimum value is greater than maximum`)
            }
          }
        }
      })
    }

    // Validate action input/output schemas
    if (td.actions) {
      Object.entries(td.actions).forEach(([key, action]: [string, any]) => {
        if (action.input && action.input.type === 'object' && action.input.properties) {
          if (action.input.required && Array.isArray(action.input.required)) {
            action.input.required.forEach((requiredField: string) => {
              if (!action.input.properties[requiredField]) {
                errors.push(`Action "${key}" input requires field "${requiredField}" but it's not defined`)
              }
            })
          }
        }
      })
    }
  }

  getSuggestions(td: any): string[] {
    const suggestions: string[] = []

    if (!td.description) {
      suggestions.push('Add a description to help users understand this Thing')
    }

    if (!td.version) {
      suggestions.push('Consider adding version information')
    }

    if (!td.support) {
      suggestions.push('Add support contact information')
    }

    if (td.securityDefinitions && Object.keys(td.securityDefinitions).includes('nosec_sc')) {
      suggestions.push('Consider using stronger security than "nosec" for production')
    }

    // Check for observable properties
    if (td.properties) {
      const observableCount = Object.values(td.properties).filter((prop: any) => prop.observable).length
      if (observableCount === 0) {
        suggestions.push('Consider making some properties observable for real-time updates')
      }
    }

    return suggestions
  }
}

export const simpleTDValidator = new SimpleTDValidator()