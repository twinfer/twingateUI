import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Copy,
  ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Report to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // reportError(error, errorInfo)
    }
  }

  private handleReload = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  private copyErrorToClipboard = () => {
    const errorText = `
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
    `.trim()

    navigator.clipboard.writeText(errorText).then(() => {
      alert('Error details copied to clipboard')
    })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback 
        error={this.state.error} 
        errorInfo={this.state.errorInfo}
        onReload={this.handleReload}
        onReset={this.handleReset}
        onCopyError={this.copyErrorToClipboard}
        showDetails={this.props.showDetails ?? process.env.NODE_ENV === 'development'}
      />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onReload: () => void
  onReset: () => void
  onCopyError: () => void
  showDetails: boolean
}

function ErrorFallback({ 
  error, 
  errorInfo, 
  onReload, 
  onReset, 
  onCopyError,
  showDetails 
}: ErrorFallbackProps) {
  const navigate = useNavigate()

  const getErrorType = (error: Error | null) => {
    if (!error) return 'Unknown Error'
    
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'Network Error'
    }
    if (error.message.includes('require is not defined')) {
      return 'Module Error'
    }
    if (error.name === 'TypeError') {
      return 'Type Error'
    }
    if (error.name === 'ReferenceError') {
      return 'Reference Error'
    }
    
    return error.name || 'Application Error'
  }

  const getErrorSeverity = (error: Error | null) => {
    if (!error) return 'medium'
    
    if (error.message.includes('ChunkLoadError')) return 'low'
    if (error.message.includes('require is not defined')) return 'medium'
    if (error.name === 'TypeError') return 'high'
    
    return 'medium'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const errorType = getErrorType(error)
  const severity = getErrorSeverity(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Something went wrong
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className={getSeverityColor(severity)}>
              {errorType}
            </Badge>
            <Badge variant="outline">
              {severity} severity
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              We're sorry, but an unexpected error occurred. Please try one of the options below.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onReset} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex-1 gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            <Button 
              variant="outline" 
              onClick={onReload}
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
          </div>

          {/* Error Details (Development/Debug) */}
          {showDetails && error && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Error Details
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyError}
                  className="gap-2"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Message:</p>
                  <code className="block p-2 bg-gray-100 rounded text-sm text-red-600">
                    {error.message}
                  </code>
                </div>
                
                {error.stack && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Stack Trace:</p>
                    <pre className="p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
                
                {errorInfo?.componentStack && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Component Stack:</p>
                    <pre className="p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-32">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help & Support */}
          <div className="border-t pt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              If this problem persists, please contact support or report an issue.
            </p>
            <div className="flex justify-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://github.com/anthropics/claude-code/issues', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                Report Issue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Wrapper component to use hooks
export function ErrorBoundary(props: Props) {
  return <ErrorBoundaryClass {...props} />
}

// Route Error Element Component
export function RouteErrorElement() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">Page Not Found</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            The page you're looking for doesn't exist or an error occurred while loading it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline"
              className="flex-1 gap-2"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="flex-1 gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}