import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Play, Settings, Zap, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Thing } from '@/stores/thingsStore'
import { toast } from 'sonner'

interface ThingActionsProps {
  thing: Thing
  actions: [string, any][]
}

interface ActionExecution {
  id: string
  actionName: string
  input: any
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime: string
  endTime?: string
  result?: any
  error?: string
}

export function ThingActions({ thing, actions }: ThingActionsProps) {
  const [executions, setExecutions] = useState<ActionExecution[]>([])
  const [isExecuting, setIsExecuting] = useState<{ [key: string]: boolean }>({})

  const executeAction = async (actionName: string, input: any) => {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const execution: ActionExecution = {
      id: executionId,
      actionName,
      input,
      status: 'pending',
      startTime: new Date().toISOString()
    }

    setExecutions(prev => [execution, ...prev])
    setIsExecuting(prev => ({ ...prev, [actionName]: true }))

    try {
      // Update to running
      setExecutions(prev => prev.map(exec => 
        exec.id === executionId 
          ? { ...exec, status: 'running' as const }
          : exec
      ))

      // Simulate action execution with realistic delay
      const delay = Math.random() * 3000 + 1000 // 1-4 seconds
      await new Promise(resolve => setTimeout(resolve, delay))

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1

      if (success) {
        const mockResult = generateMockResult(actionName, input)
        setExecutions(prev => prev.map(exec => 
          exec.id === executionId 
            ? { 
                ...exec, 
                status: 'completed' as const,
                endTime: new Date().toISOString(),
                result: mockResult
              }
            : exec
        ))
        toast.success(`Action "${actionName}" completed successfully`)
      } else {
        const mockError = `Action failed: ${['Network timeout', 'Device unavailable', 'Invalid parameters'][Math.floor(Math.random() * 3)]}`
        setExecutions(prev => prev.map(exec => 
          exec.id === executionId 
            ? { 
                ...exec, 
                status: 'failed' as const,
                endTime: new Date().toISOString(),
                error: mockError
              }
            : exec
        ))
        toast.error(`Action "${actionName}" failed: ${mockError}`)
      }
    } catch (error) {
      setExecutions(prev => prev.map(exec => 
        exec.id === executionId 
          ? { 
              ...exec, 
              status: 'failed' as const,
              endTime: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : exec
      ))
      toast.error(`Action "${actionName}" failed`)
    } finally {
      setIsExecuting(prev => ({ ...prev, [actionName]: false }))
    }
  }

  const generateMockResult = (actionName: string, input: any) => {
    // Generate realistic mock results based on action name and input
    if (actionName.toLowerCase().includes('coffee') || actionName.toLowerCase().includes('drink')) {
      return {
        status: 'brewing',
        estimatedTime: '3 minutes',
        taskId: `task-${Math.random().toString(36).substr(2, 9)}`
      }
    }
    
    if (actionName.toLowerCase().includes('calculate')) {
      return {
        result: Math.random() * 100,
        operation: 'completed',
        precision: 2
      }
    }

    if (actionName.toLowerCase().includes('move') || actionName.toLowerCase().includes('position')) {
      return {
        position: { x: Math.random() * 100, y: Math.random() * 100 },
        status: 'moved'
      }
    }

    return {
      status: 'completed',
      timestamp: new Date().toISOString(),
      actionId: Math.random().toString(36).substr(2, 9)
    }
  }

  const getActionIcon = (action: any) => {
    const title = action.title?.toLowerCase() || ''
    if (title.includes('play') || title.includes('start')) {
      return <Play className="h-4 w-4" />
    }
    if (title.includes('config') || title.includes('set')) {
      return <Settings className="h-4 w-4" />
    }
    return <Zap className="h-4 w-4" />
  }

  const getStatusIcon = (status: ActionExecution['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: ActionExecution['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Actions
          </CardTitle>
          <CardDescription>
            This Thing has no actions defined.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Actions Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Available Actions ({actions.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map(([name, action]) => (
            <ActionCard
              key={name}
              name={name}
              action={action}
              isExecuting={isExecuting[name] || false}
              onExecute={(input) => executeAction(name, input)}
            />
          ))}
        </div>
      </div>

      {/* Execution History */}
      {executions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Execution History
          </h3>
          
          <div className="space-y-2">
            {executions.slice(0, 10).map((execution) => (
              <Card key={execution.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="font-medium text-sm">{execution.actionName}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(execution.startTime).toLocaleString()}
                        {execution.endTime && (
                          <span> - {new Date(execution.endTime).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>
                </div>
                
                {execution.result && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                    <strong>Result:</strong> {JSON.stringify(execution.result, null, 2)}
                  </div>
                )}
                
                {execution.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-800 dark:text-red-300">
                    <strong>Error:</strong> {execution.error}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ActionCardProps {
  name: string
  action: any
  isExecuting: boolean
  onExecute: (input: any) => void
}

function ActionCard({ name, action, isExecuting, onExecute }: ActionCardProps) {
  const [input, setInput] = useState<any>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const hasInput = action.input && (
    action.input.type === 'object' ||
    action.input.properties ||
    action.input.type
  )

  const handleQuickExecute = () => {
    if (hasInput) {
      setIsDialogOpen(true)
    } else {
      onExecute(null)
    }
  }

  const handleExecuteWithInput = () => {
    onExecute(input)
    setIsDialogOpen(false)
    setInput({})
  }

  const renderInputField = (fieldName: string, fieldSchema: any) => {
    const type = fieldSchema.type || 'string'
    
    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={input[fieldName] || false}
              onCheckedChange={(checked) => setInput(prev => ({ ...prev, [fieldName]: checked }))}
            />
            <Label>{fieldSchema.title || fieldName}</Label>
          </div>
        )
      
      case 'number':
      case 'integer':
        return (
          <div className="space-y-2">
            <Label>{fieldSchema.title || fieldName}</Label>
            <Input
              type="number"
              min={fieldSchema.minimum}
              max={fieldSchema.maximum}
              step={type === 'integer' ? 1 : 0.01}
              value={input[fieldName] || ''}
              onChange={(e) => setInput(prev => ({ 
                ...prev, 
                [fieldName]: type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value)
              }))}
              placeholder={fieldSchema.description}
            />
          </div>
        )
      
      case 'string':
        if (fieldSchema.enum) {
          return (
            <div className="space-y-2">
              <Label>{fieldSchema.title || fieldName}</Label>
              <Select 
                value={input[fieldName] || ''} 
                onValueChange={(value) => setInput(prev => ({ ...prev, [fieldName]: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {fieldSchema.enum.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }
        
        if (fieldSchema.maxLength && fieldSchema.maxLength > 100) {
          return (
            <div className="space-y-2">
              <Label>{fieldSchema.title || fieldName}</Label>
              <Textarea
                value={input[fieldName] || ''}
                onChange={(e) => setInput(prev => ({ ...prev, [fieldName]: e.target.value }))}
                placeholder={fieldSchema.description}
                maxLength={fieldSchema.maxLength}
              />
            </div>
          )
        }
        
        return (
          <div className="space-y-2">
            <Label>{fieldSchema.title || fieldName}</Label>
            <Input
              value={input[fieldName] || ''}
              onChange={(e) => setInput(prev => ({ ...prev, [fieldName]: e.target.value }))}
              placeholder={fieldSchema.description}
              maxLength={fieldSchema.maxLength}
            />
          </div>
        )
      
      default:
        return (
          <div className="space-y-2">
            <Label>{fieldSchema.title || fieldName}</Label>
            <Input
              value={input[fieldName] || ''}
              onChange={(e) => setInput(prev => ({ ...prev, [fieldName]: e.target.value }))}
              placeholder={fieldSchema.description}
            />
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">
            {action.title || name}
          </CardTitle>
        </div>
        {action.description && (
          <CardDescription className="text-xs">
            {action.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Action details */}
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          {hasInput && (
            <div className="flex justify-between">
              <span>Input Required:</span>
              <span className="font-mono">Yes</span>
            </div>
          )}
          {action.output && (
            <div className="flex justify-between">
              <span>Output:</span>
              <span className="font-mono">{action.output.type || 'any'}</span>
            </div>
          )}
          {action.safe !== undefined && (
            <div className="flex justify-between">
              <span>Safe:</span>
              <span className="font-mono">{action.safe ? 'Yes' : 'No'}</span>
            </div>
          )}
          {action.idempotent !== undefined && (
            <div className="flex justify-between">
              <span>Idempotent:</span>
              <span className="font-mono">{action.idempotent ? 'Yes' : 'No'}</span>
            </div>
          )}
        </div>

        {/* Execute button */}
        <div className="pt-2">
          {hasInput ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={isExecuting}
                  size="sm"
                >
                  <Play className="h-3 w-3 mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Execute {action.title || name}</DialogTitle>
                  <DialogDescription>
                    {action.description || 'Configure the input parameters for this action.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {action.input?.properties && Object.entries(action.input.properties).map(([fieldName, fieldSchema]) => (
                    <div key={fieldName}>
                      {renderInputField(fieldName, fieldSchema)}
                    </div>
                  ))}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleExecuteWithInput} disabled={isExecuting}>
                      <Play className="h-3 w-3 mr-2" />
                      Execute
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleQuickExecute}
              disabled={isExecuting}
              size="sm"
            >
              <Play className="h-3 w-3 mr-2" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}