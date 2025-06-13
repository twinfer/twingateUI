import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Activity, RefreshCw, Eye, EyeOff, Thermometer, Gauge, Zap, BarChart3 } from 'lucide-react'
import { Thing } from '@/stores/thingsStore'

interface ThingPropertiesProps {
  thing: Thing
  properties: [string, any][]
}

interface PropertyValue {
  value: any
  timestamp: string
  quality?: 'good' | 'uncertain' | 'bad'
}

interface PropertyMonitor {
  [key: string]: {
    enabled: boolean
    lastValue: PropertyValue | null
    history: PropertyValue[]
  }
}

export function ThingProperties({ thing, properties }: ThingPropertiesProps) {
  const [monitoring, setMonitoring] = useState<PropertyMonitor>({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialize monitoring state
  useEffect(() => {
    const initialMonitoring: PropertyMonitor = {}
    properties.forEach(([name]) => {
      initialMonitoring[name] = {
        enabled: false,
        lastValue: null,
        history: []
      }
    })
    setMonitoring(initialMonitoring)
  }, [properties])

  // Mock real-time property updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMonitoring(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(propertyName => {
          if (updated[propertyName].enabled) {
            const property = properties.find(([name]) => name === propertyName)?.[1]
            if (property) {
              const mockValue = generateMockValue(property)
              const newValue: PropertyValue = {
                value: mockValue,
                timestamp: new Date().toISOString(),
                quality: 'good'
              }
              
              updated[propertyName].lastValue = newValue
              updated[propertyName].history = [
                ...updated[propertyName].history.slice(-29), // Keep last 30 values
                newValue
              ]
            }
          }
        })
        return updated
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [properties])

  const generateMockValue = (property: any) => {
    const type = property.type || 'string'
    
    switch (type) {
      case 'number':
      case 'integer':
        const min = property.minimum || 0
        const max = property.maximum || 100
        return Math.round((Math.random() * (max - min) + min) * 100) / 100
      case 'boolean':
        return Math.random() > 0.5
      case 'string':
        if (property.enum) {
          return property.enum[Math.floor(Math.random() * property.enum.length)]
        }
        return `value-${Math.floor(Math.random() * 1000)}`
      default:
        return Math.floor(Math.random() * 100)
    }
  }

  const toggleMonitoring = (propertyName: string) => {
    setMonitoring(prev => ({
      ...prev,
      [propertyName]: {
        ...prev[propertyName],
        enabled: !prev[propertyName]?.enabled
      }
    }))
  }

  const refreshProperty = async (propertyName: string) => {
    setIsRefreshing(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const property = properties.find(([name]) => name === propertyName)?.[1]
    if (property) {
      const mockValue = generateMockValue(property)
      const newValue: PropertyValue = {
        value: mockValue,
        timestamp: new Date().toISOString(),
        quality: 'good'
      }
      
      setMonitoring(prev => ({
        ...prev,
        [propertyName]: {
          ...prev[propertyName],
          lastValue: newValue,
          history: [
            ...(prev[propertyName]?.history || []).slice(-29),
            newValue
          ]
        }
      }))
    }
    setIsRefreshing(false)
  }

  const getPropertyIcon = (property: any) => {
    const type = property.type || 'string'
    const unit = property.unit || ''
    
    if (unit.includes('celsius') || unit.includes('fahrenheit') || property.title?.toLowerCase().includes('temperature')) {
      return <Thermometer className="h-4 w-4" />
    }
    if (unit.includes('percent') || unit.includes('%')) {
      return <BarChart3 className="h-4 w-4" />
    }
    if (type === 'boolean') {
      return <Zap className="h-4 w-4" />
    }
    if (type === 'number' || type === 'integer') {
      return <Gauge className="h-4 w-4" />
    }
    return <Activity className="h-4 w-4" />
  }

  const formatValue = (value: any, property: any) => {
    if (value === null || value === undefined) return 'N/A'
    
    const type = property.type || 'string'
    const unit = property.unit || ''
    
    if (type === 'number' || type === 'integer') {
      const formatted = typeof value === 'number' ? value.toFixed(2) : value
      return unit ? `${formatted} ${unit}` : formatted
    }
    
    if (type === 'boolean') {
      return value ? 'ON' : 'OFF'
    }
    
    return String(value)
  }

  const getValueBadgeColor = (property: any, value: any) => {
    const type = property.type || 'string'
    
    if (type === 'boolean') {
      return value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
    
    if (type === 'number' || type === 'integer') {
      const min = property.minimum
      const max = property.maximum
      
      if (min !== undefined && max !== undefined) {
        const percent = ((value - min) / (max - min)) * 100
        if (percent < 25) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        if (percent < 50) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        if (percent < 75) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      }
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Properties
          </CardTitle>
          <CardDescription>
            This Thing has no properties defined.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Properties ({properties.length})
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Real-time monitoring available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map(([name, property]) => {
          const monitor = monitoring[name]
          const isMonitoring = monitor?.enabled || false
          const lastValue = monitor?.lastValue
          
          return (
            <Card key={name} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPropertyIcon(property)}
                    <CardTitle className="text-sm font-medium truncate">
                      {property.title || name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refreshProperty(name)}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <div className="flex items-center gap-1">
                      {isMonitoring ? (
                        <Eye className="h-3 w-3 text-green-500" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                      <Switch
                        checked={isMonitoring}
                        onCheckedChange={() => toggleMonitoring(name)}
                      />
                    </div>
                  </div>
                </div>
                {property.description && (
                  <CardDescription className="text-xs">
                    {property.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Current Value */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Current Value</span>
                    {lastValue && (
                      <span className="text-xs text-gray-500">
                        {new Date(lastValue.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`w-full justify-center ${getValueBadgeColor(property, lastValue?.value)}`}
                  >
                    {lastValue ? formatValue(lastValue.value, property) : 'No data'}
                  </Badge>
                </div>

                {/* Progress bar for numeric values */}
                {(property.type === 'number' || property.type === 'integer') && 
                 property.minimum !== undefined && property.maximum !== undefined && lastValue && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{property.minimum}</span>
                      <span>{property.maximum}</span>
                    </div>
                    <Progress 
                      value={((lastValue.value - property.minimum) / (property.maximum - property.minimum)) * 100}
                      className="h-2"
                    />
                  </div>
                )}

                {/* Property details */}
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-mono">{property.type || 'any'}</span>
                  </div>
                  {property.unit && (
                    <div className="flex justify-between">
                      <span>Unit:</span>
                      <span className="font-mono">{property.unit}</span>
                    </div>
                  )}
                  {property.readOnly && (
                    <div className="flex justify-between">
                      <span>Access:</span>
                      <span className="font-mono">Read-only</span>
                    </div>
                  )}
                  {property.observable && (
                    <div className="flex justify-between">
                      <span>Observable:</span>
                      <span className="font-mono">Yes</span>
                    </div>
                  )}
                </div>

                {/* Monitoring indicator */}
                {isMonitoring && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Activity className="h-3 w-3 animate-pulse" />
                    <span>Live monitoring</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}