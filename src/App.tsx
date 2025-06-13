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
import { Toaster } from './components/ui/sonner'
import { queryClient } from './config/queryClient'
import { validateEnv } from './config/env'

// Validate environment variables on app startup
validateEnv()

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'things',
        element: <Things />
      },
      {
        path: 'things/:id',
        element: <ThingDetail />
      },
      {
        path: 'things/discover',
        element: <div>Thing Discovery Page</div>
      },
      {
        path: 'things/create',
        element: <TDEditorPage />
      },
      {
        path: 'things/editor',
        element: <TDEditorPage />
      },
      {
        path: 'visualization',
        element: <Visualization />
      },
      {
        path: 'monitoring/*',
        element: <div>Monitoring Pages</div>
      },
      {
        path: 'streams/*',
        element: <div>Streams Pages</div>
      },
      {
        path: 'settings/*',
        element: <div>Settings Pages</div>
      }
    ]
  }
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="twingate-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
