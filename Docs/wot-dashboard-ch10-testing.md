# W3C WoT Dashboard - Chapter 10: Testing & Development Workflow

## Testing Strategy

### Testing Architecture
```typescript
// test/setup.ts
interface TestingStack {
  unit: {
    framework: 'Vitest';
    utilities: ['@testing-library/react', '@testing-library/user-event'];
  };
  integration: {
    api: 'MSW (Mock Service Worker)';
    database: 'In-memory SQLite';
  };
  e2e: {
    framework: 'Playwright';
    browsers: ['chromium', 'firefox', 'webkit'];
  };
  visual: {
    tool: 'Storybook';
    regression: 'Chromatic';
  };
}
```

### Unit Testing

#### Component Testing
```typescript
// __tests__/components/ThingCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThingCard } from '@/components/things/ThingCard';
import { mockThingDescription } from '@/test/mocks';

describe('ThingCard', () => {
  const mockHandlers = {
    onSelect: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders thing information correctly', () => {
    render(<ThingCard thing={mockThingDescription} {...mockHandlers} />);
    
    expect(screen.getByText(mockThingDescription.title)).toBeInTheDocument();
    expect(screen.getByText(mockThingDescription.description)).toBeInTheDocument();
    expect(screen.getByTestId('status-indicator')).toHaveClass('status-online');
  });
  
  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<ThingCard thing={mockThingDescription} {...mockHandlers} />);
    
    // Click on card
    await user.click(screen.getByRole('article'));
    expect(mockHandlers.onSelect).toHaveBeenCalledWith(mockThingDescription.id);
    
    // Click edit button
    await user.click(screen.getByLabelText('Edit thing'));
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockThingDescription.id);
  });
  
  it('displays property count correctly', () => {
    const thingWithProperties = {
      ...mockThingDescription,
      properties: {
        temperature: mockPropertyAffordance,
        humidity: mockPropertyAffordance
      }
    };
    
    render(<ThingCard thing={thingWithProperties} {...mockHandlers} />);
    
    expect(screen.getByText('2 Properties')).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// __tests__/hooks/useThings.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThings } from '@/api/hooks/useThings';
import { server } from '@/test/server';
import { rest } from 'msw';

describe('useThings', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });
    
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
  
  it('fetches things successfully', async () => {
    const { result } = renderHook(() => useThings(), {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data?.things.size).toBe(3);
  });
  
  it('handles API errors', async () => {
    server.use(
      rest.get('/api/things', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    const { result } = renderHook(() => useThings(), {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});
```

### Integration Testing

#### API Mocking with MSW
```typescript
// test/mocks/handlers.ts
import { rest } from 'msw';
import { mockThings, mockStreams } from './data';

export const handlers = [
  // Things endpoints
  rest.get('/api/things', (req, res, ctx) => {
    const limit = Number(req.url.searchParams.get('limit')) || 100;
    const offset = Number(req.url.searchParams.get('offset')) || 0;
    
    const paginatedThings = mockThings.slice(offset, offset + limit);
    
    return res(
      ctx.status(200),
      ctx.json({
        things: paginatedThings,
        total: mockThings.length,
        limit,
        offset
      })
    );
  }),
  
  rest.post('/api/things', async (req, res, ctx) => {
    const body = await req.json();
    const td = JSON.parse(body.thing_description);
    
    // Validate TD
    if (!td.title) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Title is required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        thing_description: { ...td, id: 'new-thing-id' },
        registration_result: { success: true }
      })
    );
  }),
  
  // SSE endpoint
  rest.get('/api/things/:thingId/properties/:propertyName', (req, res, ctx) => {
    const stream = new ReadableStream({
      start(controller) {
        const interval = setInterval(() => {
          const event = `data: ${JSON.stringify({
            value: Math.random() * 100,
            timestamp: new Date().toISOString()
          })}\n\n`;
          
          controller.enqueue(new TextEncoder().encode(event));
        }, 1000);
        
        // Cleanup
        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });
    
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'text/event-stream'),
      ctx.body(stream)
    );
  })
];
```

### E2E Testing

#### Playwright Tests
```typescript
// e2e/things-management.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Things Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/things');
  });
  
  test('should list things', async ({ page }) => {
    // Wait for things to load
    await page.waitForSelector('[data-testid="thing-card"]');
    
    // Check if things are displayed
    const thingCards = page.locator('[data-testid="thing-card"]');
    await expect(thingCards).toHaveCount(10); // Default page size
    
    // Check pagination
    await expect(page.locator('text=Showing 1-10 of 25')).toBeVisible();
  });
  
  test('should create new thing', async ({ page }) => {
    // Click create button
    await page.click('button:has-text("New Thing")');
    
    // Fill form using visual editor
    await page.fill('input[name="title"]', 'Test Sensor');
    await page.fill('textarea[name="description"]', 'A test temperature sensor');
    
    // Add property
    await page.click('button:has-text("Add Property")');
    await page.fill('input[name="properties[0].name"]', 'temperature');
    await page.selectOption('select[name="properties[0].type"]', 'number');
    await page.fill('input[name="properties[0].unit"]', 'celsius');
    
    // Save
    await page.click('button:has-text("Create Thing")');
    
    // Verify success
    await expect(page.locator('text=Thing created successfully')).toBeVisible();
    await expect(page.locator('text=Test Sensor')).toBeVisible();
  });
  
  test('should validate thing description', async ({ page }) => {
    await page.click('button:has-text("New Thing")');
    
    // Switch to JSON editor
    await page.click('button:has-text("JSON Editor")');
    
    // Enter invalid JSON
    await page.fill('textarea[data-testid="json-editor"]', '{ invalid json }');
    
    // Try to save
    await page.click('button:has-text("Create Thing")');
    
    // Check validation errors
    await expect(page.locator('text=Invalid JSON syntax')).toBeVisible();
  });
});
```

## Development Workflow

### Development Setup
```bash
# Development scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "storybook": "storybook dev -p 6006",
    "validate": "npm run type-check && npm run lint && npm run test"
  }
}
```

### Git Hooks with Husky
```typescript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Type check
npm run type-check

# Lint staged files
npx lint-staged

# Run affected tests
npm run test -- --changed
```

### Code Quality Tools

#### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    // React rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    
    // TypeScript rules
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_' 
    }],
    
    // Custom rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error'
  }
};
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm run test:coverage
      
      - name: Build
        run: npm run build
      
      - name: E2E tests
        run: |
          npx playwright install --with-deps
          npm run e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Performance Monitoring

### Performance Testing
```typescript
// test/performance/dashboard.perf.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('dashboard should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => ({
      lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
      fid: performance.getEntriesByName('first-input')[0]?.processingStart,
      cls: performance.getEntriesByName('layout-shift')?.reduce((sum, entry) => sum + entry.value, 0)
    }));
    
    expect(metrics.lcp).toBeLessThan(2500); // Good LCP
    expect(metrics.cls).toBeLessThan(0.1);  // Good CLS
  });
});
```

### Bundle Analysis
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... other plugins
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```