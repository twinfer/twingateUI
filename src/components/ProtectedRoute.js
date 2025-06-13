import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
export function ProtectedRoute(_a) {
    var children = _a.children, requiredPermission = _a.requiredPermission;
    var _b = useAuthStatus(), isAuthenticated = _b.isAuthenticated, isLoading = _b.isLoading, hasPermission = _b.hasPermission;
    var location = useLocation();
    var setGlobalLoading = useUIStore().setGlobalLoading;
    // Update global loading state
    useEffect(function () {
        setGlobalLoading(isLoading);
    }, [isLoading, setGlobalLoading]);
    // Show loading while checking authentication
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" }) }));
    }
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    // Check permission if required
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Access Denied" }), _jsx("p", { className: "text-gray-600", children: "You don't have permission to access this page." })] }) }));
    }
    return _jsx(_Fragment, { children: children });
}
