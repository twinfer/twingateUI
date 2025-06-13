import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DiscoveryModal } from '@/components/discovery/DiscoveryModal';
import { ThingsList } from '@/components/things/ThingsList';
import { Search, Plus, Globe } from 'lucide-react';
import { useThingsStore } from '@/stores/thingsStore';
import { useDiscoveryEndpointsStore } from '@/stores/discoveryEndpointsStore';
import { useNavigate } from 'react-router-dom';
export function Things() {
    var _a = useState(false), discoveryModalOpen = _a[0], setDiscoveryModalOpen = _a[1];
    var getFilteredThings = useThingsStore().getFilteredThings;
    var getSelectedEndpoint = useDiscoveryEndpointsStore().getSelectedEndpoint;
    var navigate = useNavigate();
    var filteredThings = getFilteredThings();
    var selectedEndpoint = getSelectedEndpoint();
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Things" }), selectedEndpoint && (_jsxs("p", { className: "text-muted-foreground mt-1", children: ["Showing ", filteredThings.length, " things from ", selectedEndpoint.name] })), !selectedEndpoint && (_jsxs("p", { className: "text-muted-foreground mt-1", children: ["Showing ", filteredThings.length, " things from all endpoints"] }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: function () { return setDiscoveryModalOpen(true); }, children: [_jsx(Search, { className: "h-4 w-4 mr-2" }), "Discover Things"] }), _jsxs(Button, { onClick: function () { return navigate('/things/create'); }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Thing"] })] })] }), filteredThings.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12", children: [_jsx(Globe, { className: "h-12 w-12 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Things Found" }), _jsx("p", { className: "text-muted-foreground text-center max-w-md mb-4", children: "Start by discovering devices from your network or creating a new Thing manually." }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: function () { return setDiscoveryModalOpen(true); }, children: [_jsx(Search, { className: "h-4 w-4 mr-2" }), "Discover Things"] }), _jsxs(Button, { onClick: function () { return navigate('/things/create'); }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Thing"] })] })] }) })) : (_jsx(ThingsList, {})), _jsx(DiscoveryModal, { open: discoveryModalOpen, onOpenChange: setDiscoveryModalOpen })] }));
}
