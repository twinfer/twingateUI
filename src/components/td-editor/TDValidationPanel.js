import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, RefreshCw, Shield, Link, FileText, Settings, Code, AlertTriangle } from 'lucide-react';
export function TDValidationPanel(_a) {
    var validationResult = _a.validationResult, isValidating = _a.isValidating;
    if (isValidating) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }), "Validating..."] }) }), _jsxs(CardContent, { children: [_jsx(Progress, { value: undefined, className: "h-2" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Checking Thing Description against W3C WoT standards..." })] })] }));
    }
    if (!validationResult) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Validation Status"] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-sm text-muted-foreground", children: "Start typing to see validation results" }) })] }));
    }
    var getDetailIcon = function (isValid) {
        return isValid ? _jsx(CheckCircle, { className: "h-3 w-3 text-green-500" }) : _jsx(XCircle, { className: "h-3 w-3 text-red-500" });
    };
    var validationScore = calculateValidationScore(validationResult);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [validationResult.isValid ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(XCircle, { className: "h-4 w-4 text-red-500" })), "Validation Result"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Overall Score" }), _jsxs(Badge, { variant: validationScore >= 80 ? 'default' : validationScore >= 60 ? 'secondary' : 'destructive', children: [validationScore, "%"] })] }), _jsx(Progress, { value: validationScore, className: "h-2" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(XCircle, { className: "h-3 w-3 text-red-500" }), _jsxs("span", { children: [validationResult.errors.length, " errors"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "h-3 w-3 text-yellow-500" }), _jsxs("span", { children: [validationResult.warnings.length, " warnings"] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm", children: "Validation Details" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-3 w-3" }), _jsx("span", { children: "Context" })] }), getDetailIcon(validationResult.details.contextValid)] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Settings, { className: "h-3 w-3" }), _jsx("span", { children: "Required Fields" })] }), getDetailIcon(validationResult.details.requiredFieldsPresent)] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Code, { className: "h-3 w-3" }), _jsx("span", { children: "Schema" })] }), getDetailIcon(validationResult.details.schemaValid)] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-3 w-3" }), _jsx("span", { children: "Assertions" })] }), getDetailIcon(validationResult.details.assertionsValid)] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-3 w-3" }), _jsx("span", { children: "Security" })] }), getDetailIcon(validationResult.details.securityValid)] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Link, { className: "h-3 w-3" }), _jsx("span", { children: "Links" })] }), getDetailIcon(validationResult.details.linksValid)] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-3 w-3" }), _jsx("span", { children: "Forms" })] }), getDetailIcon(validationResult.details.formsValid)] })] }) })] }), validationResult.errors.length > 0 && (_jsxs(Card, { className: "border-red-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2 text-red-800", children: [_jsx(XCircle, { className: "h-4 w-4" }), "Errors (", validationResult.errors.length, ")"] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-32", children: _jsx("div", { className: "space-y-2", children: validationResult.errors.map(function (error, idx) { return (_jsx("div", { className: "text-xs", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Badge, { variant: "destructive", className: "text-xs", children: error.severity }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-red-800", children: error.message }), error.path && (_jsx("div", { className: "text-red-600 font-mono", children: error.path })), (error.line || error.column) && (_jsxs("div", { className: "text-red-500", children: ["Line ", error.line, ", Column ", error.column] }))] })] }) }, idx)); }) }) }) })] })), validationResult.warnings.length > 0 && (_jsxs(Card, { className: "border-yellow-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2 text-yellow-800", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), "Warnings (", validationResult.warnings.length, ")"] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-32", children: _jsx("div", { className: "space-y-2", children: validationResult.warnings.map(function (warning, idx) { return (_jsx("div", { className: "text-xs", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: warning.type }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-yellow-800", children: warning.message }), warning.path && (_jsx("div", { className: "text-yellow-600 font-mono", children: warning.path })), (warning.line || warning.column) && (_jsxs("div", { className: "text-yellow-500", children: ["Line ", warning.line, ", Column ", warning.column] }))] })] }) }, idx)); }) }) }) })] }))] }));
}
function calculateValidationScore(result) {
    if (!result)
        return 0;
    var details = result.details;
    var maxPoints = 7; // Number of validation categories
    var points = 0;
    if (details.contextValid)
        points++;
    if (details.requiredFieldsPresent)
        points++;
    if (details.schemaValid)
        points++;
    if (details.assertionsValid)
        points++;
    if (details.securityValid)
        points++;
    if (details.linksValid)
        points++;
    if (details.formsValid)
        points++;
    // Deduct points for errors and warnings
    var errorPenalty = Math.min(result.errors.length * 10, 30);
    var warningPenalty = Math.min(result.warnings.length * 5, 20);
    var baseScore = (points / maxPoints) * 100;
    var finalScore = Math.max(0, baseScore - errorPenalty - warningPenalty);
    return Math.round(finalScore);
}
