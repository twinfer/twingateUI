import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useThingsStore } from '@/stores/thingsStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Play, Activity, Info, Code, Wifi, WifiOff } from 'lucide-react';
import { ThingProperties } from '@/components/thing-detail/ThingProperties';
import { ThingActions } from '@/components/thing-detail/ThingActions';
import { ThingEvents } from '@/components/thing-detail/ThingEvents';
import { ThingMetadata } from '@/components/thing-detail/ThingMetadata';
import { ThingDescription } from '@/components/thing-detail/ThingDescription';
export function ThingDetail() {
    var id = useParams().id;
    var navigate = useNavigate();
    var things = useThingsStore().things;
    var thing = things.find(function (t) { return t.id === id; });
    if (!thing) {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4", children: "Thing Not Found" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: "The Thing you're looking for doesn't exist or has been removed." }), _jsxs(Button, { onClick: function () { return navigate('/things'); }, children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), "Back to Things"] })] }) }));
    }
    var getStatusIcon = function () {
        switch (thing.status) {
            case 'online':
                return _jsx(Wifi, { className: "h-4 w-4 text-green-500" });
            case 'offline':
                return _jsx(WifiOff, { className: "h-4 w-4 text-red-500" });
            case 'connecting':
                return _jsx(Activity, { className: "h-4 w-4 text-yellow-500 animate-pulse" });
            default:
                return _jsx(WifiOff, { className: "h-4 w-4 text-gray-500" });
        }
    };
    var getStatusColor = function () {
        switch (thing.status) {
            case 'online':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'offline':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'connecting':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };
    var thingDescription = thing.thingDescription;
    var properties = (thingDescription === null || thingDescription === void 0 ? void 0 : thingDescription.properties) ? Object.entries(thingDescription.properties) : [];
    var actions = (thingDescription === null || thingDescription === void 0 ? void 0 : thingDescription.actions) ? Object.entries(thingDescription.actions) : [];
    var events = (thingDescription === null || thingDescription === void 0 ? void 0 : thingDescription.events) ? Object.entries(thingDescription.events) : [];
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: function () { return navigate('/things'); }, children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back"] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: thing.title }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(), _jsx(Badge, { variant: "outline", className: getStatusColor(), children: thing.status })] })] }), thing.description && (_jsx("p", { className: "text-gray-600 dark:text-gray-400 max-w-2xl", children: thing.description }))] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/things/editor?edit=".concat(thing.id)); }, children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Properties" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: properties.length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Actions" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: actions.length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Events" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: events.length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Last Seen" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100", children: thing.lastSeen ? new Date(thing.lastSeen).toLocaleString() : 'Never' }) })] })] }), _jsxs(Tabs, { defaultValue: "properties", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsxs(TabsTrigger, { value: "properties", className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-4 w-4" }), "Properties"] }), _jsxs(TabsTrigger, { value: "actions", className: "flex items-center gap-2", children: [_jsx(Play, { className: "h-4 w-4" }), "Actions"] }), _jsxs(TabsTrigger, { value: "events", className: "flex items-center gap-2", children: [_jsx(Wifi, { className: "h-4 w-4" }), "Events"] }), _jsxs(TabsTrigger, { value: "metadata", className: "flex items-center gap-2", children: [_jsx(Info, { className: "h-4 w-4" }), "Metadata"] }), _jsxs(TabsTrigger, { value: "description", className: "flex items-center gap-2", children: [_jsx(Code, { className: "h-4 w-4" }), "TD JSON"] })] }), _jsx(TabsContent, { value: "properties", className: "space-y-6", children: _jsx(ThingProperties, { thing: thing, properties: properties }) }), _jsx(TabsContent, { value: "actions", className: "space-y-6", children: _jsx(ThingActions, { thing: thing, actions: actions }) }), _jsx(TabsContent, { value: "events", className: "space-y-6", children: _jsx(ThingEvents, { thing: thing, events: events }) }), _jsx(TabsContent, { value: "metadata", className: "space-y-6", children: _jsx(ThingMetadata, { thing: thing }) }), _jsx(TabsContent, { value: "description", className: "space-y-6", children: _jsx(ThingDescription, { thing: thing }) })] })] }));
}
