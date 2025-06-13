import { DiscoveredThing } from '@/services/discoveryService'
import { Thing, ThingProperty, ThingAction, ThingEvent } from '@/stores/thingsStore'

/**
 * Transform DiscoveredThing to Thing format
 * Centralized transformation logic to avoid duplication
 */
export function transformDiscoveredThing(discovered: DiscoveredThing): Thing {
  return {
    id: discovered.id,
    title: discovered.title,
    description: discovered.description,
    thingDescription: discovered.thingDescription,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    online: discovered.online,
    status: discovered.online ? 'online' as const : 'unknown' as const,
    url: discovered.url,
    lastSeen: new Date().toISOString(),
    discoveryMethod: discovered.discoveryMethod,
    properties: extractProperties(discovered.thingDescription),
    actions: extractActions(discovered.thingDescription),
    events: extractEvents(discovered.thingDescription),
    tags: extractTags(discovered.thingDescription),
    category: extractCategory(discovered.thingDescription),
    validationStatus: discovered.validationStatus,
    validationErrors: discovered.validationErrors,
  }
}

/**
 * Extract properties from Thing Description
 */
export function extractProperties(td: any): ThingProperty[] {
  if (!td.properties) return []
  
  return Object.entries(td.properties).map(([key, prop]: [string, any]) => ({
    id: key,
    name: prop.title || key,
    type: prop.type || 'unknown',
    value: null, // Will be populated when reading
    lastUpdated: new Date().toISOString(),
    writable: prop.writeOnly !== true,
    observable: prop.observable === true,
  }))
}

/**
 * Extract actions from Thing Description
 */
export function extractActions(td: any): ThingAction[] {
  if (!td.actions) return []
  
  return Object.entries(td.actions).map(([key, action]: [string, any]) => ({
    id: key,
    name: action.title || key,
    input: action.input,
    output: action.output,
    description: action.description,
  }))
}

/**
 * Extract events from Thing Description
 */
export function extractEvents(td: any): ThingEvent[] {
  if (!td.events) return []
  
  return Object.entries(td.events).map(([key, event]: [string, any]) => ({
    id: key,
    name: event.title || key,
    data: event.data,
    description: event.description,
  }))
}

/**
 * Extract tags from Thing Description
 */
export function extractTags(td: any): string[] {
  const tags: string[] = []
  
  // Extract from @type
  if (td['@type']) {
    const types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']]
    tags.push(...types.filter((type: any) => typeof type === 'string'))
  }
  
  // Extract from security schemes
  if (td.securityDefinitions) {
    Object.keys(td.securityDefinitions).forEach(scheme => {
      tags.push(`security:${scheme}`)
    })
  }
  
  return tags
}

/**
 * Extract category from Thing Description
 */
export function extractCategory(td: any): string | undefined {
  // Try to determine category from @type or other metadata
  if (td['@type']) {
    const types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']]
    
    // Common IoT device categories
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

/**
 * Validate that a Thing can be treated as a DiscoveredThing
 */
export function isDiscoveredThing(thing: Thing): thing is Thing & { url: string } {
  return Boolean(thing.url && thing.discoveryMethod)
}

/**
 * Convert Thing back to DiscoveredThing format (if it was discovered)
 */
export function thingToDiscoveredThing(thing: Thing): DiscoveredThing | null {
  if (!isDiscoveredThing(thing)) {
    return null
  }
  
  return {
    id: thing.id,
    url: thing.url,
    thingDescription: thing.thingDescription,
    title: thing.title,
    description: thing.description,
    discoveryMethod: thing.discoveryMethod,
    lastSeen: thing.lastSeen || new Date().toISOString(),
    online: thing.online,
    validationStatus: thing.validationStatus || 'pending',
    validationErrors: thing.validationErrors,
  }
}