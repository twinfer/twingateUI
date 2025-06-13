import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  AlertTriangle,
  AlertCircle,
  XCircle,
  Info,
  Plus,
  Settings,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Trash2,
  Edit
} from 'lucide-react'
import { useThingsStore } from '@/stores/thingsStore'
import { useMonitoringStore } from '@/stores/monitoringStore'
import { Alert, AlertRule } from '@/services/monitoringService'
import { AlertRuleBuilder } from '@/components/monitoring/AlertRuleBuilder'
import { MonitoringErrorBoundary } from '@/components/MonitoringErrorBoundary'

interface AlertCardProps {
  alert: Alert
  onAcknowledge: (alertId: string) => void
}

function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-300 bg-red-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className={`transition-all duration-200 ${getSeverityColor(alert.severity)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getSeverityIcon(alert.severity)}
              <div>
                <h3 className="font-semibold text-sm">{alert.ruleName}</h3>
                <p className="text-xs text-muted-foreground">
                  {alert.thingTitle} • {alert.propertyName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {alert.severity}
              </Badge>
              {alert.acknowledged && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  ACK
                </Badge>
              )}
            </div>
          </div>

          {/* Alert Message */}
          <div className="bg-white/50 p-3 rounded border">
            <p className="text-sm font-medium">{alert.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Current value: <strong>{alert.currentValue}</strong>
            </p>
          </div>

          {/* Acknowledgment Info */}
          {alert.acknowledged && alert.acknowledgedBy && (
            <div className="text-xs text-muted-foreground">
              Acknowledged by {alert.acknowledgedBy} on {new Date(alert.acknowledgedAt!).toLocaleString()}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimestamp(alert.timestamp)}
            </div>
            {!alert.acknowledged && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAcknowledge(alert.id)}
                className="h-7 px-3 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Acknowledge
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AlertRuleCardProps {
  rule: AlertRule
  onEdit: (rule: AlertRule) => void
  onToggle: (ruleId: string) => void
  onDelete: (ruleId: string) => void
}

function AlertRuleCard({ rule, onEdit, onToggle, onDelete }: AlertRuleCardProps) {
  const formatCondition = (condition: AlertRule['condition']) => {
    const { operator, value, value2 } = condition
    if (operator === 'range' && value2 !== undefined) {
      return `${operator} ${value} - ${value2}`
    }
    return `${operator} ${value}`
  }

  return (
    <Card className={rule.enabled ? 'border-green-200' : 'border-gray-200'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {rule.enabled ? (
              <Bell className="h-4 w-4 text-green-600" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
            <CardTitle className="text-sm">{rule.name}</CardTitle>
          </div>
          <Switch
            checked={rule.enabled}
            onCheckedChange={() => onToggle(rule.id)}
          />
        </div>
        {rule.description && (
          <p className="text-xs text-muted-foreground">{rule.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Property:</span>
              <code className="text-xs bg-gray-100 px-1 rounded">{rule.propertyName}</code>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Condition:</span>
              <code className="text-xs bg-gray-100 px-1 rounded">
                {formatCondition(rule.condition)}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Severity:</span>
              <Badge variant="outline" className="text-xs">
                {rule.severity}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {rule.lastTriggered ? (
                `Last triggered: ${new Date(rule.lastTriggered).toLocaleDateString()}`
              ) : (
                'Never triggered'
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(rule)}
                className="h-6 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(rule.id)}
                className="h-6 px-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Alerts() {
  const { things } = useThingsStore()
  const { 
    activeAlerts,
    alertRules,
    acknowledgeAlert,
    addAlertRule,
    updateAlertRule,
    deleteAlertRule,
    toggleAlertRule
  } = useMonitoringStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showRuleBuilder, setShowRuleBuilder] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)

  // Filter alerts
  const filteredAlerts = activeAlerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false
    if (selectedStatus === 'active' && alert.acknowledged) return false
    if (selectedStatus === 'acknowledged' && !alert.acknowledged) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        alert.ruleName.toLowerCase().includes(query) ||
        alert.thingTitle.toLowerCase().includes(query) ||
        alert.message.toLowerCase().includes(query)
      )
    }
    return true
  })

  const handleAcknowledgeAlert = async (alertId: string) => {
    await acknowledgeAlert(alertId, 'current-user') // In real app, get current user
  }

  const handleSaveRule = (rule: Omit<AlertRule, 'id' | 'created'>) => {
    if (editingRule) {
      updateAlertRule(editingRule.id, rule)
    } else {
      addAlertRule(rule)
    }
    setShowRuleBuilder(false)
    setEditingRule(null)
  }

  const handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule)
    setShowRuleBuilder(true)
  }

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      deleteAlertRule(ruleId)
    }
  }

  const alertCounts = {
    total: activeAlerts.length,
    active: activeAlerts.filter(a => !a.acknowledged).length,
    critical: activeAlerts.filter(a => a.severity === 'critical').length,
    error: activeAlerts.filter(a => a.severity === 'error').length,
    warning: activeAlerts.filter(a => a.severity === 'warning').length,
  }

  const activeRules = alertRules.filter(rule => rule.enabled).length

  return (
    <MonitoringErrorBoundary componentName="Alerts">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Alert management • {alertCounts.active} active • {activeRules} rules enabled
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showRuleBuilder} onOpenChange={setShowRuleBuilder}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Alert Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
                </DialogTitle>
              </DialogHeader>
              <AlertRuleBuilder
                things={things}
                initialRule={editingRule}
                onSave={handleSaveRule}
                onCancel={() => {
                  setShowRuleBuilder(false)
                  setEditingRule(null)
                }}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{alertCounts.total}</div>
              <div className="text-sm text-muted-foreground">Total Alerts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{alertCounts.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{alertCounts.critical}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{alertCounts.error}</div>
              <div className="text-sm text-muted-foreground">Error</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{alertCounts.warning}</div>
              <div className="text-sm text-muted-foreground">Warning</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {alertCounts.total === 0 
                  ? 'All systems are running normally. Create alert rules to start monitoring.'
                  : 'All alerts have been acknowledged or resolved.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledgeAlert}
              />
            ))}
          </div>
        )}
      </div>

      {/* Alert Rules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Alert Rules</h2>
          <Badge variant="outline">
            {alertRules.length} rules • {activeRules} enabled
          </Badge>
        </div>
        
        {alertRules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Alert Rules</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Create alert rules to automatically monitor your Things and receive notifications when conditions are met.
              </p>
              <Button onClick={() => setShowRuleBuilder(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Rule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alertRules.map((rule) => (
              <AlertRuleCard
                key={rule.id}
                rule={rule}
                onEdit={handleEditRule}
                onToggle={toggleAlertRule}
                onDelete={handleDeleteRule}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </MonitoringErrorBoundary>
  )
}