var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Settings, Zap, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
export function ThingActions(_a) {
    var _this = this;
    var thing = _a.thing, actions = _a.actions;
    var _b = useState([]), executions = _b[0], setExecutions = _b[1];
    var _c = useState({}), isExecuting = _c[0], setIsExecuting = _c[1];
    var executeAction = function (actionName, input) { return __awaiter(_this, void 0, void 0, function () {
        var executionId, execution, delay_1, success, mockResult_1, mockError_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    executionId = "exec-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                    execution = {
                        id: executionId,
                        actionName: actionName,
                        input: input,
                        status: 'pending',
                        startTime: new Date().toISOString()
                    };
                    setExecutions(function (prev) { return __spreadArray([execution], prev, true); });
                    setIsExecuting(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[actionName] = true, _a)));
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Update to running
                    setExecutions(function (prev) { return prev.map(function (exec) {
                        return exec.id === executionId
                            ? __assign(__assign({}, exec), { status: 'running' }) : exec;
                    }); });
                    delay_1 = Math.random() * 3000 + 1000 // 1-4 seconds
                    ;
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })
                        // Simulate success/failure (90% success rate)
                    ];
                case 2:
                    _a.sent();
                    success = Math.random() > 0.1;
                    if (success) {
                        mockResult_1 = generateMockResult(actionName, input);
                        setExecutions(function (prev) { return prev.map(function (exec) {
                            return exec.id === executionId
                                ? __assign(__assign({}, exec), { status: 'completed', endTime: new Date().toISOString(), result: mockResult_1 }) : exec;
                        }); });
                        toast.success("Action \"".concat(actionName, "\" completed successfully"));
                    }
                    else {
                        mockError_1 = "Action failed: ".concat(['Network timeout', 'Device unavailable', 'Invalid parameters'][Math.floor(Math.random() * 3)]);
                        setExecutions(function (prev) { return prev.map(function (exec) {
                            return exec.id === executionId
                                ? __assign(__assign({}, exec), { status: 'failed', endTime: new Date().toISOString(), error: mockError_1 }) : exec;
                        }); });
                        toast.error("Action \"".concat(actionName, "\" failed: ").concat(mockError_1));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    setExecutions(function (prev) { return prev.map(function (exec) {
                        return exec.id === executionId
                            ? __assign(__assign({}, exec), { status: 'failed', endTime: new Date().toISOString(), error: error_1 instanceof Error ? error_1.message : 'Unknown error' }) : exec;
                    }); });
                    toast.error("Action \"".concat(actionName, "\" failed"));
                    return [3 /*break*/, 5];
                case 4:
                    setIsExecuting(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[actionName] = false, _a)));
                    });
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var generateMockResult = function (actionName, input) {
        // Generate realistic mock results based on action name and input
        if (actionName.toLowerCase().includes('coffee') || actionName.toLowerCase().includes('drink')) {
            return {
                status: 'brewing',
                estimatedTime: '3 minutes',
                taskId: "task-".concat(Math.random().toString(36).substr(2, 9))
            };
        }
        if (actionName.toLowerCase().includes('calculate')) {
            return {
                result: Math.random() * 100,
                operation: 'completed',
                precision: 2
            };
        }
        if (actionName.toLowerCase().includes('move') || actionName.toLowerCase().includes('position')) {
            return {
                position: { x: Math.random() * 100, y: Math.random() * 100 },
                status: 'moved'
            };
        }
        return {
            status: 'completed',
            timestamp: new Date().toISOString(),
            actionId: Math.random().toString(36).substr(2, 9)
        };
    };
    var getActionIcon = function (action) {
        var _a;
        var title = ((_a = action.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        if (title.includes('play') || title.includes('start')) {
            return _jsx(Play, { className: "h-4 w-4" });
        }
        if (title.includes('config') || title.includes('set')) {
            return _jsx(Settings, { className: "h-4 w-4" });
        }
        return _jsx(Zap, { className: "h-4 w-4" });
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'pending':
                return _jsx(Clock, { className: "h-4 w-4 text-yellow-500" });
            case 'running':
                return _jsx(Clock, { className: "h-4 w-4 text-blue-500 animate-pulse" });
            case 'completed':
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case 'failed':
                return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
            default:
                return _jsx(AlertCircle, { className: "h-4 w-4 text-gray-500" });
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'running':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };
    if (actions.length === 0) {
        return (_jsx(Card, { children: _jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Play, { className: "h-5 w-5" }), "Actions"] }), _jsx(CardDescription, { children: "This Thing has no actions defined." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: ["Available Actions (", actions.length, ")"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: actions.map(function (_a) {
                            var name = _a[0], action = _a[1];
                            return (_jsx(ActionCard, { name: name, action: action, isExecuting: isExecuting[name] || false, onExecute: function (input) { return executeAction(name, input); } }, name));
                        }) })] }), executions.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Execution History" }), _jsx("div", { className: "space-y-2", children: executions.slice(0, 10).map(function (execution) { return (_jsxs(Card, { className: "p-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getStatusIcon(execution.status), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: execution.actionName }), _jsxs("div", { className: "text-xs text-gray-600 dark:text-gray-400", children: [new Date(execution.startTime).toLocaleString(), execution.endTime && (_jsxs("span", { children: [" - ", new Date(execution.endTime).toLocaleString()] }))] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(Badge, { variant: "outline", className: getStatusColor(execution.status), children: execution.status }) })] }), execution.result && (_jsxs("div", { className: "mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs", children: [_jsx("strong", { children: "Result:" }), " ", JSON.stringify(execution.result, null, 2)] })), execution.error && (_jsxs("div", { className: "mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-800 dark:text-red-300", children: [_jsx("strong", { children: "Error:" }), " ", execution.error] }))] }, execution.id)); }) })] }))] }));
}
function ActionCard(_a) {
    var _b;
    var name = _a.name, action = _a.action, isExecuting = _a.isExecuting, onExecute = _a.onExecute;
    var _c = useState({}), input = _c[0], setInput = _c[1];
    var _d = useState(false), isDialogOpen = _d[0], setIsDialogOpen = _d[1];
    var hasInput = action.input && (action.input.type === 'object' ||
        action.input.properties ||
        action.input.type);
    var handleQuickExecute = function () {
        if (hasInput) {
            setIsDialogOpen(true);
        }
        else {
            onExecute(null);
        }
    };
    var handleExecuteWithInput = function () {
        onExecute(input);
        setIsDialogOpen(false);
        setInput({});
    };
    var renderInputField = function (fieldName, fieldSchema) {
        var type = fieldSchema.type || 'string';
        switch (type) {
            case 'boolean':
                return (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { checked: input[fieldName] || false, onCheckedChange: function (checked) { return setInput(function (prev) {
                                var _a;
                                return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = checked, _a)));
                            }); } }), _jsx(Label, { children: fieldSchema.title || fieldName })] }));
            case 'number':
            case 'integer':
                return (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: fieldSchema.title || fieldName }), _jsx(Input, { type: "number", min: fieldSchema.minimum, max: fieldSchema.maximum, step: type === 'integer' ? 1 : 0.01, value: input[fieldName] || '', onChange: function (e) { return setInput(function (prev) {
                                var _a;
                                return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value), _a)));
                            }); }, placeholder: fieldSchema.description })] }));
            case 'string':
                if (fieldSchema.enum) {
                    return (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: fieldSchema.title || fieldName }), _jsxs(Select, { value: input[fieldName] || '', onValueChange: function (value) { return setInput(function (prev) {
                                    var _a;
                                    return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = value, _a)));
                                }); }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select an option" }) }), _jsx(SelectContent, { children: fieldSchema.enum.map(function (option) { return (_jsx(SelectItem, { value: option, children: option }, option)); }) })] })] }));
                }
                if (fieldSchema.maxLength && fieldSchema.maxLength > 100) {
                    return (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: fieldSchema.title || fieldName }), _jsx(Textarea, { value: input[fieldName] || '', onChange: function (e) { return setInput(function (prev) {
                                    var _a;
                                    return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = e.target.value, _a)));
                                }); }, placeholder: fieldSchema.description, maxLength: fieldSchema.maxLength })] }));
                }
                return (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: fieldSchema.title || fieldName }), _jsx(Input, { value: input[fieldName] || '', onChange: function (e) { return setInput(function (prev) {
                                var _a;
                                return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = e.target.value, _a)));
                            }); }, placeholder: fieldSchema.description, maxLength: fieldSchema.maxLength })] }));
            default:
                return (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: fieldSchema.title || fieldName }), _jsx(Input, { value: input[fieldName] || '', onChange: function (e) { return setInput(function (prev) {
                                var _a;
                                return (__assign(__assign({}, prev), (_a = {}, _a[fieldName] = e.target.value, _a)));
                            }); }, placeholder: fieldSchema.description })] }));
        }
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4" }), _jsx(CardTitle, { className: "text-sm font-medium", children: action.title || name })] }), action.description && (_jsx(CardDescription, { className: "text-xs", children: action.description }))] }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "space-y-1 text-xs text-gray-600 dark:text-gray-400", children: [hasInput && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Input Required:" }), _jsx("span", { className: "font-mono", children: "Yes" })] })), action.output && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Output:" }), _jsx("span", { className: "font-mono", children: action.output.type || 'any' })] })), action.safe !== undefined && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Safe:" }), _jsx("span", { className: "font-mono", children: action.safe ? 'Yes' : 'No' })] })), action.idempotent !== undefined && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Idempotent:" }), _jsx("span", { className: "font-mono", children: action.idempotent ? 'Yes' : 'No' })] }))] }), _jsx("div", { className: "pt-2", children: hasInput ? (_jsxs(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "w-full", disabled: isExecuting, size: "sm", children: [_jsx(Play, { className: "h-3 w-3 mr-2" }), isExecuting ? 'Executing...' : 'Execute'] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Execute ", action.title || name] }), _jsx(DialogDescription, { children: action.description || 'Configure the input parameters for this action.' })] }), _jsxs("div", { className: "space-y-4", children: [((_b = action.input) === null || _b === void 0 ? void 0 : _b.properties) && Object.entries(action.input.properties).map(function (_a) {
                                                    var fieldName = _a[0], fieldSchema = _a[1];
                                                    return (_jsx("div", { children: renderInputField(fieldName, fieldSchema) }, fieldName));
                                                }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: function () { return setIsDialogOpen(false); }, children: "Cancel" }), _jsxs(Button, { onClick: handleExecuteWithInput, disabled: isExecuting, children: [_jsx(Play, { className: "h-3 w-3 mr-2" }), "Execute"] })] })] })] })] })) : (_jsxs(Button, { className: "w-full", onClick: handleQuickExecute, disabled: isExecuting, size: "sm", children: [_jsx(Play, { className: "h-3 w-3 mr-2" }), isExecuting ? 'Executing...' : 'Execute'] })) })] })] }));
}
