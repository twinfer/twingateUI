import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/theme-provider';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Things } from './pages/Things';
import { ThingDetail } from './pages/ThingDetail';
import { TDEditorPage } from './pages/TDEditor';
import { Visualization } from './pages/Visualization';
import { Login } from './pages/Login';
import { LiveData } from './pages/monitoring/LiveData';
import { Events } from './pages/monitoring/Events';
import { Alerts } from './pages/monitoring/Alerts';
import { MonitoringDashboard } from './pages/monitoring/MonitoringDashboard';
import { Toaster } from './components/ui/sonner';
import { queryClient } from './config/queryClient';
import { validateEnv } from './config/env';
// Validate environment variables on app startup
validateEnv();
var router = createBrowserRouter([
    {
        path: '/login',
        element: _jsx(Login, {})
    },
    {
        path: '/',
        element: (_jsx(ProtectedRoute, { children: _jsx(Layout, {}) })),
        children: [
            {
                index: true,
                element: _jsx(Navigate, { to: "/dashboard", replace: true })
            },
            {
                path: 'dashboard',
                element: _jsx(Dashboard, {})
            },
            {
                path: 'things',
                element: _jsx(Things, {})
            },
            {
                path: 'things/:id',
                element: _jsx(ThingDetail, {})
            },
            {
                path: 'things/discover',
                element: _jsx("div", { children: "Thing Discovery Page" })
            },
            {
                path: 'things/create',
                element: _jsx(TDEditorPage, {})
            },
            {
                path: 'things/editor',
                element: _jsx(TDEditorPage, {})
            },
            {
                path: 'visualization',
                element: _jsx(Visualization, {})
            },
            {
                path: 'monitoring',
                element: _jsx(MonitoringDashboard, {})
            },
            {
                path: 'monitoring/live',
                element: _jsx(LiveData, {})
            },
            {
                path: 'monitoring/events',
                element: _jsx(Events, {})
            },
            {
                path: 'monitoring/alerts',
                element: _jsx(Alerts, {})
            },
            {
                path: 'streams/*',
                element: _jsx("div", { children: "Streams Pages" })
            },
            {
                path: 'settings/*',
                element: _jsx("div", { children: "Settings Pages" })
            }
        ]
    }
]);
function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(ThemeProvider, { defaultTheme: "system", storageKey: "twingate-ui-theme", children: [_jsx(RouterProvider, { router: router }), _jsx(Toaster, {}), import.meta.env.DEV && _jsx(ReactQueryDevtools, { initialIsOpen: false })] }) }));
}
export default App;
