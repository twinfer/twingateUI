import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useThingsStore } from '@/stores/thingsStore';
import { useImportThing, useImportMultipleThings } from '@/hooks/useDiscovery';
import { CheckCircle, AlertCircle, Clock, XCircle, Download, Eye, Trash2, Globe } from 'lucide-react';
import { ThingPreviewDialog } from './ThingPreviewDialog';
export function DiscoveryResults() {
    var _a = useThingsStore(), discoveredThings = _a.discoveredThings, setDiscoveredThings = _a.setDiscoveredThings;
    var _b = useState(new Set()), selectedThings = _b[0], setSelectedThings = _b[1];
    var _c = useState(null), previewThing = _c[0], setPreviewThing = _c[1];
    var importSingle = useImportThing();
    var importMultiple = useImportMultipleThings();
    var handleSelectThing = function (thingId, checked) {
        var newSelected = new Set(selectedThings);
        if (checked) {
            newSelected.add(thingId);
        }
        else {
            newSelected.delete(thingId);
        }
        setSelectedThings(newSelected);
    };
    var handleSelectAll = function (checked) {
        if (checked) {
            setSelectedThings(new Set(discoveredThings.map(function (t) { return t.id; })));
        }
        else {
            setSelectedThings(new Set());
        }
    };
    var handleImportSelected = function () {
        var thingsToImport = discoveredThings.filter(function (t) { return selectedThings.has(t.id); });
        importMultiple.mutate(thingsToImport);
    };
    var handleRemoveThing = function (thingId) {
        var filtered = discoveredThings.filter(function (t) { return t.id !== thingId; });
        setDiscoveredThings(filtered);
        setSelectedThings(function (prev) {
            var newSet = new Set(prev);
            newSet.delete(thingId);
            return newSet;
        });
    };
    var getValidationIcon = function (status) {
        switch (status) {
            case 'valid':
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case 'invalid':
                return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
            case 'warning':
                return _jsx(AlertCircle, { className: "h-4 w-4 text-yellow-500" });
            case 'pending':
                return _jsx(Clock, { className: "h-4 w-4 text-gray-500" });
        }
    };
    var getValidationBadge = function (status) {
        switch (status) {
            case 'valid':
                return _jsx(Badge, { variant: "default", className: "bg-green-100 text-green-800", children: "Valid" });
            case 'invalid':
                return _jsx(Badge, { variant: "destructive", children: "Invalid" });
            case 'warning':
                return _jsx(Badge, { variant: "secondary", className: "bg-yellow-100 text-yellow-800", children: "Warning" });
            case 'pending':
                return _jsx(Badge, { variant: "outline", children: "Pending" });
        }
    };
    var getDiscoveryMethodBadge = function (method) {
        var badges = {
            'well-known': _jsxs(Badge, { variant: "outline", children: [_jsx(Globe, { className: "h-3 w-3 mr-1" }), ".well-known"] }),
            'direct-url': _jsx(Badge, { variant: "secondary", children: "Direct URL" }),
            'scan': _jsx(Badge, { variant: "default", children: "Network Scan" })
        };
        return badges[method];
    };
    if (discoveredThings.length === 0) {
        return (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12", children: [_jsx(Globe, { className: "h-12 w-12 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Things Discovered" }), _jsx("p", { className: "text-muted-foreground text-center max-w-md", children: "Start a discovery to find Web of Things devices and services. Use the Bulk Discovery or Single URL tabs to begin." })] }) }));
    }
    var allSelected = selectedThings.size === discoveredThings.length;
    var someSelected = selectedThings.size > 0;
    return (_jsxs(_Fragment, { children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Discovery Results" }), _jsxs(CardDescription, { children: ["Found ", discoveredThings.length, " Things. Select which ones to import."] })] }), _jsx("div", { className: "flex gap-2", children: someSelected && (_jsxs(Button, { onClick: handleImportSelected, disabled: importMultiple.isPending, size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Import Selected (", selectedThings.size, ")"] })) })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 pb-2 border-b", children: [_jsx(Checkbox, { checked: allSelected, onCheckedChange: handleSelectAll, disabled: importMultiple.isPending }), _jsxs("label", { className: "text-sm font-medium", children: ["Select All (", discoveredThings.length, ")"] })] }), _jsx(ScrollArea, { className: "h-[400px]", children: _jsx("div", { className: "space-y-3", children: discoveredThings.map(function (thing) { return (_jsx(Card, { className: "relative", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Checkbox, { checked: selectedThings.has(thing.id), onCheckedChange: function (checked) {
                                                                return handleSelectThing(thing.id, checked);
                                                            }, disabled: importMultiple.isPending, className: "mt-1" }), _jsx("div", { className: "flex-1 min-w-0", children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-semibold truncate", children: thing.title }), thing.description && (_jsx("p", { className: "text-sm text-muted-foreground mt-1 line-clamp-2", children: thing.description })), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [getValidationIcon(thing.validationStatus), getValidationBadge(thing.validationStatus), getDiscoveryMethodBadge(thing.discoveryMethod), _jsx(Badge, { variant: "outline", className: "text-xs", children: thing.url })] }), thing.validationErrors && thing.validationErrors.length > 0 && (_jsxs("div", { className: "mt-2 p-2 bg-red-50 rounded text-xs", children: [_jsx("div", { className: "font-medium text-red-800 mb-1", children: "Validation Errors:" }), _jsxs("ul", { className: "text-red-700 space-y-1", children: [thing.validationErrors.slice(0, 3).map(function (error, idx) { return (_jsxs("li", { children: ["\u2022 ", error] }, idx)); }), thing.validationErrors.length > 3 && (_jsxs("li", { children: ["\u2022 ... and ", thing.validationErrors.length - 3, " more"] }))] })] }))] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: function () { return setPreviewThing(thing); }, children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: function () { return importSingle.mutate(thing); }, disabled: importSingle.isPending, children: _jsx(Download, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: function () { return handleRemoveThing(thing.id); }, children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) })] }) }) }, thing.id)); }) }) }), _jsx("div", { className: "pt-2 border-t", children: _jsxs("div", { className: "grid grid-cols-4 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-green-600", children: discoveredThings.filter(function (t) { return t.validationStatus === 'valid'; }).length }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Valid" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-yellow-600", children: discoveredThings.filter(function (t) { return t.validationStatus === 'warning'; }).length }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Warnings" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-red-600", children: discoveredThings.filter(function (t) { return t.validationStatus === 'invalid'; }).length }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Invalid" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-gray-600", children: discoveredThings.filter(function (t) { return t.validationStatus === 'pending'; }).length }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Pending" })] })] }) })] }) })] }), previewThing && (_jsx(ThingPreviewDialog, { thing: previewThing, open: !!previewThing, onOpenChange: function (open) { return !open && setPreviewThing(null); } }))] }));
}
