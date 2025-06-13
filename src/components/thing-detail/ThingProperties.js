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
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Activity, RefreshCw, Eye, EyeOff, Thermometer, Gauge, Zap, BarChart3 } from 'lucide-react';
export function ThingProperties(_a) {
    var _this = this;
    var thing = _a.thing, properties = _a.properties;
    var _b = useState({}), monitoring = _b[0], setMonitoring = _b[1];
    var _c = useState(false), isRefreshing = _c[0], setIsRefreshing = _c[1];
    // Initialize monitoring state
    useEffect(function () {
        var initialMonitoring = {};
        properties.forEach(function (_a) {
            var name = _a[0];
            initialMonitoring[name] = {
                enabled: false,
                lastValue: null,
                history: []
            };
        });
        setMonitoring(initialMonitoring);
    }, [properties]);
    // Mock real-time property updates
    useEffect(function () {
        var interval = setInterval(function () {
            setMonitoring(function (prev) {
                var updated = __assign({}, prev);
                Object.keys(updated).forEach(function (propertyName) {
                    var _a;
                    if (updated[propertyName].enabled) {
                        var property = (_a = properties.find(function (_a) {
                            var name = _a[0];
                            return name === propertyName;
                        })) === null || _a === void 0 ? void 0 : _a[1];
                        if (property) {
                            var mockValue = generateMockValue(property);
                            var newValue = {
                                value: mockValue,
                                timestamp: new Date().toISOString(),
                                quality: 'good'
                            };
                            updated[propertyName].lastValue = newValue;
                            updated[propertyName].history = __spreadArray(__spreadArray([], updated[propertyName].history.slice(-29), true), [
                                newValue
                            ], false);
                        }
                    }
                });
                return updated;
            });
        }, 2000); // Update every 2 seconds
        return function () { return clearInterval(interval); };
    }, [properties]);
    var generateMockValue = function (property) {
        var type = property.type || 'string';
        switch (type) {
            case 'number':
            case 'integer':
                var min = property.minimum || 0;
                var max = property.maximum || 100;
                return Math.round((Math.random() * (max - min) + min) * 100) / 100;
            case 'boolean':
                return Math.random() > 0.5;
            case 'string':
                if (property.enum) {
                    return property.enum[Math.floor(Math.random() * property.enum.length)];
                }
                return "value-".concat(Math.floor(Math.random() * 1000));
            default:
                return Math.floor(Math.random() * 100);
        }
    };
    var toggleMonitoring = function (propertyName) {
        setMonitoring(function (prev) {
            var _a;
            var _b;
            return (__assign(__assign({}, prev), (_a = {}, _a[propertyName] = __assign(__assign({}, prev[propertyName]), { enabled: !((_b = prev[propertyName]) === null || _b === void 0 ? void 0 : _b.enabled) }), _a)));
        });
    };
    var refreshProperty = function (propertyName) { return __awaiter(_this, void 0, void 0, function () {
        var property, mockValue, newValue_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsRefreshing(true);
                    // Simulate API call delay
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 1:
                    // Simulate API call delay
                    _b.sent();
                    property = (_a = properties.find(function (_a) {
                        var name = _a[0];
                        return name === propertyName;
                    })) === null || _a === void 0 ? void 0 : _a[1];
                    if (property) {
                        mockValue = generateMockValue(property);
                        newValue_1 = {
                            value: mockValue,
                            timestamp: new Date().toISOString(),
                            quality: 'good'
                        };
                        setMonitoring(function (prev) {
                            var _a;
                            var _b;
                            return (__assign(__assign({}, prev), (_a = {}, _a[propertyName] = __assign(__assign({}, prev[propertyName]), { lastValue: newValue_1, history: __spreadArray(__spreadArray([], (((_b = prev[propertyName]) === null || _b === void 0 ? void 0 : _b.history) || []).slice(-29), true), [
                                    newValue_1
                                ], false) }), _a)));
                        });
                    }
                    setIsRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var getPropertyIcon = function (property) {
        var _a;
        var type = property.type || 'string';
        var unit = property.unit || '';
        if (unit.includes('celsius') || unit.includes('fahrenheit') || ((_a = property.title) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('temperature'))) {
            return _jsx(Thermometer, { className: "h-4 w-4" });
        }
        if (unit.includes('percent') || unit.includes('%')) {
            return _jsx(BarChart3, { className: "h-4 w-4" });
        }
        if (type === 'boolean') {
            return _jsx(Zap, { className: "h-4 w-4" });
        }
        if (type === 'number' || type === 'integer') {
            return _jsx(Gauge, { className: "h-4 w-4" });
        }
        return _jsx(Activity, { className: "h-4 w-4" });
    };
    var formatValue = function (value, property) {
        if (value === null || value === undefined)
            return 'N/A';
        var type = property.type || 'string';
        var unit = property.unit || '';
        if (type === 'number' || type === 'integer') {
            var formatted = typeof value === 'number' ? value.toFixed(2) : value;
            return unit ? "".concat(formatted, " ").concat(unit) : formatted;
        }
        if (type === 'boolean') {
            return value ? 'ON' : 'OFF';
        }
        return String(value);
    };
    var getValueBadgeColor = function (property, value) {
        var type = property.type || 'string';
        if (type === 'boolean') {
            return value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
        if (type === 'number' || type === 'integer') {
            var min = property.minimum;
            var max = property.maximum;
            if (min !== undefined && max !== undefined) {
                var percent = ((value - min) / (max - min)) * 100;
                if (percent < 25)
                    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
                if (percent < 50)
                    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
                if (percent < 75)
                    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            }
        }
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    };
    if (properties.length === 0) {
        return (_jsx(Card, { children: _jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5" }), "Properties"] }), _jsx(CardDescription, { children: "This Thing has no properties defined." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: ["Properties (", properties.length, ")"] }), _jsx("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Real-time monitoring available" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: properties.map(function (_a) {
                    var name = _a[0], property = _a[1];
                    var monitor = monitoring[name];
                    var isMonitoring = (monitor === null || monitor === void 0 ? void 0 : monitor.enabled) || false;
                    var lastValue = monitor === null || monitor === void 0 ? void 0 : monitor.lastValue;
                    return (_jsxs(Card, { className: "relative", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getPropertyIcon(property), _jsx(CardTitle, { className: "text-sm font-medium truncate", children: property.title || name })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: function () { return refreshProperty(name); }, disabled: isRefreshing, children: _jsx(RefreshCw, { className: "h-3 w-3 ".concat(isRefreshing ? 'animate-spin' : '') }) }), _jsxs("div", { className: "flex items-center gap-1", children: [isMonitoring ? (_jsx(Eye, { className: "h-3 w-3 text-green-500" })) : (_jsx(EyeOff, { className: "h-3 w-3 text-gray-400" })), _jsx(Switch, { checked: isMonitoring, onCheckedChange: function () { return toggleMonitoring(name); }, size: "sm" })] })] })] }), property.description && (_jsx(CardDescription, { className: "text-xs", children: property.description }))] }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: "Current Value" }), lastValue && (_jsx("span", { className: "text-xs text-gray-500", children: new Date(lastValue.timestamp).toLocaleTimeString() }))] }), _jsx(Badge, { variant: "outline", className: "w-full justify-center ".concat(getValueBadgeColor(property, lastValue === null || lastValue === void 0 ? void 0 : lastValue.value)), children: lastValue ? formatValue(lastValue.value, property) : 'No data' })] }), (property.type === 'number' || property.type === 'integer') &&
                                        property.minimum !== undefined && property.maximum !== undefined && lastValue && (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs text-gray-600 dark:text-gray-400", children: [_jsx("span", { children: property.minimum }), _jsx("span", { children: property.maximum })] }), _jsx(Progress, { value: ((lastValue.value - property.minimum) / (property.maximum - property.minimum)) * 100, className: "h-2" })] })), _jsxs("div", { className: "space-y-1 text-xs text-gray-600 dark:text-gray-400", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Type:" }), _jsx("span", { className: "font-mono", children: property.type || 'any' })] }), property.unit && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Unit:" }), _jsx("span", { className: "font-mono", children: property.unit })] })), property.readOnly && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Access:" }), _jsx("span", { className: "font-mono", children: "Read-only" })] })), property.observable && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Observable:" }), _jsx("span", { className: "font-mono", children: "Yes" })] }))] }), isMonitoring && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-green-600 dark:text-green-400", children: [_jsx(Activity, { className: "h-3 w-3 animate-pulse" }), _jsx("span", { children: "Live monitoring" })] }))] })] }, name));
                }) })] }));
}
