import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  Download,
  Maximize2
} from 'lucide-react'
import { PropertyValue } from '@/services/monitoringService'
import { useMonitoringStore } from '@/stores/monitoringStore'

interface PropertyChartProps {
  thingId: string
  thingTitle: string
  propertyName: string
  height?: number
  showControls?: boolean
  timeRange?: string
}

interface ChartDataPoint {
  timestamp: string
  value: number
  formattedTime: string
  quality: string
}

export function PropertyChart({ 
  thingId, 
  thingTitle, 
  propertyName, 
  height = 300,
  showControls = true,
  timeRange = '1h'
}: PropertyChartProps) {
  const { propertyValues } = useMonitoringStore()
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line')
  const [isLive, setIsLive] = useState(true)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [currentValue, setCurrentValue] = useState<PropertyValue | null>(null)

  // Get current property value
  useEffect(() => {
    const key = `${thingId}:${propertyName}`
    const value = propertyValues.get(key)
    if (value) {
      setCurrentValue(value)
    }
  }, [propertyValues, thingId, propertyName])

  // Update chart data when new values arrive
  useEffect(() => {
    if (currentValue && isLive) {
      const newDataPoint: ChartDataPoint = {
        timestamp: currentValue.timestamp,
        value: typeof currentValue.value === 'number' ? currentValue.value : 0,
        formattedTime: new Date(currentValue.timestamp).toLocaleTimeString(),
        quality: currentValue.quality || 'unknown'
      }

      setChartData(prev => {
        const updated = [...prev, newDataPoint]
        
        // Keep only data points within time range
        const now = new Date()
        const rangeMs = getTimeRangeMs(timeRange)
        const cutoff = new Date(now.getTime() - rangeMs)
        
        return updated.filter(point => 
          new Date(point.timestamp) > cutoff
        ).slice(-100) // Limit to 100 points max
      })
    }
  }, [currentValue, isLive, timeRange])

  const getTimeRangeMs = (range: string): number => {
    switch (range) {
      case '5m': return 5 * 60 * 1000
      case '15m': return 15 * 60 * 1000
      case '1h': return 60 * 60 * 1000
      case '6h': return 6 * 60 * 60 * 1000
      case '24h': return 24 * 60 * 60 * 1000
      default: return 60 * 60 * 1000
    }
  }

  const getValueTrend = (): 'up' | 'down' | 'stable' => {
    if (chartData.length < 2) return 'stable'
    
    const recent = chartData.slice(-5) // Last 5 points
    const start = recent[0]?.value || 0
    const end = recent[recent.length - 1]?.value || 0
    const threshold = Math.abs(start) * 0.05 // 5% threshold
    
    if (end > start + threshold) return 'up'
    if (end < start - threshold) return 'down'
    return 'stable'
  }

  const getStatistics = () => {
    if (chartData.length === 0) return null
    
    const values = chartData.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    
    return { min, max, avg }
  }

  const trend = getValueTrend()
  const stats = getStatistics()

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedTime" 
              fontSize={12}
              tick={{ fontSize: 10 }}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              labelFormatter={(value) => `Time: ${value}`}
              formatter={(value: number) => [value.toFixed(2), 'Value']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
            />
          </AreaChart>
        )
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedTime" 
              fontSize={12}
              tick={{ fontSize: 10 }}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              labelFormatter={(value) => `Time: ${value}`}
              formatter={(value: number) => [value.toFixed(2), 'Value']}
            />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        )
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedTime" 
              fontSize={12}
              tick={{ fontSize: 10 }}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              labelFormatter={(value) => `Time: ${value}`}
              formatter={(value: number) => [value.toFixed(2), 'Value']}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
            {stats && (
              <>
                <ReferenceLine y={stats.avg} stroke="#10b981" strokeDasharray="5 5" />
              </>
            )}
          </LineChart>
        )
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(chartData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${thingTitle}-${propertyName}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{propertyName}</CardTitle>
            <p className="text-xs text-muted-foreground">{thingTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {currentValue && (
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold">
                    {typeof currentValue.value === 'number' 
                      ? currentValue.value.toFixed(2) 
                      : currentValue.value}
                  </span>
                  {currentValue.unit && (
                    <span className="text-sm text-muted-foreground">
                      {currentValue.unit}
                    </span>
                  )}
                  {getTrendIcon()}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    currentValue.quality === 'good' ? 'text-green-600' :
                    currentValue.quality === 'uncertain' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}
                >
                  {currentValue.quality || 'unknown'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showControls && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                </SelectContent>
              </Select>
              
              <Badge variant={isLive ? "default" : "secondary"} className="text-xs">
                {isLive ? 'Live' : 'Paused'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {stats && (
                <div className="text-xs text-muted-foreground">
                  Min: {stats.min.toFixed(2)} | 
                  Avg: {stats.avg.toFixed(2)} | 
                  Max: {stats.max.toFixed(2)}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                className="h-7 px-2"
              >
                <Download className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div style={{ height }}>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MoreHorizontal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Waiting for data...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            {chartData.length} data points • Last update: {
              currentValue ? new Date(currentValue.timestamp).toLocaleString() : 'Never'
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}