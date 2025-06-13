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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Home, Cpu, Box, Activity, FileJson, GitBranch, Settings, Eye, Search, } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { DiscoveryEndpointSwitcher } from "@/components/discovery-endpoint-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, } from "@/components/ui/sidebar";
// Navigation data for WoT Dashboard
var data = {
    user: {
        name: "WoT Admin",
        email: "admin@wot-dashboard.com",
        avatar: "/avatars/user.jpg",
    },
    teams: [
        {
            name: "TwinCore Gateway",
            logo: Cpu,
            plan: "IoT Platform",
        },
    ],
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: Home,
            isActive: true,
            items: [],
        },
        {
            title: "Things",
            url: "/things",
            icon: Cpu,
            items: [
                {
                    title: "All Things",
                    url: "/things",
                },
                {
                    title: "Discover",
                    url: "/things/discover",
                },
                {
                    title: "Create TD",
                    url: "/things/create",
                },
            ],
        },
        {
            title: "Visualization",
            url: "/visualization",
            icon: Box,
            items: [
                {
                    title: "3D View",
                    url: "/visualization",
                },
                {
                    title: "Floor Plan",
                    url: "/visualization/floorplan",
                },
            ],
        },
        {
            title: "Monitoring",
            url: "/monitoring",
            icon: Activity,
            items: [
                {
                    title: "Live Data",
                    url: "/monitoring/live",
                },
                {
                    title: "Events",
                    url: "/monitoring/events",
                },
                {
                    title: "Alerts",
                    url: "/monitoring/alerts",
                },
            ],
        },
        {
            title: "Streams",
            url: "/streams",
            icon: GitBranch,
            items: [
                {
                    title: "Pipelines",
                    url: "/streams/pipelines",
                },
                {
                    title: "Editor",
                    url: "/streams/editor",
                },
            ],
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
            items: [
                {
                    title: "General",
                    url: "/settings/general",
                },
                {
                    title: "API Keys",
                    url: "/settings/api-keys",
                },
                {
                    title: "Users",
                    url: "/settings/users",
                },
            ],
        },
    ],
    projects: [
        {
            name: "TD Playground",
            url: "/td-playground",
            icon: FileJson,
        },
        {
            name: "Discovery",
            url: "/discovery",
            icon: Search,
        },
        {
            name: "Live View",
            url: "/live-view",
            icon: Eye,
        },
    ],
};
export function AppSidebar(_a) {
    var props = __rest(_a, []);
    return (_jsxs(Sidebar, __assign({ collapsible: "icon" }, props, { children: [_jsx(SidebarHeader, { children: _jsx(DiscoveryEndpointSwitcher, {}) }), _jsxs(SidebarContent, { children: [_jsx(NavMain, { items: data.navMain }), _jsx(NavProjects, { projects: data.projects })] }), _jsx(SidebarFooter, { children: _jsx(NavUser, {}) }), _jsx(SidebarRail, {})] })));
}
