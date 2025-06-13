import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  RefreshCw, 
  Activity,
  ArrowLeft
} from 'lucide-react'
import { ErrorBoundary } from './ErrorBoundary'
import { useNavigate } from 'react-router-dom'

interface MonitoringErrorFallbackProps {
  error: Error | null
  onRetry: () => void
}

function MonitoringErrorFallback({ error, onRetry }: MonitoringErrorFallbackProps) {
  const navigate = useNavigate()

  const getErrorMessage = (error: Error | null) => {
    if (!error) return 'An unknown error occurred'
    
    if (error.message.includes('require is not defined')) {
      return 'Module loading error. Please refresh the page.'
    }
    if (error.message.includes('monitoringService')) {
      return 'Monitoring service is temporarily unavailable.'
    }
    if (error.message.includes('Cannot read properties')) {
      return 'Data loading error. Some monitoring data may be unavailable.'
    }
    
    return error.message
  }

  const getSuggestion = (error: Error | null) => {
    if (!error) return 'Try refreshing the page'
    
    if (error.message.includes('require is not defined')) {
      return 'This is usually fixed by refreshing the page'
    }
    if (error.message.includes('monitoringService')) {
      return 'Check your network connection and try again'
    }
    if (error.message.includes('Cannot read properties')) {
      return 'Some data may be loading. Try again in a moment'
    }
    
    return 'Try the actions below to resolve this issue'
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">Monitoring Error</CardTitle>
          <Badge variant="secondary" className="mx-auto mt-2">
            <Activity className="h-3 w-3 mr-1" />
            Monitoring Module
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-700 font-medium mb-2">
              {getErrorMessage(error)}
            </p>
            <p className="text-sm text-gray-500">
              {getSuggestion(error)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={onRetry} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/monitoring')}
              className="w-full gap-2"
            >
              <Activity className="h-4 w-4" />
              Monitoring Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer text-gray-500">
                Debug Info (Development)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface MonitoringErrorBoundaryProps {
  children: ReactNode
  componentName?: string
}

export function MonitoringErrorBoundary({ 
  children, 
  componentName = 'Monitoring Component' 
}: MonitoringErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <MonitoringErrorFallback 
          error={null}
          onRetry={() => window.location.reload()}
        />
      }
      showDetails={false}
    >
      {children}
    </ErrorBoundary>
  )
}