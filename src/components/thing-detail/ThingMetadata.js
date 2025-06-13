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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink, Shield, Link, Globe, Calendar, FileText } from 'lucide-react';
export function ThingMetadata(_a) {
    var thing = _a.thing;
    var td = thing.thingDescription;
    var formatDate = function (dateString) {
        if (!dateString)
            return 'Not specified';
        try {
            return new Date(dateString).toLocaleString();
        }
        catch (_a) {
            return dateString;
        }
    };
    var formatVersion = function (version) {
        if (!version)
            return 'Not specified';
        if (typeof version === 'object') {
            return JSON.stringify(version);
        }
        return String(version);
    };
    var getSecuritySchemes = function () {
        if (!(td === null || td === void 0 ? void 0 : td.securityDefinitions))
            return [];
        return Object.entries(td.securityDefinitions).map(function (_a) {
            var name = _a[0], scheme = _a[1];
            return (__assign({ name: name }, scheme));
        });
    };
    var getLinks = function () {
        if (!(td === null || td === void 0 ? void 0 : td.links))
            return [];
        return Array.isArray(td.links) ? td.links : [td.links];
    };
    var getForms = function () {
        var forms = [];
        // Collect forms from properties
        if (td === null || td === void 0 ? void 0 : td.properties) {
            Object.entries(td.properties).forEach(function (_a) {
                var name = _a[0], prop = _a[1];
                if (prop.forms) {
                    prop.forms.forEach(function (form) {
                        forms.push(__assign(__assign({}, form), { source: 'property', sourceName: name }));
                    });
                }
            });
        }
        // Collect forms from actions
        if (td === null || td === void 0 ? void 0 : td.actions) {
            Object.entries(td.actions).forEach(function (_a) {
                var name = _a[0], action = _a[1];
                if (action.forms) {
                    action.forms.forEach(function (form) {
                        forms.push(__assign(__assign({}, form), { source: 'action', sourceName: name }));
                    });
                }
            });
        }
        // Collect forms from events
        if (td === null || td === void 0 ? void 0 : td.events) {
            Object.entries(td.events).forEach(function (_a) {
                var name = _a[0], event = _a[1];
                if (event.forms) {
                    event.forms.forEach(function (form) {
                        forms.push(__assign(__assign({}, form), { source: 'event', sourceName: name }));
                    });
                }
            });
        }
        return forms;
    };
    var securitySchemes = getSecuritySchemes();
    var links = getLinks();
    var forms = getForms();
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Info, { className: "h-5 w-5" }), "Basic Information"] }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Title" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: (td === null || td === void 0 ? void 0 : td.title) || 'Not specified' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Description" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: (td === null || td === void 0 ? void 0 : td.description) || 'Not specified' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "ID" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100 font-mono break-all", children: (td === null || td === void 0 ? void 0 : td.id) || (td === null || td === void 0 ? void 0 : td['@id']) || thing.id })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Type" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: (td === null || td === void 0 ? void 0 : td['@type']) ? (Array.isArray(td['@type']) ? (td['@type'].map(function (type, index) { return (_jsx(Badge, { variant: "outline", className: "text-xs", children: type }, index)); })) : (_jsx(Badge, { variant: "outline", className: "text-xs", children: td['@type'] }))) : (_jsx("span", { className: "text-sm text-gray-500", children: "Not specified" })) })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Version" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: formatVersion(td === null || td === void 0 ? void 0 : td.version) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Created" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: formatDate(td === null || td === void 0 ? void 0 : td.created) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Modified" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: formatDate(td === null || td === void 0 ? void 0 : td.modified) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Support" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: (td === null || td === void 0 ? void 0 : td.support) ? (typeof td.support === 'string' ? (_jsxs("a", { href: td.support, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300", children: [td.support, _jsx(ExternalLink, { className: "inline h-3 w-3 ml-1" })] })) : (JSON.stringify(td.support))) : ('Not specified') })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "h-5 w-5" }), "Context & Namespaces"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Context" }), _jsx("div", { className: "mt-1", children: (td === null || td === void 0 ? void 0 : td['@context']) ? (Array.isArray(td['@context']) ? (_jsx("div", { className: "space-y-1", children: td['@context'].map(function (context, index) { return (_jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded", children: typeof context === 'string' ? context : JSON.stringify(context, null, 2) }, index)); }) })) : (_jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded", children: typeof td['@context'] === 'string' ? td['@context'] : JSON.stringify(td['@context'], null, 2) }))) : (_jsx("span", { className: "text-sm text-gray-500", children: "Not specified" })) })] }) }) })] }), securitySchemes.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Security Configuration"] }), _jsx(CardDescription, { children: "Authentication and security mechanisms defined for this Thing" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [securitySchemes.map(function (scheme, index) { return (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm text-gray-900 dark:text-gray-100", children: scheme.name }), _jsx(Badge, { variant: "outline", children: scheme.scheme || 'unknown' })] }), _jsxs("div", { className: "space-y-1 text-xs text-gray-600 dark:text-gray-400", children: [scheme.description && (_jsx("p", { children: scheme.description })), scheme.in && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Location:" }), _jsx("span", { className: "font-mono", children: scheme.in })] })), scheme.name && scheme.scheme !== scheme.name && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Parameter:" }), _jsx("span", { className: "font-mono", children: scheme.name })] }))] })] }, index)); }), (td === null || td === void 0 ? void 0 : td.security) && (_jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Applied Security" }), _jsx("div", { className: "mt-1 flex flex-wrap gap-1", children: Array.isArray(td.security) ? (td.security.map(function (sec, index) { return (_jsx(Badge, { variant: "outline", className: "text-xs", children: typeof sec === 'string' ? sec : Object.keys(sec)[0] }, index)); })) : (_jsx(Badge, { variant: "outline", className: "text-xs", children: typeof td.security === 'string' ? td.security : Object.keys(td.security)[0] })) })] }))] }) })] })), links.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Link, { className: "h-5 w-5" }), "Related Links"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: links.map(function (link, index) { return (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm text-gray-900 dark:text-gray-100", children: link.title || "Link ".concat(index + 1) }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx("a", { href: link.href, target: "_blank", rel: "noopener noreferrer", children: _jsx(ExternalLink, { className: "h-3 w-3" }) }) })] }), _jsxs("div", { className: "space-y-1 text-xs text-gray-600 dark:text-gray-400", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "URL:" }), _jsx("span", { className: "font-mono break-all", children: link.href })] }), link.rel && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Relation:" }), _jsx("span", { className: "font-mono", children: link.rel })] })), link.type && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Type:" }), _jsx("span", { className: "font-mono", children: link.type })] }))] })] }, index)); }) }) })] })), forms.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5" }), "Protocol Bindings (", forms.length, ")"] }), _jsx(CardDescription, { children: "Communication endpoints and protocol details" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: forms.map(function (form, index) { return (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: form.source }), _jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: form.sourceName })] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: form.op || form.method || 'GET' })] }), _jsxs("div", { className: "space-y-1 text-xs text-gray-600 dark:text-gray-400", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Endpoint:" }), _jsx("span", { className: "font-mono break-all", children: form.href })] }), form.contentType && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Content Type:" }), _jsx("span", { className: "font-mono", children: form.contentType })] })), form.subprotocol && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Subprotocol:" }), _jsx("span", { className: "font-mono", children: form.subprotocol })] }))] })] }, index)); }) }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), "Discovery Information"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Discovery Method" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: thing.discoveryMethod || 'Manual' })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Source URL" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100 font-mono break-all", children: thing.url || 'Not specified' })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Last Seen" }), _jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: formatDate(thing.lastSeen) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Status" }), _jsx(Badge, { variant: "outline", className: thing.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                        thing.status === 'offline' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', children: thing.status })] })] })] }) })] })] }));
}
