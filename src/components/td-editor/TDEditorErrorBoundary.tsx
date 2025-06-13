import React from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, FileText, Lightbulb } from 'lucide-react'

interface TDEditorErrorFallbackProps {
  error?: Error
  onRetry?: () => void
}

function TDEditorErrorFallback({ error, onRetry }: TDEditorErrorFallbackProps) {
  const isJsonError = error?.message.includes('JSON') || error?.name === 'SyntaxError'
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg">
            {isJsonError ? 'JSON Syntax Error' : 'Editor Error'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          {isJsonError ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Invalid JSON detected:</p>
              <p className="text-sm text-muted-foreground font-mono">
                {error?.message || 'JSON parsing failed'}
              </p>
              <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Quick Fix Tips:</p>
                  <ul className="text-blue-700 mt-1 space-y-1 text-xs">
                    <li>• Check for missing quotation marks around property names</li>
                    <li>• Ensure all strings are properly quoted</li>
                    <li>• Remove trailing commas</li>
                    <li>• Match all opening and closing brackets/braces</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">An error occurred in the editor:</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || 'Unknown editor error'}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <FileText className="h-4 w-4 mr-2" />
            Refresh Editor
          </Button>
        </div>

        {isJsonError && (
          <div className="text-xs text-muted-foreground">
            <p>
              💡 The Thing Description editor will continue working once the JSON syntax is fixed.
              You can also use the Templates button to start with a valid example.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface TDEditorErrorBoundaryProps {
  children: React.ReactNode
}

export function TDEditorErrorBoundary({ children }: TDEditorErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <TDEditorErrorFallback 
          onRetry={() => window.location.reload()} 
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}