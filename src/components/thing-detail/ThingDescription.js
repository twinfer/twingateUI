var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Code, Copy, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { tdValidationService } from '@/services/tdValidationService';
export function ThingDescription(_a) {
    var _this = this;
    var thing = _a.thing;
    var _b = useState(true), showFormatted = _b[0], setShowFormatted = _b[1];
    var _c = useState(null), validationResult = _c[0], setValidationResult = _c[1];
    var _d = useState(false), isValidating = _d[0], setIsValidating = _d[1];
    var thingDescription = thing.thingDescription || {};
    var tdJson = JSON.stringify(thingDescription, null, showFormatted ? 2 : 0);
    var copyToClipboard = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(tdJson)];
                case 1:
                    _a.sent();
                    toast.success('Thing Description copied to clipboard');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    toast.error('Failed to copy to clipboard');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var downloadTD = function () {
        var blob = new Blob([tdJson], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "".concat(thing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase(), "-td.json");
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Thing Description downloaded');
    };
    var validateTD = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsValidating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, tdValidationService.validateTD(thingDescription)];
                case 2:
                    result = _a.sent();
                    setValidationResult(result);
                    if (result.isValid) {
                        toast.success('Thing Description is valid');
                    }
                    else {
                        toast.error("Thing Description has ".concat(result.errors.length, " error(s)"));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    toast.error('Validation failed');
                    setValidationResult({
                        isValid: false,
                        errors: [{ message: 'Validation service error', severity: 'critical' }],
                        warnings: [],
                        details: {}
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsValidating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getValidationIcon = function () {
        if (!validationResult)
            return null;
        if (validationResult.isValid) {
            return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
        }
        else {
            return _jsx(AlertCircle, { className: "h-4 w-4 text-red-500" });
        }
    };
    var getValidationBadge = function () {
        if (!validationResult)
            return null;
        if (validationResult.isValid) {
            return (_jsx(Badge, { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", children: "Valid TD" }));
        }
        else {
            return (_jsxs(Badge, { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", children: [validationResult.errors.length, " Error(s)"] }));
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Code, { className: "h-5 w-5" }), "Thing Description JSON"] }), _jsx(CardDescription, { children: "Raw Thing Description document in W3C WoT format" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getValidationBadge(), _jsxs(Button, { onClick: validateTD, disabled: isValidating, variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "h-3 w-3 mr-2 ".concat(isValidating ? 'animate-spin' : '') }), "Validate"] }), _jsxs(Button, { onClick: copyToClipboard, variant: "outline", size: "sm", children: [_jsx(Copy, { className: "h-3 w-3 mr-2" }), "Copy"] }), _jsxs(Button, { onClick: downloadTD, variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-3 w-3 mr-2" }), "Download"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { checked: showFormatted, onCheckedChange: setShowFormatted, id: "format-toggle" }), _jsx(Label, { htmlFor: "format-toggle", className: "text-sm", children: "Pretty print (formatted JSON)" })] }) })] }), validationResult && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [getValidationIcon(), "Validation Results"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-lg text-gray-900 dark:text-gray-100", children: validationResult.errors.length }), _jsx("div", { className: "text-gray-600 dark:text-gray-400", children: "Errors" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-lg text-gray-900 dark:text-gray-100", children: validationResult.warnings.length }), _jsx("div", { className: "text-gray-600 dark:text-gray-400", children: "Warnings" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-lg text-gray-900 dark:text-gray-100", children: validationResult.details.contextValid ? '✓' : '✗' }), _jsx("div", { className: "text-gray-600 dark:text-gray-400", children: "Context" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-lg text-gray-900 dark:text-gray-100", children: validationResult.details.schemaValid ? '✓' : '✗' }), _jsx("div", { className: "text-gray-600 dark:text-gray-400", children: "Schema" })] })] }), validationResult.errors.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-red-800 dark:text-red-300", children: "Errors" }), _jsx("div", { className: "space-y-1", children: validationResult.errors.map(function (error, index) { return (_jsx("div", { className: "p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "text-red-800 dark:text-red-300", children: error.message }), error.path && (_jsxs("div", { className: "text-red-600 dark:text-red-400 text-xs font-mono", children: ["Path: ", error.path] })), error.line && (_jsxs("div", { className: "text-red-600 dark:text-red-400 text-xs", children: ["Line: ", error.line, error.column && ", Column: ".concat(error.column)] }))] })] }) }, index)); }) })] })), validationResult.warnings.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-yellow-800 dark:text-yellow-300", children: "Warnings" }), _jsx("div", { className: "space-y-1", children: validationResult.warnings.map(function (warning, index) { return (_jsx("div", { className: "p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "text-yellow-800 dark:text-yellow-300", children: warning.message }), warning.path && (_jsxs("div", { className: "text-yellow-600 dark:text-yellow-400 text-xs font-mono", children: ["Path: ", warning.path] }))] })] }) }, index)); }) })] })), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-gray-800 dark:text-gray-300", children: "Validation Details" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Context Valid:" }), _jsx("span", { className: validationResult.details.contextValid ? 'text-green-600' : 'text-red-600', children: validationResult.details.contextValid ? 'Yes' : 'No' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Required Fields:" }), _jsx("span", { className: validationResult.details.requiredFieldsPresent ? 'text-green-600' : 'text-red-600', children: validationResult.details.requiredFieldsPresent ? 'Yes' : 'No' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Schema Valid:" }), _jsx("span", { className: validationResult.details.schemaValid ? 'text-green-600' : 'text-red-600', children: validationResult.details.schemaValid ? 'Yes' : 'No' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Security Valid:" }), _jsx("span", { className: validationResult.details.securityValid ? 'text-green-600' : 'text-red-600', children: validationResult.details.securityValid ? 'Yes' : 'No' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Links Valid:" }), _jsx("span", { className: validationResult.details.linksValid ? 'text-green-600' : 'text-red-600', children: validationResult.details.linksValid ? 'Yes' : 'No' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Forms Valid:" }), _jsx("span", { className: validationResult.details.formsValid ? 'text-green-600' : 'text-red-600', children: validationResult.details.formsValid ? 'Yes' : 'No' })] })] })] })] })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-base", children: "JSON Content" }), _jsxs(CardDescription, { children: [Object.keys(thingDescription).length, " top-level properties \u2022 ", tdJson.length, " characters"] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "relative", children: [_jsx(Textarea, { value: tdJson, readOnly: true, className: "font-mono text-sm resize-none min-h-96 max-h-screen", style: {
                                        whiteSpace: showFormatted ? 'pre' : 'pre-wrap',
                                        wordBreak: 'break-all'
                                    } }), _jsx("div", { className: "absolute top-2 right-2", children: _jsx(Button, { onClick: copyToClipboard, variant: "ghost", size: "sm", className: "h-6 w-6 p-0", children: _jsx(Copy, { className: "h-3 w-3" }) }) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "Statistics" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-lg text-gray-900 dark:text-gray-100", children: thingDescription.properties ? Object.keys(thingDescription.properties).length : 0 }), _jsx("div", { className: "text-gray-600 dark:text-gray-400", children: "Properties" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-lg text-gray-900 dark:text-gray-100", children: thingDescription.actions ? Object.keys(thingDescription.actions).length : 0 }), _jsx("div", { className: "text-gray-600 dark:text-gray-400", children: "Actions" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-lg text-gray-900 dark:text-gray-100", children: thingDescription.events ? Object.keys(thingDescription.events).length : 0 }), _jsx("div", { className: "text-gray-600 dark:text-gray-400", children: "Events" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-lg text-gray-900 dark:text-gray-100", children: thingDescription.securityDefinitions ? Object.keys(thingDescription.securityDefinitions).length : 0 }), _jsx("div", { className: "text-gray-600 dark:text-gray-400", children: "Security Schemes" })] })] }) })] })] }));
}
