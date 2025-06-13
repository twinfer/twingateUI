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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDiscoverThings, useDiscoverSingleThing } from '@/hooks/useDiscovery';
import { Search, Globe, Plus, X, Clock } from 'lucide-react';
import { DiscoveryResults } from './DiscoveryResults';
var bulkDiscoverySchema = z.object({
    urls: z.string().min(1, 'At least one URL is required'),
});
var singleDiscoverySchema = z.object({
    url: z.string().url('Please enter a valid URL'),
});
export function DiscoveryModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange;
    var _b = useState('bulk'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = useState(['']), urlInputs = _c[0], setUrlInputs = _c[1];
    var discoverThings = useDiscoverThings();
    var discoverSingle = useDiscoverSingleThing();
    var bulkForm = useForm({
        resolver: zodResolver(bulkDiscoverySchema),
    });
    var singleForm = useForm({
        resolver: zodResolver(singleDiscoverySchema),
    });
    var handleBulkDiscovery = function (data) {
        var urls = data.urls
            .split('\n')
            .map(function (url) { return url.trim(); })
            .filter(function (url) { return url.length > 0; })
            .filter(function (url) {
            try {
                new URL(url);
                return true;
            }
            catch (_a) {
                return false;
            }
        });
        if (urls.length === 0) {
            return;
        }
        discoverThings.discoverThings(urls);
    };
    var handleSingleDiscovery = function (data) {
        discoverSingle.mutate(data.url);
    };
    var addUrlInput = function () {
        setUrlInputs(__spreadArray(__spreadArray([], urlInputs, true), [''], false));
    };
    var removeUrlInput = function (index) {
        if (urlInputs.length > 1) {
            setUrlInputs(urlInputs.filter(function (_, i) { return i !== index; }));
        }
    };
    var updateUrlInput = function (index, value) {
        var newInputs = __spreadArray([], urlInputs, true);
        newInputs[index] = value;
        setUrlInputs(newInputs);
        // Update form value
        bulkForm.setValue('urls', newInputs.join('\n'));
    };
    var getProgressPercentage = function () {
        if (!discoverThings.progress)
            return 0;
        return (discoverThings.progress.completed / discoverThings.progress.total) * 100;
    };
    var isDiscovering = discoverThings.isDiscovering || discoverSingle.isPending;
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-hidden", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Search, { className: "h-5 w-5" }), "Discover Things"] }), _jsx(DialogDescription, { children: "Discover Web of Things devices and services using URLs or network scanning" })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "flex-1", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "bulk", children: "Bulk Discovery" }), _jsx(TabsTrigger, { value: "single", children: "Single URL" }), _jsx(TabsTrigger, { value: "results", children: "Results" })] }), _jsx(TabsContent, { value: "bulk", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "h-4 w-4" }), "Bulk Discovery"] }), _jsx(CardDescription, { children: "Discover multiple Things by scanning base URLs for .well-known/wot endpoints" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: bulkForm.handleSubmit(handleBulkDiscovery), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Base URLs" }), _jsx("div", { className: "space-y-2", children: urlInputs.map(function (url, index) { return (_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "https://example.com", value: url, onChange: function (e) { return updateUrlInput(index, e.target.value); }, disabled: isDiscovering }), urlInputs.length > 1 && (_jsx(Button, { type: "button", variant: "outline", size: "icon", onClick: function () { return removeUrlInput(index); }, disabled: isDiscovering, children: _jsx(X, { className: "h-4 w-4" }) }))] }, index)); }) }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addUrlInput, disabled: isDiscovering, className: "w-full", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add URL"] })] }), discoverThings.progress && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Discovery Progress" }), _jsxs("span", { children: [discoverThings.progress.completed, " / ", discoverThings.progress.total] })] }), _jsx(Progress, { value: getProgressPercentage() }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [discoverThings.progress.status === 'scanning' && "Scanning: ".concat(discoverThings.progress.current), discoverThings.progress.status === 'validating' && 'Validating Thing Descriptions...', discoverThings.progress.status === 'completed' && 'Discovery completed!'] })] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "submit", disabled: isDiscovering || urlInputs.every(function (url) { return !url.trim(); }), className: "flex-1", children: discoverThings.isDiscovering ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "h-4 w-4 mr-2 animate-spin" }), "Discovering..."] })) : (_jsxs(_Fragment, { children: [_jsx(Search, { className: "h-4 w-4 mr-2" }), "Start Discovery"] })) }), discoverThings.isDiscovering && (_jsx(Button, { type: "button", variant: "outline", onClick: discoverThings.cancelDiscovery, children: "Cancel" }))] })] }) })] }) }), _jsx(TabsContent, { value: "single", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Single Thing Discovery" }), _jsx(CardDescription, { children: "Discover a single Thing by providing a direct URL to its Thing Description" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: singleForm.handleSubmit(handleSingleDiscovery), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "single-url", children: "Thing Description URL" }), _jsx(Input, __assign({ id: "single-url", placeholder: "https://example.com/thing.jsonld" }, singleForm.register('url'), { disabled: isDiscovering })), singleForm.formState.errors.url && (_jsx("p", { className: "text-sm text-red-500", children: singleForm.formState.errors.url.message }))] }), _jsx(Button, { type: "submit", disabled: isDiscovering, className: "w-full", children: discoverSingle.isPending ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "h-4 w-4 mr-2 animate-spin" }), "Discovering..."] })) : (_jsxs(_Fragment, { children: [_jsx(Search, { className: "h-4 w-4 mr-2" }), "Discover Thing"] })) })] }) })] }) }), _jsx(TabsContent, { value: "results", className: "space-y-4", children: _jsx(DiscoveryResults, {}) })] })] }) }));
}
