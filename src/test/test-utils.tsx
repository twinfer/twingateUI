import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'

// Create a test-specific query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  initialRoute?: string
}

// Test providers wrapper
function TestProviders({ 
  children, 
  queryClient, 
  initialRoute = '/' 
}: { 
  children: React.ReactNode
  queryClient?: QueryClient
  initialRoute?: string
}) {
  const testQueryClient = queryClient || createTestQueryClient()

  // Set initial route if provided
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute)
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, initialRoute, ...renderOptions } = options

  return {
    ...render(ui, {
      wrapper: ({ children }) => (
        <TestProviders queryClient={queryClient} initialRoute={initialRoute}>
          {children}
        </TestProviders>
      ),
      ...renderOptions,
    }),
    queryClient: queryClient || createTestQueryClient(),
  }
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }

// Helper utilities for testing
export const waitForLoadingToFinish = () => 
  new Promise((resolve) => setTimeout(resolve, 0))

export const createMockThing = (overrides = {}) => ({
  id: 'test-thing-1',
  title: 'Test Thing',
  description: 'A test Thing Description',
  status: 'online',
  discoveryMethod: 'manual',
  lastSeen: new Date().toISOString(),
  url: 'http://example.com/thing',
  thingDescription: {
    '@context': 'https://www.w3.org/2019/wot/td/v1',
    '@type': 'Thing',
    id: 'test-thing-1',
    title: 'Test Thing',
    description: 'A test Thing Description',
    security: ['nosec_sc'],
    securityDefinitions: {
      nosec_sc: { scheme: 'nosec' }
    },
    properties: {
      status: {
        type: 'string',
        readOnly: true
      }
    },
  },
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  permissions: ['read', 'write'],
  ...overrides,
})