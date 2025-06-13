import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useThingsStore } from '@/stores/thingsStore';
import { Server, Wifi, Activity, Zap, Radio, TrendingUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
export function SystemStatsWidget() {
    var things = useThingsStore().things;
    var stats = useMemo(function () {
        var total = things.length;
        var online = things.filter(function (t) { return t.status === 'online'; }).length;
        var offline = things.filter(function (t) { return t.status === 'offline'; }).length;
        var connecting = things.filter(function (t) { return t.status === 'connecting'; }).length;
        var unknown = things.filter(function (t) { return t.status === 'unknown'; }).length;
        // Calculate total properties, actions, and events
        var totalProperties = 0;
        var totalActions = 0;
        var totalEvents = 0;
        things.forEach(function (thing) {
            if (thing.thingDescription) {
                if (thing.thingDescription.properties) {
                    totalProperties += Object.keys(thing.thingDescription.properties).length;
                }
                if (thing.thingDescription.actions) {
                    totalActions += Object.keys(thing.thingDescription.actions).length;
                }
                if (thing.thingDescription.events) {
                    totalEvents += Object.keys(thing.thingDescription.events).length;
                }
            }
        });
        var healthScore = total > 0 ? Math.round((online / total) * 100) : 100;
        var recentlyDiscovered = things.filter(function (thing) {
            if (!thing.lastSeen)
                return false;
            var lastSeen = new Date(thing.lastSeen);
            var oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return lastSeen > oneDayAgo;
        }).length;
        return {
            total: total,
            online: online,
            offline: offline,
            connecting: connecting,
            unknown: unknown,
            totalProperties: totalProperties,
            totalActions: totalActions,
            totalEvents: totalEvents,
            healthScore: healthScore,
            recentlyDiscovered: recentlyDiscovered
        };
    }, [things]);
    var getHealthColor = function (score) {
        if (score >= 90)
            return 'text-green-600 dark:text-green-400';
        if (score >= 70)
            return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };
    var getHealthIcon = function (score) {
        if (score >= 90)
            return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
        if (score >= 70)
            return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
        return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
    };
    return (_jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Things" }), _jsx(Server, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.total }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [stats.recentlyDiscovered, " discovered today"] }), _jsx("div", { className: "mt-2", children: _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsx(Link, { to: "/things", children: "View All" }) }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "System Health" }), getHealthIcon(stats.healthScore)] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold ".concat(getHealthColor(stats.healthScore)), children: [stats.healthScore, "%"] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [stats.online, "/", stats.total, " devices online"] }), _jsxs("div", { className: "flex gap-1 mt-2", children: [_jsxs(Badge, { variant: "outline", className: "text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", children: [stats.online, " online"] }), stats.offline > 0 && (_jsxs(Badge, { variant: "outline", className: "text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", children: [stats.offline, " offline"] }))] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Properties" }), _jsx(Activity, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalProperties }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Across ", stats.total, " devices"] }), _jsxs("div", { className: "flex items-center gap-1 mt-2", children: [_jsx(TrendingUp, { className: "h-3 w-3 text-green-500" }), _jsx("span", { className: "text-xs text-green-600 dark:text-green-400", children: "Real-time monitoring" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Capabilities" }), _jsx(Zap, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalActions + stats.totalEvents }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [stats.totalActions, " actions, ", stats.totalEvents, " events"] }), _jsxs("div", { className: "flex gap-1 mt-2", children: [_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Zap, { className: "h-3 w-3 mr-1" }), stats.totalActions] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Radio, { className: "h-3 w-3 mr-1" }), stats.totalEvents] })] })] })] }), _jsxs(Card, { className: "md:col-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Connection Status" }), _jsx(CardDescription, { children: "Real-time device connectivity overview" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center justify-between space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }), _jsx("span", { className: "text-sm", children: "Online" }), _jsx(Badge, { variant: "outline", children: stats.online })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-red-500 rounded-full" }), _jsx("span", { className: "text-sm", children: "Offline" }), _jsx(Badge, { variant: "outline", children: stats.offline })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-yellow-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm", children: "Connecting" }), _jsx(Badge, { variant: "outline", children: stats.connecting })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 bg-gray-400 rounded-full" }), _jsx("span", { className: "text-sm", children: "Unknown" }), _jsx(Badge, { variant: "outline", children: stats.unknown })] })] }), _jsx("div", { className: "mt-4", children: _jsx("div", { className: "flex w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", children: stats.total > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-green-500 h-full transition-all duration-300", style: { width: "".concat((stats.online / stats.total) * 100, "%") } }), _jsx("div", { className: "bg-yellow-500 h-full transition-all duration-300", style: { width: "".concat((stats.connecting / stats.total) * 100, "%") } }), _jsx("div", { className: "bg-red-500 h-full transition-all duration-300", style: { width: "".concat((stats.offline / stats.total) * 100, "%") } }), _jsx("div", { className: "bg-gray-400 h-full transition-all duration-300", style: { width: "".concat((stats.unknown / stats.total) * 100, "%") } })] })) }) })] })] }), _jsxs(Card, { className: "md:col-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Quick Actions" }), _jsx(CardDescription, { children: "Common tasks and navigation" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsxs(Link, { to: "/things/discover", className: "flex items-center", children: [_jsx(Wifi, { className: "h-4 w-4 mr-2" }), "Discover Devices"] }) }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsxs(Link, { to: "/things/create", className: "flex items-center", children: [_jsx(Zap, { className: "h-4 w-4 mr-2" }), "Create Thing"] }) }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsxs(Link, { to: "/things", className: "flex items-center", children: [_jsx(Server, { className: "h-4 w-4 mr-2" }), "View All Things"] }) }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsxs(Link, { to: "/visualization", className: "flex items-center", children: [_jsx(Activity, { className: "h-4 w-4 mr-2" }), "Visualization"] }) })] }) })] })] }));
}
