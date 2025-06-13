import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ModeToggle } from './mode-toggle';
export function Layout() {
    return (_jsx(SidebarProvider, { children: _jsxs("div", { className: "flex h-screen w-full", children: [_jsx(AppSidebar, {}), _jsxs(SidebarInset, { className: "flex-1", children: [_jsx("div", { className: "flex justify-end p-2", children: _jsx(ModeToggle, {}) }), _jsx("main", { className: "container mx-auto p-6", children: _jsx(Outlet, {}) })] })] }) }));
}
