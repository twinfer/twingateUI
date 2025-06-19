# Testing Strategy

## Overview

This project uses a comprehensive testing setup with Vitest, React Testing Library, and MSW for robust test coverage across components, hooks, and services.

## Testing Stack

- **Vitest**: Modern test runner with fast execution and built-in TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **@vitest/coverage-v8**: Code coverage reporting

## Test Structure

```
src/
├── test/
│   ├── setup.ts              # Global test setup and configuration
│   ├── test-utils.tsx        # Custom render functions and test utilities
│   └── mocks/
│       ├── server.ts         # MSW server setup for Node.js
│       ├── browser.ts        # MSW browser setup (optional)
│       └── handlers.ts       # API mock handlers
├── services/__tests__/       # Service layer tests
├── hooks/__tests__/          # Custom hook tests
└── components/**/__tests__/  # Component tests organized by feature
```

## Testing Commands

```bash
# Run all tests
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Testing Patterns

### Component Testing

Components are tested using React Testing Library with focus on user interactions:

```typescript
import { render, screen } from '@/test/test-utils'
import { ThingCard } from '../ThingCard'
import { createMockThing } from '@/test/test-utils'

describe('ThingCard', () => {
  it('renders thing information correctly', () => {
    const mockThing = createMockThing({
      title: 'Temperature Sensor',
      description: 'A smart temperature sensor',
    })
    
    render(<ThingCard thing={mockThing} />)
    
    expect(screen.getByText('Temperature Sensor')).toBeInTheDocument()
    expect(screen.getByText('A smart temperature sensor')).toBeInTheDocument()
  })
})
```

### Hook Testing

Custom hooks are tested with renderHook and appropriate providers:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useAuthStatus } from '../useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  return ({ children }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAuthStatus', () => {
  it('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuthStatus(), { wrapper: createWrapper() })
    
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

### Service Testing

Services are tested with MSW for API mocking:

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { discoveryService } from '../discoveryService'

describe('DiscoveryService', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('successfully discovers a Thing from URL', async () => {
    const mockTD = { /* Thing Description */ }
    
    server.use(
      http.get('http://example.com/thing.json', () => {
        return HttpResponse.json(mockTD)
      })
    )
    
    const result = await discoveryService.discoverSingleThing('http://example.com/thing.json')
    expect(result.title).toBe('Test Thing')
  })
})
```

## Mock Setup

### MSW Handlers

API endpoints are mocked in `src/test/mocks/handlers.ts`:

```typescript
export const handlers = [
  // Things API
  http.get(`${API_BASE}/api/things`, () => HttpResponse.json(mockThingsList())),
  http.post(`${API_BASE}/api/things`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(newThing, { status: 201 })
  }),
  
  // Discovery API
  http.get(/\.well-known\/wot$/, () => HttpResponse.json(mockDirectory)),
  
  // Auth API
  http.post(`${API_BASE}/api/auth/login`, async ({ request }) => {
    const { email, password } = await request.json()
    if (email === 'admin@example.com' && password === 'password') {
      return HttpResponse.json(mockAuthResponse)
    }
    return new HttpResponse(null, { status: 401 })
  })
]
```

### Test Utilities

Reusable test utilities in `src/test/test-utils.tsx`:

```typescript
// Custom render with providers
export const render = (ui: React.ReactElement, options = {}) => {
  return customRender(ui, {
    wrapper: ({ children }) => (
      <TestProviders>{children}</TestProviders>
    ),
    ...options
  })
}

// Mock data factories
export const createMockThing = (overrides = {}) => ({
  id: 'test-thing-1',
  title: 'Test Thing',
  thingDescription: { /* TD structure */ },
  ...overrides
})
```

## Coverage Configuration

Coverage is configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'src/api/generated/', // Exclude generated API code
      ]
    }
  }
})
```

## Testing Guidelines

### 1. Test Organization
- Group tests by feature/component
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Component Testing
- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility and keyboard navigation

### 3. Integration Testing
- Use MSW for API interactions
- Test complete user workflows
- Include error scenarios

### 4. Performance Testing
- Test components with large datasets
- Verify loading states and error boundaries
- Test responsive behavior

### 5. Best Practices
- Mock external dependencies
- Use real data structures when possible
- Keep tests focused and isolated
- Write tests first for new features

## Coverage Targets

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Current coverage can be viewed by running `npm run test:coverage`.

## CI/CD Integration

Tests are configured to run in CI with the following commands:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run type checking
npm run build

# Run tests with coverage
npm run test:coverage
```

## Future Enhancements

1. **E2E Testing**: Add Playwright for end-to-end testing
2. **Performance Testing**: Add performance benchmarks
3. **Visual Regression**: Add screenshot testing
4. **A11y Testing**: Expand accessibility test coverage
5. **Load Testing**: Test with large datasets and concurrent users