import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SystemStatsWidget } from '@/components/dashboard/widgets/SystemStatsWidget';
import { ActivityFeedWidget } from '@/components/dashboard/widgets/ActivityFeedWidget';
import { DeviceStatusGrid } from '@/components/dashboard/widgets/DeviceStatusGrid';
export function Dashboard() {
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: "Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Welcome to TwinGate UI - Your Web of Things Command Center" })] }), _jsx(SystemStatsWidget, {}), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsx("div", { className: "lg:col-span-2", children: _jsx(DeviceStatusGrid, {}) }), _jsx("div", { className: "lg:col-span-1", children: _jsx(ActivityFeedWidget, {}) })] })] }));
}
