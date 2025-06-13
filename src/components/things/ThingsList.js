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
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Search, Filter, SortAsc, SortDesc, Grid3X3, List, RefreshCw } from 'lucide-react';
import { useThingsStore } from '@/stores/thingsStore';
import { ThingCard } from './ThingCard';
export function ThingsList() {
    var _a = useThingsStore(), getFilteredThings = _a.getFilteredThings, deleteThing = _a.deleteThing;
    var things = getFilteredThings();
    var _b = useState(''), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useState('all'), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = useState('title'), sortField = _d[0], setSortField = _d[1];
    var _e = useState('asc'), sortOrder = _e[0], setSortOrder = _e[1];
    var _f = useState('grid'), viewMode = _f[0], setViewMode = _f[1];
    var filteredAndSortedThings = useMemo(function () {
        var filtered = things;
        // Apply search filter
        if (searchQuery.trim()) {
            var query_1 = searchQuery.toLowerCase();
            filtered = filtered.filter(function (thing) {
                var _a, _b;
                return thing.title.toLowerCase().includes(query_1) ||
                    ((_a = thing.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query_1)) ||
                    thing.id.toLowerCase().includes(query_1) ||
                    ((_b = thing.url) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(query_1));
            });
        }
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(function (thing) { return thing.status === statusFilter; });
        }
        // Apply sorting
        filtered = __spreadArray([], filtered, true).sort(function (a, b) {
            var aValue;
            var bValue;
            switch (sortField) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'lastSeen':
                    aValue = a.lastSeen ? new Date(a.lastSeen) : new Date(0);
                    bValue = b.lastSeen ? new Date(b.lastSeen) : new Date(0);
                    break;
                case 'discoveryMethod':
                    aValue = a.discoveryMethod || 'manual';
                    bValue = b.discoveryMethod || 'manual';
                    break;
                default:
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
            }
            if (aValue < bValue)
                return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue)
                return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [things, searchQuery, statusFilter, sortField, sortOrder]);
    var handleEdit = function (thing) {
        // TODO: Implement edit functionality
        console.log('Edit thing:', thing);
    };
    var handleDelete = function (thing) {
        if (confirm("Are you sure you want to delete \"".concat(thing.title, "\"?"))) {
            deleteThing(thing.id);
        }
    };
    var handleView = function (thing) {
        // TODO: Implement view details functionality
        console.log('View thing:', thing);
    };
    var toggleSort = function () {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };
    var statusCounts = useMemo(function () {
        return things.reduce(function (acc, thing) {
            acc[thing.status] = (acc[thing.status] || 0) + 1;
            return acc;
        }, {});
    }, [things]);
    if (things.length === 0) {
        return null; // Parent component will show empty state
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search things by title, description, or URL...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10" })] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: statusFilter, onValueChange: function (value) { return setStatusFilter(value); }, children: [_jsxs(SelectTrigger, { className: "w-32", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), _jsx(SelectValue, {})] }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsxs(SelectItem, { value: "online", children: ["Online ", statusCounts.online ? "(".concat(statusCounts.online, ")") : ''] }), _jsxs(SelectItem, { value: "offline", children: ["Offline ", statusCounts.offline ? "(".concat(statusCounts.offline, ")") : ''] }), _jsxs(SelectItem, { value: "unknown", children: ["Unknown ", statusCounts.unknown ? "(".concat(statusCounts.unknown, ")") : ''] }), _jsxs(SelectItem, { value: "connecting", children: ["Connecting ", statusCounts.connecting ? "(".concat(statusCounts.connecting, ")") : ''] })] })] }), _jsxs(Select, { value: sortField, onValueChange: function (value) { return setSortField(value); }, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "title", children: "Sort by Title" }), _jsx(SelectItem, { value: "status", children: "Sort by Status" }), _jsx(SelectItem, { value: "lastSeen", children: "Sort by Last Seen" }), _jsx(SelectItem, { value: "discoveryMethod", children: "Sort by Discovery" })] })] }), _jsx(Button, { variant: "outline", size: "icon", onClick: toggleSort, children: sortOrder === 'asc' ? _jsx(SortAsc, { className: "h-4 w-4" }) : _jsx(SortDesc, { className: "h-4 w-4" }) }), _jsxs("div", { className: "flex border rounded-md", children: [_jsx(Button, { variant: viewMode === 'grid' ? 'default' : 'ghost', size: "sm", onClick: function () { return setViewMode('grid'); }, className: "rounded-r-none", children: _jsx(Grid3X3, { className: "h-4 w-4" }) }), _jsx(Button, { variant: viewMode === 'list' ? 'default' : 'ghost', size: "sm", onClick: function () { return setViewMode('list'); }, className: "rounded-l-none", children: _jsx(List, { className: "h-4 w-4" }) })] })] })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsxs("span", { children: ["Showing ", filteredAndSortedThings.length, " of ", things.length, " things"] }), searchQuery && (_jsxs(Badge, { variant: "outline", children: ["Search: \"", searchQuery, "\""] })), statusFilter !== 'all' && (_jsxs(Badge, { variant: "outline", children: ["Status: ", statusFilter] }))] }), filteredAndSortedThings.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-muted-foreground", children: "No things match your current filters." }), _jsxs(Button, { variant: "outline", onClick: function () {
                            setSearchQuery('');
                            setStatusFilter('all');
                        }, className: "mt-4", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Clear Filters"] })] })) : (_jsx("div", { className: viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4", children: filteredAndSortedThings.map(function (thing) { return (_jsx(ThingCard, { thing: thing, onEdit: handleEdit, onDelete: handleDelete, onView: handleView }, thing.id)); }) }))] }));
}
