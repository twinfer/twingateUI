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
import { TDEditor } from '@/components/td-editor/TDEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/stores/uiStore';
import { useThingsStore } from '@/stores/thingsStore';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export function TDEditorPage() {
    var _this = this;
    var navigate = useNavigate();
    var showToast = useToast().showToast;
    var addThing = useThingsStore().addThing;
    var _a = useState(null), validationResult = _a[0], setValidationResult = _a[1];
    var handleSave = function (tdJson) { return __awaiter(_this, void 0, void 0, function () {
        var td, newThing;
        return __generator(this, function (_a) {
            try {
                td = JSON.parse(tdJson);
                newThing = {
                    id: td.id || "thing-".concat(Date.now()),
                    title: td.title || 'Untitled Thing',
                    description: td.description,
                    thingDescription: td,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    online: false,
                    status: 'unknown',
                    lastSeen: undefined,
                    discoveryMethod: 'manual',
                    properties: extractProperties(td),
                    actions: extractActions(td),
                    events: extractEvents(td),
                    tags: extractTags(td),
                    category: extractCategory(td)
                };
                addThing(newThing);
                showToast({
                    title: 'Thing Description Saved',
                    description: "\"".concat(newThing.title, "\" has been added to your Things"),
                    type: 'success'
                });
                // Navigate to Things page
                navigate('/things');
            }
            catch (error) {
                showToast({
                    title: 'Save Failed',
                    description: 'Failed to save Thing Description. Please check the JSON format.',
                    type: 'error'
                });
            }
            return [2 /*return*/];
        });
    }); };
    var handleValidate = function (result) {
        setValidationResult(result);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: function () { return navigate('/things'); }, children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Things"] }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Thing Description Editor" }), _jsx("p", { className: "text-muted-foreground", children: "Create and edit W3C Web of Things (WoT) Thing Descriptions" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5" }), "About Thing Descriptions"] }), _jsx(CardDescription, { children: "Thing Descriptions (TDs) are the core building blocks of the Web of Things. They provide a standardized way to describe IoT devices, their capabilities, and how to interact with them." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Properties" }), _jsx("p", { className: "text-muted-foreground", children: "Define readable/writable attributes of your Thing, like temperature or status." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Actions" }), _jsx("p", { className: "text-muted-foreground", children: "Specify operations that can be invoked on your Thing, like turning on/off." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Events" }), _jsx("p", { className: "text-muted-foreground", children: "Describe notifications your Thing can emit, like alarms or status changes." })] })] }) })] }), _jsx(TDEditor, { onSave: handleSave, onValidate: handleValidate, height: "500px" }), (validationResult === null || validationResult === void 0 ? void 0 : validationResult.isValid) && (_jsx(Card, { className: "border-green-200 bg-green-50", children: _jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [_jsx(Save, { className: "h-5 w-5 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-green-800", children: "Thing Description is valid!" }), _jsx("p", { className: "text-xs text-green-600", children: "Click the Save button in the editor to add this Thing to your collection." })] })] }) }))] }));
}
// Helper functions to extract TD components
function extractProperties(td) {
    if (!td.properties)
        return [];
    return Object.entries(td.properties).map(function (_a) {
        var key = _a[0], prop = _a[1];
        return ({
            id: key,
            name: prop.title || key,
            type: prop.type || 'unknown',
            value: null,
            lastUpdated: new Date().toISOString(),
            writable: prop.writeOnly !== true,
            observable: prop.observable === true,
        });
    });
}
function extractActions(td) {
    if (!td.actions)
        return [];
    return Object.entries(td.actions).map(function (_a) {
        var key = _a[0], action = _a[1];
        return ({
            id: key,
            name: action.title || key,
            input: action.input,
            output: action.output,
            description: action.description,
        });
    });
}
function extractEvents(td) {
    if (!td.events)
        return [];
    return Object.entries(td.events).map(function (_a) {
        var key = _a[0], event = _a[1];
        return ({
            id: key,
            name: event.title || key,
            data: event.data,
            description: event.description,
        });
    });
}
function extractTags(td) {
    var tags = [];
    if (td['@type']) {
        var types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']];
        tags.push.apply(tags, types.filter(function (type) { return typeof type === 'string'; }));
    }
    if (td.securityDefinitions) {
        Object.keys(td.securityDefinitions).forEach(function (scheme) {
            tags.push("security:".concat(scheme));
        });
    }
    return tags;
}
function extractCategory(td) {
    if (td['@type']) {
        var types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']];
        for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
            var type = types_1[_i];
            if (typeof type === 'string') {
                if (type.includes('Sensor'))
                    return 'sensor';
                if (type.includes('Actuator'))
                    return 'actuator';
                if (type.includes('Light'))
                    return 'lighting';
                if (type.includes('Thermostat') || type.includes('Temperature'))
                    return 'climate';
                if (type.includes('Camera') || type.includes('Video'))
                    return 'security';
                if (type.includes('Motor') || type.includes('Pump'))
                    return 'actuator';
            }
        }
    }
    return 'other';
}
