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
import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, Save, Download, Upload, RefreshCw, Lightbulb } from 'lucide-react';
import { tdValidationService } from '@/services/tdValidationService';
import { TDTemplateSelector } from './TDTemplateSelector';
import { TDValidationPanel } from './TDValidationPanel';
import { useToast } from '@/stores/uiStore';
export function TDEditor(_a) {
    var _this = this;
    var _b = _a.initialValue, initialValue = _b === void 0 ? '' : _b, onSave = _a.onSave, onValidate = _a.onValidate, _c = _a.readonly, readonly = _c === void 0 ? false : _c, _d = _a.height, height = _d === void 0 ? '600px' : _d;
    var _e = useState(initialValue || getDefaultTD()), value = _e[0], setValue = _e[1];
    var _f = useState(null), validationResult = _f[0], setValidationResult = _f[1];
    var _g = useState(false), isValidating = _g[0], setIsValidating = _g[1];
    var _h = useState(!initialValue), showTemplates = _h[0], setShowTemplates = _h[1];
    var editorRef = useRef(null);
    var showToast = useToast().showToast;
    useEffect(function () {
        if (initialValue && initialValue !== value) {
            setValue(initialValue);
        }
    }, [initialValue]);
    useEffect(function () {
        // Auto-validate after changes (debounced)
        var timeoutId = setTimeout(function () {
            if (value.trim()) {
                validateTD();
            }
        }, 1000);
        return function () { return clearTimeout(timeoutId); };
    }, [value]);
    var handleEditorDidMount = function (editor) {
        editorRef.current = editor;
        // Configure editor
        editor.updateOptions({
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true
        });
        // Add custom actions
        editor.addAction({
            id: 'validate-td',
            label: 'Validate Thing Description',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR],
            run: function () { return validateTD(); }
        });
        editor.addAction({
            id: 'format-json',
            label: 'Format JSON',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
            run: function () { return formatJSON(); }
        });
        // Set JSON schema for validation
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [{
                    uri: 'http://json-schema.org/draft-07/schema#',
                    fileMatch: ['*'],
                    schema: {
                        type: 'object',
                        properties: {
                            '@context': {
                                oneOf: [
                                    { type: 'string' },
                                    { type: 'array', items: { type: 'string' } }
                                ]
                            },
                            '@type': {
                                oneOf: [
                                    { type: 'string' },
                                    { type: 'array', items: { type: 'string' } }
                                ]
                            },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            properties: { type: 'object' },
                            actions: { type: 'object' },
                            events: { type: 'object' },
                            securityDefinitions: { type: 'object' },
                            security: {
                                oneOf: [
                                    { type: 'string' },
                                    { type: 'array', items: { type: 'string' } }
                                ]
                            }
                        },
                        required: ['@context', 'title']
                    }
                }]
        });
    };
    var validateTD = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, model, markers_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!value.trim())
                        return [2 /*return*/];
                    setIsValidating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, tdValidationService.validateTD(value)];
                case 2:
                    result = _a.sent();
                    setValidationResult(result);
                    onValidate === null || onValidate === void 0 ? void 0 : onValidate(result);
                    // Update editor markers
                    if (editorRef.current) {
                        model = editorRef.current.getModel();
                        if (model) {
                            markers_1 = result.errors.map(function (error) { return ({
                                severity: monaco.MarkerSeverity.Error,
                                startLineNumber: error.line || 1,
                                startColumn: error.column || 1,
                                endLineNumber: error.line || 1,
                                endColumn: (error.column || 1) + 10,
                                message: error.message
                            }); });
                            result.warnings.forEach(function (warning) {
                                markers_1.push({
                                    severity: monaco.MarkerSeverity.Warning,
                                    startLineNumber: warning.line || 1,
                                    startColumn: warning.column || 1,
                                    endLineNumber: warning.line || 1,
                                    endColumn: (warning.column || 1) + 10,
                                    message: warning.message
                                });
                            });
                            monaco.editor.setModelMarkers(model, 'td-validation', markers_1);
                        }
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    showToast({
                        title: 'Validation Error',
                        description: error_1 instanceof Error ? error_1.message : 'Unknown validation error',
                        type: 'error'
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsValidating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var formatJSON = function () {
        var _a;
        if (editorRef.current) {
            (_a = editorRef.current.getAction('editor.action.formatDocument')) === null || _a === void 0 ? void 0 : _a.run();
        }
    };
    var handleSave = function () {
        if (onSave) {
            onSave(value);
            showToast({
                title: 'Thing Description Saved',
                description: 'Your Thing Description has been saved successfully',
                type: 'success'
            });
        }
    };
    var handleDownload = function () {
        try {
            var blob = new Blob([value], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'thing-description.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast({
                title: 'Download Started',
                description: 'Thing Description file download started',
                type: 'success'
            });
        }
        catch (error) {
            showToast({
                title: 'Download Failed',
                description: 'Failed to download Thing Description',
                type: 'error'
            });
        }
    };
    var handleUpload = function () {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function (e) {
            var _a;
            var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var _a;
                    var content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                    try {
                        // Validate JSON
                        JSON.parse(content);
                        setValue(content);
                        setShowTemplates(false);
                        showToast({
                            title: 'File Loaded',
                            description: 'Thing Description loaded successfully',
                            type: 'success'
                        });
                    }
                    catch (error) {
                        showToast({
                            title: 'Invalid JSON',
                            description: 'The uploaded file contains invalid JSON',
                            type: 'error'
                        });
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };
    var handleTemplateSelect = function (template) {
        setValue(JSON.stringify(template.template, null, 2));
        setShowTemplates(false);
        showToast({
            title: 'Template Applied',
            description: "".concat(template.name, " template loaded"),
            type: 'success'
        });
    };
    var getValidationIcon = function () {
        if (isValidating)
            return _jsx(RefreshCw, { className: "h-4 w-4 animate-spin" });
        if (!validationResult)
            return _jsx(FileText, { className: "h-4 w-4" });
        if (validationResult.isValid)
            return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
        return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
    };
    var getValidationBadge = function () {
        if (isValidating)
            return _jsx(Badge, { variant: "outline", children: "Validating..." });
        if (!validationResult)
            return _jsx(Badge, { variant: "secondary", children: "Not Validated" });
        if (validationResult.isValid) {
            return (_jsxs(Badge, { variant: "default", className: "bg-green-500", children: ["Valid ", validationResult.warnings.length > 0 && "(".concat(validationResult.warnings.length, " warnings)")] }));
        }
        return (_jsxs(Badge, { variant: "destructive", children: ["Invalid (", validationResult.errors.length, " errors)"] }));
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(Card, { children: _jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CardTitle, { className: "text-lg", children: "Thing Description Editor" }), getValidationIcon(), getValidationBadge()] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: function () { return setShowTemplates(true); }, children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Templates"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleUpload, children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Upload"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleDownload, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: validateTD, disabled: isValidating, children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2 ".concat(isValidating ? 'animate-spin' : '') }), "Validate"] }), onSave && (_jsxs(Button, { size: "sm", onClick: handleSave, disabled: readonly || !(validationResult === null || validationResult === void 0 ? void 0 : validationResult.isValid), children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save"] }))] })] }) }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsx("div", { className: "lg:col-span-2", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: _jsx(Editor, { height: height, defaultLanguage: "json", value: value, onChange: function (newValue) { return setValue(newValue || ''); }, onMount: handleEditorDidMount, options: {
                                        readOnly: readonly,
                                        theme: 'vs-dark',
                                        automaticLayout: true,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on'
                                    } }) }) }) }), _jsxs("div", { className: "space-y-4", children: [_jsx(TDValidationPanel, { validationResult: validationResult, isValidating: isValidating }), validationResult && (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [_jsx(Lightbulb, { className: "h-4 w-4" }), "Suggestions"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2 text-sm", children: tdValidationService.getSuggestions(JSON.parse(value || '{}')).map(function (suggestion, idx) { return (_jsxs("div", { className: "text-muted-foreground", children: ["\u2022 ", suggestion] }, idx)); }) }) })] }))] })] }), _jsx(TDTemplateSelector, { open: showTemplates, onOpenChange: setShowTemplates, onSelect: handleTemplateSelect })] }));
}
function getDefaultTD() {
    return JSON.stringify({
        "@context": [
            "https://www.w3.org/2019/wot/td/v1",
            { "@language": "en" }
        ],
        "@type": "Thing",
        "title": "My Thing",
        "description": "A simple Thing Description",
        "securityDefinitions": {
            "nosec_sc": { "scheme": "nosec" }
        },
        "security": ["nosec_sc"]
    }, null, 2);
}
