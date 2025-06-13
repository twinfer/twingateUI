import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, } from "@/components/ui/sidebar";
export function NavMain(_a) {
    var items = _a.items;
    var location = useLocation();
    return (_jsxs(SidebarGroup, { children: [_jsx(SidebarGroupLabel, { children: "Platform" }), _jsx(SidebarMenu, { children: items.map(function (item) {
                    var _a, _b;
                    var isActive = location.pathname === item.url ||
                        ((_a = item.items) === null || _a === void 0 ? void 0 : _a.some(function (subItem) { return location.pathname === subItem.url; }));
                    // If no subitems, render as simple link
                    if (!item.items || item.items.length === 0) {
                        return (_jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { asChild: true, tooltip: item.title, isActive: isActive, children: _jsxs(Link, { to: item.url, children: [item.icon && _jsx(item.icon, {}), _jsx("span", { children: item.title })] }) }) }, item.title));
                    }
                    // If has subitems, render as collapsible
                    return (_jsx(Collapsible, { asChild: true, defaultOpen: isActive, className: "group/collapsible", children: _jsxs(SidebarMenuItem, { children: [_jsx(CollapsibleTrigger, { asChild: true, children: _jsxs(SidebarMenuButton, { tooltip: item.title, isActive: isActive, children: [item.icon && _jsx(item.icon, {}), _jsx("span", { children: item.title }), _jsx(ChevronRight, { className: "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" })] }) }), _jsx(CollapsibleContent, { children: _jsx(SidebarMenuSub, { children: (_b = item.items) === null || _b === void 0 ? void 0 : _b.map(function (subItem) { return (_jsx(SidebarMenuSubItem, { children: _jsx(SidebarMenuSubButton, { asChild: true, children: _jsx(Link, { to: subItem.url, children: _jsx("span", { children: subItem.title }) }) }) }, subItem.title)); }) }) })] }) }, item.title));
                }) })] }));
}
