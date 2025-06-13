import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronsUpDown, Plus, Globe, Server, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useDiscoveryEndpointsStore } from "@/stores/discoveryEndpointsStore";
import { useThingsStore } from "@/stores/thingsStore";
import { Link } from "react-router-dom";
export function DiscoveryEndpointSwitcher() {
    var isMobile = useSidebar().isMobile;
    var _a = useDiscoveryEndpointsStore(), endpoints = _a.endpoints, selectedEndpointId = _a.selectedEndpointId, setSelectedEndpoint = _a.setSelectedEndpoint;
    var setDiscoveryEndpointFilter = useThingsStore().setDiscoveryEndpointFilter;
    var selectedEndpoint = endpoints.find(function (e) { return e.id === selectedEndpointId; }) ||
        endpoints.find(function (e) { return e.id === 'local'; }) ||
        endpoints[0];
    var handleEndpointSelect = function (endpointId) {
        setSelectedEndpoint(endpointId);
        setDiscoveryEndpointFilter(endpointId);
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'active':
                return _jsx(CheckCircle, { className: "h-3 w-3 text-green-500" });
            case 'inactive':
                return _jsx(AlertCircle, { className: "h-3 w-3 text-yellow-500" });
            case 'error':
                return _jsx(XCircle, { className: "h-3 w-3 text-red-500" });
            default:
                return _jsx(Globe, { className: "h-3 w-3 text-gray-500" });
        }
    };
    var getEndpointIcon = function (endpoint) {
        if (endpoint.id === 'local') {
            return _jsx(Server, { className: "h-4 w-4" });
        }
        return _jsx(Globe, { className: "h-4 w-4" });
    };
    var formatLastDiscovered = function (timestamp) {
        if (!timestamp)
            return 'Never';
        var now = new Date();
        var time = new Date(timestamp);
        var diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
        if (diffInHours < 1)
            return 'Just now';
        if (diffInHours < 24)
            return "".concat(diffInHours, "h ago");
        return "".concat(Math.floor(diffInHours / 24), "d ago");
    };
    return (_jsx(SidebarMenu, { children: _jsx(SidebarMenuItem, { children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(SidebarMenuButton, { size: "lg", className: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground", children: [_jsx("div", { className: "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground", children: getEndpointIcon(selectedEndpoint) }), _jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [_jsx("span", { className: "truncate font-semibold", children: (selectedEndpoint === null || selectedEndpoint === void 0 ? void 0 : selectedEndpoint.name) || 'Select Endpoint' }), _jsxs("span", { className: "truncate text-xs text-muted-foreground", children: [(selectedEndpoint === null || selectedEndpoint === void 0 ? void 0 : selectedEndpoint.thingsCount) || 0, " Things"] })] }), _jsx(ChevronsUpDown, { className: "ml-auto" })] }) }), _jsxs(DropdownMenuContent, { className: "w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg", align: "start", side: isMobile ? "bottom" : "right", sideOffset: 4, children: [_jsx(DropdownMenuLabel, { className: "text-xs text-muted-foreground", children: "Discovery Endpoints" }), endpoints.map(function (endpoint) { return (_jsxs(DropdownMenuItem, { onClick: function () { return handleEndpointSelect(endpoint.id); }, className: "gap-2 p-2", children: [_jsx("div", { className: "flex size-6 items-center justify-center rounded-sm border", children: getEndpointIcon(endpoint) }), _jsxs("div", { className: "flex-1 grid text-left text-sm leading-tight", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "truncate font-medium", children: endpoint.name }), getStatusIcon(endpoint.status)] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "truncate text-xs text-muted-foreground", children: [endpoint.thingsCount, " Things"] }), endpoint.lastDiscovered && (_jsxs("span", { className: "text-xs text-muted-foreground", children: ["\u2022 ", formatLastDiscovered(endpoint.lastDiscovered)] }))] })] }), (selectedEndpoint === null || selectedEndpoint === void 0 ? void 0 : selectedEndpoint.id) === endpoint.id && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Active" }))] }, endpoint.id)); }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/things/discover", className: "gap-2 p-2", children: [_jsx("div", { className: "flex size-6 items-center justify-center rounded-sm border bg-background", children: _jsx(Plus, { className: "size-4" }) }), _jsx("div", { className: "font-medium text-muted-foreground", children: "Discover More Endpoints" })] }) }), _jsxs(DropdownMenuItem, { onClick: function () {
                                    setSelectedEndpoint(null);
                                    setDiscoveryEndpointFilter(null);
                                }, className: "gap-2 p-2", children: [_jsx("div", { className: "flex size-6 items-center justify-center rounded-sm border bg-background", children: _jsx(Globe, { className: "size-4" }) }), _jsx("div", { className: "font-medium text-muted-foreground", children: "Show All Things" }), !selectedEndpointId && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Active" }))] })] })] }) }) }));
}
