# Next Phase Development Plan - TwingateUI

## Current Status
✅ React Router integrated with sidebar navigation
✅ Basic page structure created (Dashboard, Things, Visualization)
✅ Layout component with SidebarProvider implemented

## Next Phase: Core Infrastructure & Authentication (3-4 days)

### Day 1: Dependencies & Environment Setup
**Morning:**
1. Install remaining core dependencies:
   ```bash
   npm install zustand @tanstack/react-query react-hook-form zod axios
   npm install -D @types/axios
   ```

2. Create environment configuration:
   - Create `.env` file with API endpoint
   - Create `src/config/env.ts` for type-safe environment variables
   - Set up API base URL configuration

**Afternoon:**
3. Set up TanStack Query:
   - Create QueryClient configuration
   - Add QueryClientProvider to App.tsx
   - Configure default query options (retry, stale time, etc.)

4. Initialize Zustand stores structure:
   - Create `src/stores/` directory
   - Set up auth store skeleton
   - Plan store architecture for Things, UI state, etc.

### Day 2: Authentication Implementation
**Morning:**
1. Create authentication store with Zustand:
   - User state management
   - Token storage (localStorage/sessionStorage)
   - Login/logout actions
   - Token refresh logic

2. Build authentication pages:
   - Login page with form validation (react-hook-form + zod)
   - Logout functionality
   - Password reset request page (optional)

**Afternoon:**
3. Implement protected routes:
   - Create `ProtectedRoute` wrapper component
   - Add authentication check to router
   - Redirect logic for unauthenticated users

4. API client authentication:
   - Create axios interceptor for auth tokens
   - Handle 401 responses with token refresh
   - Update generated API client configuration

### Day 3: API Integration Layer
**Morning:**
1. Create API hooks using TanStack Query:
   - `useAuth` - login, logout, refresh
   - `useThings` - list, create, update, delete
   - `useThingDetails` - get single Thing with TD
   - `useProperties` - read/write properties

2. Error handling setup:
   - Global error boundary
   - Toast notifications for API errors
   - Loading states with skeletons

**Afternoon:**
3. Test API integration:
   - Connect to actual TwinCore Gateway API
   - Verify authentication flow
   - Test basic CRUD operations

4. Create reusable API utilities:
   - Response type helpers
   - Error message extraction
   - Request cancellation support

### Day 4: Thing Discovery Foundation
**Morning:**
1. Research and implement .well-known/wot discovery:
   - Create discovery service
   - Handle multiple discovery protocols
   - Parse discovered Thing Descriptions

2. Build discovery UI components:
   - Discovery modal/page
   - Device scanning progress
   - Found devices list

**Afternoon:**
3. TD validation integration:
   - Integrate @thing-description-playground validators
   - Create validation feedback UI
   - Handle validation errors gracefully

## Next Sprint: Core Features (Week 2)

### Sprint Goals:
1. **Things Management**
   - Complete Things list with filtering/search
   - Thing detail page with property/action views
   - Basic CRUD operations working

2. **TD Authoring**
   - TD editor with syntax highlighting
   - Real-time validation
   - Templates and examples

3. **Dashboard**
   - Summary statistics
   - Recent activity
   - Quick actions

### Daily Breakdown:

**Day 1-2: Things List & Management**
- Implement Things list with pagination
- Add search and filter functionality
- Create Thing card component
- Implement create/edit/delete operations

**Day 3-4: Thing Details & Interactions**
- Build Thing detail page layout
- Display Thing Description in readable format
- Create property monitoring widgets
- Implement action invocation UI

**Day 5: TD Editor**
- Set up Monaco editor or similar
- Integrate TD Playground validation
- Add syntax highlighting for TD JSON-LD
- Create save/load functionality

**Day 6-7: Dashboard**
- Design dashboard layout
- Implement summary widgets
- Add activity feed
- Create quick action buttons

## Technical Considerations

### State Management Architecture
```typescript
// Proposed store structure
stores/
├── authStore.ts      // Authentication state
├── thingsStore.ts    // Things data and operations
├── uiStore.ts        // UI state (modals, sidebars, etc.)
├── discoveryStore.ts // Discovery state and results
└── apiStore.ts       // API configuration and status
```

### API Integration Pattern
```typescript
// Example hook pattern
export function useThings() {
  return useQuery({
    queryKey: ['things'],
    queryFn: async () => {
      const api = new ThingsApi(apiConfig);
      return api.getThings();
    },
  });
}
```

### Component Structure
```
components/
├── things/
│   ├── ThingCard.tsx
│   ├── ThingsList.tsx
│   ├── ThingDetail.tsx
│   └── ThingForm.tsx
├── discovery/
│   ├── DiscoveryModal.tsx
│   ├── DeviceScanner.tsx
│   └── DiscoveryResults.tsx
├── td-editor/
│   ├── TDEditor.tsx
│   ├── TDValidator.tsx
│   └── TDTemplates.tsx
└── common/
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    └── Toast.tsx
```

## Definition of Done
- [ ] All core dependencies installed
- [ ] Environment configuration working
- [ ] Authentication flow complete
- [ ] Protected routes implemented
- [ ] API integration layer ready
- [ ] Basic Things CRUD working
- [ ] Discovery UI skeleton created
- [ ] Error handling implemented
- [ ] Loading states added

## Risks & Mitigations
1. **API Compatibility**: Test with actual TwinCore Gateway early
2. **TD Validation Complexity**: Start with basic validation, enhance gradually
3. **Discovery Protocol Support**: Begin with HTTP, add other protocols later
4. **Performance**: Implement pagination and lazy loading from start

## Next Steps After This Phase
1. 3D Visualization with IoT CardboardJS
2. Real-time updates (SSE/WebSocket)
3. Stream processing editor
4. Advanced TD features