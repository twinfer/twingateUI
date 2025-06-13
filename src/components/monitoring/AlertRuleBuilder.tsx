import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertRule } from '@/services/monitoringService'
import { Thing } from '@/stores/thingsStore'

interface AlertRuleBuilderProps {
  things: Thing[]
  initialRule?: AlertRule | null
  onSave: (rule: Omit<AlertRule, 'id' | 'created'>) => void
  onCancel: () => void
}

export function AlertRuleBuilder({ things, initialRule, onSave, onCancel }: AlertRuleBuilderProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thingId: 'all',
    propertyName: '',
    operator: '>' as AlertRule['condition']['operator'],
    value: '',
    value2: '',
    severity: 'warning' as AlertRule['severity'],
    enabled: true,
    cooldownMinutes: 5,
    notificationChannels: [] as string[],
  })

  const [selectedThing, setSelectedThing] = useState<Thing | null>(null)
  const [availableProperties, setAvailableProperties] = useState<string[]>([])

  useEffect(() => {
    if (initialRule) {
      setFormData({
        name: initialRule.name,
        description: initialRule.description || '',
        thingId: initialRule.thingId || 'all',
        propertyName: initialRule.propertyName,
        operator: initialRule.condition.operator,
        value: initialRule.condition.value?.toString() || '',
        value2: initialRule.condition.value2?.toString() || '',
        severity: initialRule.severity,
        enabled: initialRule.enabled,
        cooldownMinutes: initialRule.cooldownMinutes,
        notificationChannels: initialRule.notificationChannels,
      })
    }
  }, [initialRule])

  useEffect(() => {
    if (formData.thingId) {
      const thing = things.find(t => t.id === formData.thingId)
      setSelectedThing(thing || null)
      
      if (thing?.thingDescription) {
        const td = thing.thingDescription as any
        const properties = td.properties ? Object.keys(td.properties) : []
        setAvailableProperties(properties)
        
        // Reset property selection if current property is not available
        if (formData.propertyName && !properties.includes(formData.propertyName)) {
          setFormData(prev => ({ ...prev, propertyName: '' }))
        }
      }
    } else {
      setSelectedThing(null)
      setAvailableProperties([])
    }
  }, [formData.thingId, things])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const rule: Omit<AlertRule, 'id' | 'created'> = {
      name: formData.name,
      description: formData.description || undefined,
      thingId: formData.thingId === 'all' ? undefined : formData.thingId || undefined,
      propertyName: formData.propertyName,
      condition: {
        operator: formData.operator,
        value: parseValue(formData.value),
        value2: formData.operator === 'range' ? parseValue(formData.value2) : undefined,
      },
      severity: formData.severity,
      enabled: formData.enabled,
      notificationChannels: formData.notificationChannels,
      cooldownMinutes: formData.cooldownMinutes,
    }
    
    onSave(rule)
  }

  const parseValue = (value: string): any => {
    if (value === '') return null
    
    // Try to parse as number
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) return numValue
    
    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
    
    // Return as string
    return value
  }

  const getOperatorLabel = (op: AlertRule['condition']['operator']) => {
    switch (op) {
      case '>': return 'Greater than'
      case '<': return 'Less than'
      case '>=': return 'Greater than or equal'
      case '<=': return 'Less than or equal'
      case '=': return 'Equal to'
      case '!=': return 'Not equal to'
      case 'contains': return 'Contains'
      case 'range': return 'In range'
      default: return op
    }
  }

  const isFormValid = () => {
    return formData.name.trim() !== '' &&
           formData.propertyName.trim() !== '' &&
           formData.value.trim() !== '' &&
           (formData.operator !== 'range' || formData.value2.trim() !== '')
  }

  const getPropertyType = (propertyName: string): string => {
    if (!selectedThing?.thingDescription) return 'unknown'
    
    const td = selectedThing.thingDescription as any
    const property = td.properties?.[propertyName]
    if (!property) return 'unknown'
    
    if (property.type) return property.type
    if (property.schema?.type) return property.schema.type
    
    return 'unknown'
  }

  const getSuggestedOperators = (propertyType: string): AlertRule['condition']['operator'][] => {
    switch (propertyType) {
      case 'number':
      case 'integer':
        return ['>', '<', '>=', '<=', '=', '!=', 'range']
      case 'boolean':
        return ['=', '!=']
      case 'string':
        return ['=', '!=', 'contains']
      default:
        return ['>', '<', '>=', '<=', '=', '!=', 'contains', 'range']
    }
  }

  const propertyType = formData.propertyName ? getPropertyType(formData.propertyName) : 'unknown'
  const suggestedOperators = getSuggestedOperators(propertyType)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="High temperature alert"
                required
              />
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: AlertRule['severity']) => 
                  setFormData(prev => ({ ...prev, severity: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe when this alert should trigger..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Target Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Target Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="thing">Thing</Label>
              <Select
                value={formData.thingId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, thingId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Thing (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Things</SelectItem>
                  {things.map(thing => (
                    <SelectItem key={thing.id} value={thing.id}>
                      {thing.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to apply to all Things with the specified property
              </p>
            </div>
            
            <div>
              <Label htmlFor="property">Property *</Label>
              <Select
                value={formData.propertyName}
                onValueChange={(value) => setFormData(prev => ({ ...prev, propertyName: value }))}
                disabled={!formData.thingId && availableProperties.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {formData.thingId ? (
                    availableProperties.map(prop => (
                      <SelectItem key={prop} value={prop}>
                        {prop}
                      </SelectItem>
                    ))
                  ) : (
                    // When no specific thing is selected, show common property names
                    ['temperature', 'humidity', 'pressure', 'status', 'power', 'level'].map(prop => (
                      <SelectItem key={prop} value={prop}>
                        {prop}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formData.propertyName && propertyType !== 'unknown' && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Type: {propertyType}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="operator">Operator *</Label>
              <Select
                value={formData.operator}
                onValueChange={(value: AlertRule['condition']['operator']) => 
                  setFormData(prev => ({ ...prev, operator: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {suggestedOperators.map(op => (
                    <SelectItem key={op} value={op}>
                      {getOperatorLabel(op)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder={propertyType === 'boolean' ? 'true/false' : '0'}
                required
              />
            </div>
            
            {formData.operator === 'range' && (
              <div>
                <Label htmlFor="value2">Max Value *</Label>
                <Input
                  id="value2"
                  value={formData.value2}
                  onChange={(e) => setFormData(prev => ({ ...prev, value2: e.target.value }))}
                  placeholder="100"
                  required
                />
              </div>
            )}
          </div>

          {/* Condition Preview */}
          <div className="p-3 bg-gray-50 rounded border">
            <Label className="text-sm font-medium">Condition Preview:</Label>
            <p className="text-sm mt-1">
              Trigger when <code className="bg-white px-1 rounded">{formData.propertyName || '[property]'}</code>
              {' '}<strong>{getOperatorLabel(formData.operator)}</strong>{' '}
              <code className="bg-white px-1 rounded">
                {formData.operator === 'range' 
                  ? `${formData.value || '[min]'} - ${formData.value2 || '[max]'}`
                  : formData.value || '[value]'
                }
              </code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cooldown">Cooldown (minutes)</Label>
              <Input
                id="cooldown"
                type="number"
                min="0"
                value={formData.cooldownMinutes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  cooldownMinutes: parseInt(e.target.value) || 0 
                }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum time between alerts for the same rule
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, enabled: checked }))
                }
              />
              <Label htmlFor="enabled">Enable rule immediately</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isFormValid()}>
          {initialRule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  )
}