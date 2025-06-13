import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Settings, Zap, Activity, CheckCircle, AlertCircle, XCircle, Clock, Globe, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
export function ThingCard(_a) {
    var thing = _a.thing, onEdit = _a.onEdit, onDelete = _a.onDelete, onView = _a.onView;
    var getStatusIcon = function (status) {
        switch (status) {
            case 'online':
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case 'offline':
                return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
            case 'unknown':
                return _jsx(AlertCircle, { className: "h-4 w-4 text-yellow-500" });
            case 'connecting':
                return _jsx(Clock, { className: "h-4 w-4 text-blue-500" });
        }
    };
    var getStatusBadgeVariant = function (status) {
        switch (status) {
            case 'online':
                return 'default';
            case 'offline':
                return 'destructive';
            case 'unknown':
                return 'secondary';
            case 'connecting':
                return 'outline';
        }
    };
    // Parse the Thing Description to get capabilities count
    var td = thing.thingDescription;
    var propertiesCount = td.properties ? Object.keys(td.properties).length : 0;
    var actionsCount = td.actions ? Object.keys(td.actions).length : 0;
    var eventsCount = td.events ? Object.keys(td.events).length : 0;
    return (_jsxs(Card, { className: "group hover:shadow-md transition-shadow", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx(CardTitle, { className: "text-lg line-clamp-1", children: thing.title }), thing.description && (_jsx(CardDescription, { className: "line-clamp-2 mt-1", children: thing.description }))] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/things/".concat(thing.id), className: "flex items-center", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "View Details"] }) }), onEdit && (_jsx(DropdownMenuItem, { onClick: function () { return onEdit(thing); }, children: "Edit Thing" })), onDelete && (_jsx(DropdownMenuItem, { onClick: function () { return onDelete(thing); }, className: "text-destructive", children: "Delete Thing" }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2 mt-3", children: [getStatusIcon(thing.status), _jsx(Badge, { variant: getStatusBadgeVariant(thing.status), children: thing.status }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Globe, { className: "h-3 w-3 mr-1" }), thing.discoveryMethod || 'manual'] })] })] }), _jsxs(CardContent, { className: "pt-0", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-muted-foreground", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Settings, { className: "h-4 w-4" }), _jsx("span", { children: propertiesCount })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Zap, { className: "h-4 w-4" }), _jsx("span", { children: actionsCount })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Activity, { className: "h-4 w-4" }), _jsx("span", { children: eventsCount })] })] }), thing.lastSeen && (_jsxs("span", { className: "text-xs", children: ["Last seen: ", new Date(thing.lastSeen).toLocaleDateString()] }))] }), thing.url && (_jsx("div", { className: "mt-3 text-xs text-muted-foreground font-mono truncate", children: thing.url }))] })] }));
}
