import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from './components/theme-provider'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { Things } from './pages/Things'
import { ThingDetail } from './pages/ThingDetail'
import { TDEditorPage } from './pages/TDEditor'
import { Visualization } from './pages/Visualization'
import { Login } from './pages/Login'
import { LiveData } from './pages/monitoring/LiveData'
import { Events } from './pages/monitoring/Events'
import { Alerts } from './pages/monitoring/Alerts'
import { MonitoringDashboard } from './pages/monitoring/MonitoringDashboard'
import { ErrorBoundary, RouteErrorElement } from './components/ErrorBoundary'
import { Toaster } from './components/ui/sonner'
import { queryClient } from './config/queryClient'
import { validateEnv } from './config/env'

// Validate environment variables on app startup
validateEnv()

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <RouteErrorElement />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'things',
        element: <Things />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'things/:id',
        element: <ThingDetail />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'things/discover',
        element: <div>Thing Discovery Page</div>,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'things/create',
        element: <TDEditorPage />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'things/editor',
        element: <TDEditorPage />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'visualization',
        element: <Visualization />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'monitoring',
        element: <MonitoringDashboard />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'monitoring/live',
        element: <LiveData />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'monitoring/events',
        element: <Events />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'monitoring/alerts',
        element: <Alerts />,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'streams/*',
        element: <div>Streams Pages</div>,
        errorElement: <RouteErrorElement />
      },
      {
        path: 'settings/*',
        element: <div>Settings Pages</div>,
        errorElement: <RouteErrorElement />
      }
    ]
  }
])

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="twingate-ui-theme">
          <RouterProvider router={router} />
          <Toaster />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
