import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Shield,
  Link,
  FileText,
  Settings,
  Code,
  AlertTriangle
} from 'lucide-react'
import { ValidationResult } from '@/services/tdValidationService'

interface TDValidationPanelProps {
  validationResult: ValidationResult | null
  isValidating: boolean
}

export function TDValidationPanel({ validationResult, isValidating }: TDValidationPanelProps) {
  if (isValidating) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Validating...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={undefined} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Checking Thing Description against W3C WoT standards...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!validationResult) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start typing to see validation results
          </p>
        </CardContent>
      </Card>
    )
  }

  const getDetailIcon = (isValid: boolean) => {
    return isValid ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />
  }

  const validationScore = calculateValidationScore(validationResult)

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {validationResult.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            Validation Result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Overall Score</span>
            <Badge variant={validationScore >= 80 ? 'default' : validationScore >= 60 ? 'secondary' : 'destructive'}>
              {validationScore}%
            </Badge>
          </div>
          <Progress value={validationScore} className="h-2" />
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>{validationResult.errors.length} errors</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span>{validationResult.warnings.length} warnings</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Validation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>Context</span>
              </div>
              {getDetailIcon(validationResult.details.contextValid)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-3 w-3" />
                <span>Required Fields</span>
              </div>
              {getDetailIcon(validationResult.details.requiredFieldsPresent)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-3 w-3" />
                <span>Schema</span>
              </div>
              {getDetailIcon(validationResult.details.schemaValid)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Assertions</span>
              </div>
              {getDetailIcon(validationResult.details.assertionsValid)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Security</span>
              </div>
              {getDetailIcon(validationResult.details.securityValid)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link className="h-3 w-3" />
                <span>Links</span>
              </div>
              {getDetailIcon(validationResult.details.linksValid)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>Forms</span>
              </div>
              {getDetailIcon(validationResult.details.formsValid)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {validationResult.errors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              Errors ({validationResult.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {validationResult.errors.map((error, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive" className="text-xs">
                        {error.severity}
                      </Badge>
                      <div className="flex-1">
                        <div className="text-red-800">{error.message}</div>
                        {error.path && (
                          <div className="text-red-600 font-mono">
                            {error.path}
                          </div>
                        )}
                        {(error.line || error.column) && (
                          <div className="text-red-500">
                            Line {error.line}, Column {error.column}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              Warnings ({validationResult.warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {validationResult.warnings.map((warning, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">
                        {warning.type}
                      </Badge>
                      <div className="flex-1">
                        <div className="text-yellow-800">{warning.message}</div>
                        {warning.path && (
                          <div className="text-yellow-600 font-mono">
                            {warning.path}
                          </div>
                        )}
                        {(warning.line || warning.column) && (
                          <div className="text-yellow-500">
                            Line {warning.line}, Column {warning.column}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function calculateValidationScore(result: ValidationResult): number {
  if (!result) return 0

  const details = result.details
  const maxPoints = 7 // Number of validation categories
  let points = 0

  if (details.contextValid) points++
  if (details.requiredFieldsPresent) points++
  if (details.schemaValid) points++
  if (details.assertionsValid) points++
  if (details.securityValid) points++
  if (details.linksValid) points++
  if (details.formsValid) points++

  // Deduct points for errors and warnings
  const errorPenalty = Math.min(result.errors.length * 10, 30)
  const warningPenalty = Math.min(result.warnings.length * 5, 20)

  const baseScore = (points / maxPoints) * 100
  const finalScore = Math.max(0, baseScore - errorPenalty - warningPenalty)

  return Math.round(finalScore)
}