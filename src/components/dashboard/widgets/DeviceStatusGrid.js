import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThingsStore } from '@/stores/thingsStore';
import { Grid3X3, Search, Filter, Wifi, WifiOff, Activity, AlertCircle, Clock, Eye, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
export function DeviceStatusGrid() {
    var things = useThingsStore().things;
    var _a = useState(''), searchQuery = _a[0], setSearchQuery = _a[1];
    var _b = useState('all'), statusFilter = _b[0], setStatusFilter = _b[1];
    var _c = useState('grid'), viewMode = _c[0], setViewMode = _c[1];
    var filteredThings = things.filter(function (thing) {
        var _a;
        var matchesSearch = thing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ((_a = thing.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase()));
        var matchesStatus = statusFilter === 'all' || thing.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    var getStatusIcon = function (status) {
        switch (status) {
            case 'online':
                return _jsx(Wifi, { className: "h-3 w-3 text-green-500" });
            case 'offline':
                return _jsx(WifiOff, { className: "h-3 w-3 text-red-500" });
            case 'connecting':
                return _jsx(Activity, { className: "h-3 w-3 text-yellow-500 animate-pulse" });
            case 'unknown':
                return _jsx(AlertCircle, { className: "h-3 w-3 text-gray-500" });
            default:
                return _jsx(AlertCircle, { className: "h-3 w-3 text-gray-500" });
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'online':
                return 'bg-green-500 border-green-600';
            case 'offline':
                return 'bg-red-500 border-red-600';
            case 'connecting':
                return 'bg-yellow-500 border-yellow-600 animate-pulse';
            case 'unknown':
                return 'bg-gray-400 border-gray-500';
            default:
                return 'bg-gray-400 border-gray-500';
        }
    };
    var getStatusBadgeColor = function (status) {
        switch (status) {
            case 'online':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'offline':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'connecting':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'unknown':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };
    var getCapabilitiesCount = function (thing) {
        var _a, _b, _c;
        var properties = ((_a = thing.thingDescription) === null || _a === void 0 ? void 0 : _a.properties) ? Object.keys(thing.thingDescription.properties).length : 0;
        var actions = ((_b = thing.thingDescription) === null || _b === void 0 ? void 0 : _b.actions) ? Object.keys(thing.thingDescription.actions).length : 0;
        var events = ((_c = thing.thingDescription) === null || _c === void 0 ? void 0 : _c.events) ? Object.keys(thing.thingDescription.events).length : 0;
        return properties + actions + events;
    };
    var formatLastSeen = function (lastSeen) {
        if (!lastSeen)
            return 'Never';
        var now = new Date();
        var time = new Date(lastSeen);
        var diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
        if (diffInMinutes < 1)
            return 'Just now';
        if (diffInMinutes < 60)
            return "".concat(diffInMinutes, "m ago");
        if (diffInMinutes < 1440)
            return "".concat(Math.floor(diffInMinutes / 60), "h ago");
        return "".concat(Math.floor(diffInMinutes / 1440), "d ago");
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Grid3X3, { className: "h-5 w-5" }), "Device Status Grid"] }), _jsx(CardDescription, { children: "Overview of all IoT devices and their current status" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: viewMode === 'grid' ? 'default' : 'outline', size: "sm", onClick: function () { return setViewMode('grid'); }, children: _jsx(Grid3X3, { className: "h-3 w-3" }) }), _jsx(Button, { variant: viewMode === 'list' ? 'default' : 'outline', size: "sm", onClick: function () { return setViewMode('list'); }, children: _jsx(MoreHorizontal, { className: "h-3 w-3" }) })] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search devices...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-8" })] }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsxs(SelectTrigger, { className: "w-40", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), _jsx(SelectValue, { placeholder: "Filter by status" })] }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "online", children: "Online" }), _jsx(SelectItem, { value: "offline", children: "Offline" }), _jsx(SelectItem, { value: "connecting", children: "Connecting" }), _jsx(SelectItem, { value: "unknown", children: "Unknown" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm text-muted-foreground", children: [_jsxs("span", { children: ["Showing ", filteredThings.length, " of ", things.length, " devices"] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), things.filter(function (t) { return t.status === 'online'; }).length, " online"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full" }), things.filter(function (t) { return t.status === 'offline'; }).length, " offline"] })] })] }), viewMode === 'grid' && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3", children: filteredThings.map(function (thing) { return (_jsxs("div", { className: "group relative", children: [_jsx(Link, { to: "/things/".concat(thing.id), children: _jsx("div", { className: "w-12 h-12 rounded-lg border-2 ".concat(getStatusColor(thing.status), " cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-500 group-hover:ring-offset-2"), title: "".concat(thing.title, " - ").concat(thing.status), children: getStatusIcon(thing.status) }) }), _jsxs("div", { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none", children: [_jsx("div", { className: "font-medium", children: thing.title }), _jsx("div", { className: "text-gray-300", children: thing.status }), _jsxs("div", { className: "text-gray-300", children: [getCapabilitiesCount(thing), " capabilities"] })] })] }, thing.id)); }) })), viewMode === 'list' && (_jsx("div", { className: "space-y-2", children: filteredThings.map(function (thing) { return (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-3 h-3 rounded-full ".concat(getStatusColor(thing.status).split(' ')[0]) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "font-medium text-sm truncate", children: thing.title }), thing.description && (_jsx("div", { className: "text-xs text-muted-foreground truncate", children: thing.description }))] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Badge, { variant: "outline", className: "text-xs ".concat(getStatusBadgeColor(thing.status)), children: thing.status }), _jsxs("div", { className: "text-xs text-muted-foreground flex items-center", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), formatLastSeen(thing.lastSeen)] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [getCapabilitiesCount(thing), " cap."] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", children: _jsx(MoreHorizontal, { className: "h-3 w-3" }) }) }), _jsx(DropdownMenuContent, { align: "end", children: _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/things/".concat(thing.id), className: "flex items-center", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "View Details"] }) }) })] })] })] }, thing.id)); }) })), filteredThings.length === 0 && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Grid3X3, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { className: "text-lg font-medium", children: "No devices found" }), _jsx("p", { className: "text-sm", children: searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Start by discovering or creating your first IoT device' }), !searchQuery && statusFilter === 'all' && (_jsx("div", { className: "mt-4", children: _jsx(Button, { asChild: true, children: _jsx(Link, { to: "/things/discover", children: "Discover Devices" }) }) }))] }))] })] }));
}
