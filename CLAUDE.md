# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TwingateUI is a W3C Web of Things (WoT) dashboard application that provides a modern interface for managing IoT devices through the TwinCore Gateway API. It features Thing Description editing, discovery management, real-time monitoring, and comprehensive WoT device management.

## Tech Stack

- **Frontend**: React 19.1.0 with TypeScript 5.8.3
- **Build Tool**: Vite 6.3.5 with path aliases (@/* → ./src/*)
- **Styling**: Tailwind CSS v4 with shadcn/ui components (Radix UI based)
- **State Management**: Zustand v5 with persistence middleware
- **Data Fetching**: TanStack Query v5 with React Query DevTools
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form v7 with Zod validation
- **Notifications**: Sonner for toast notifications
- **Theming**: next-themes for dark/light mode
- **Code Editor**: Monaco Editor for Thing Description editing
- **API Client**: Auto-generated TypeScript client from OpenAPI spec
- **Icons**: Lucide React

## Essential Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start development server with HMR
npm run build           # Build for production (runs tsc && vite build)
npm run preview         # Preview production build locally

# Code Quality
npm run lint            # Run ESLint on all files

# API Client Generation
npm run openapi         # Generate TypeScript client from swagger/swagger.yaml
```

## Architecture Overview

### Source Structure
- `/src/api/generated/` - Auto-generated API client (DO NOT EDIT MANUALLY)
- `/src/components/` - React components organized by feature
  - `/ui/` - shadcn/ui base components (Radix UI based)
  - `/dashboard/` - Dashboard widgets and layout components
  - `/discovery/` - Thing discovery and preview components
  - `/td-editor/` - Thing Description editor components
  - `/thing-detail/` - Individual Thing detail views
  - `/things/` - Thing list and card components
- `/src/stores/` - Zustand state management
  - `authStore.ts` - Authentication state with persistence
  - `thingsStore.ts` - Things data and filtering state
  - `uiStore.ts` - UI state (modals, toasts, loading)
  - `discoveryEndpointsStore.ts` - Discovery endpoint management
- `/src/services/` - Business logic and API integration
  - `authService.ts` - Authentication service (mock implementation)
  - `discoveryService.ts` - WoT discovery service with validation
  - `api.ts` - API configuration factory
- `/src/hooks/` - Custom React hooks
  - `useAuth.ts` - Authentication hook
  - `useDiscovery.ts` - Discovery operations with TanStack Query
- `/src/config/` - Configuration and environment
  - `env.ts` - Type-safe environment configuration
  - `queryClient.ts` - TanStack Query configuration with cache keys
- `/src/data/` - Static data and templates
  - `tdTemplates.ts` - Thing Description templates and snippets
- `/src/mock/` - Mock data for development
  - `mockThingDescriptions.ts` - Sample Thing Descriptions
- `/src/pages/` - Route-level page components
- `/src/lib/` - Utility functions
- `/swagger/` - OpenAPI specification (swagger.yaml)

### Key Architectural Patterns

1. **State Management**: Uses Zustand for client state with persistent storage for auth and discovery endpoints. State is organized by domain (auth, things, UI, discovery).

2. **Data Fetching**: TanStack Query handles server state with proper caching, background updates, and error handling. Query keys are centralized in `queryClient.ts`.

3. **API Integration**: Auto-generated TypeScript client from OpenAPI spec. Always regenerate with `npm run openapi` after API changes.

4. **Component Architecture**: Feature-based organization with shadcn/ui base components. Components follow container/presentation patterns.

5. **Type Safety**: Strict TypeScript with comprehensive type definitions. Path alias `@/*` maps to `./src/*`.

6. **Discovery System**: Comprehensive WoT discovery with endpoint management, validation, and Thing import capabilities.

7. **Authentication**: Mock authentication system with JWT-style tokens for development. Real auth can be swapped in via service layer.

8. **Environment Configuration**: Type-safe environment variables with validation and sensible defaults.

## State Management Patterns

### Zustand Stores
The application uses four main Zustand stores:

1. **authStore.ts**: Authentication state with persistent storage
   - Mock authentication (admin@example.com / password)
   - JWT-style token management
   - User permissions and roles

2. **thingsStore.ts**: Thing data management and filtering
   - Things collection with CRUD operations
   - Advanced filtering (search, category, online status, tags, discovery endpoint)
   - Discovery state management (discovered things, import operations)
   - Property updates and 3D positioning

3. **uiStore.ts**: UI state management
   - Toast notifications (using Sonner)
   - Modal management
   - Loading states (global and page-specific)
   - Sidebar state

4. **discoveryEndpointsStore.ts**: Discovery endpoint management
   - WoT discovery endpoints with persistence
   - Endpoint status and metadata
   - Default endpoints (Local, Eclipse Thingweb)

### Store Usage Patterns
- Import stores directly: `import { useThingsStore } from '@/stores/thingsStore'`
- Use selectors for performance: `const things = useThingsStore(state => state.things)`
- Access store actions: `const { addThing } = useThingsStore()`
- Convenience hooks available in `/src/stores/index.ts`

## Development Workflows

### Authentication Development
- Use mock credentials: `admin@example.com` / `password`
- Authentication state persists across sessions
- Protected routes automatically redirect to login
- Mock JWT tokens for API integration

### Thing Discovery Workflow
1. Add discovery endpoints via UI or use defaults
2. Scan endpoints using `.well-known/wot` protocol
3. Preview discovered Things with validation
4. Import selected Things to main collection
5. Filter Things by discovery endpoint

### Thing Description Editing
- Use templates from `/src/data/tdTemplates.ts`
- Monaco Editor with syntax highlighting
- Real-time validation using browser-compatible validator
- Categories: basic, sensor, actuator, complex, security

### Mock Data Usage
- Mock Thing Descriptions in `/src/mock/mockThingDescriptions.ts`
- Mock discovery responses for development
- Eclipse Thingweb test Things included
- Use for development without real WoT devices

## Development Notes

1. **API Client**: Never manually edit files in `/src/api/generated/`. Use `npm run openapi` to regenerate from the swagger spec.

2. **State Persistence**: Auth and discovery endpoints persist to localStorage automatically.

3. **Environment Variables**: Configure in `.env` files, accessed via `/src/config/env.ts` with validation.

4. **Query Cache**: TanStack Query keys centralized in `queryClient.ts` for consistent cache management.

5. **Component Imports**: Use path alias `@/*` for all src imports. Import UI components from `@/components/ui/`.

6. **Toast Notifications**: Use `useToast()` hook from `uiStore` for consistent notifications.

7. **Thing Validation**: Browser-compatible TD validation in `simpleTdValidation.ts` service.

8. **Build Output**: Production builds output to `dist/` directory.

## Development Guidance

### Component Development
- Use shadcn/ui components as base building blocks
- Follow feature-based organization in `/src/components/`
- Implement responsive design with Tailwind CSS
- Use proper TypeScript interfaces for all props

### Data Management
- Use TanStack Query for server state
- Use Zustand for client state
- Implement optimistic updates where appropriate
- Handle loading and error states consistently

### Forms and Validation
- Use React Hook Form with Zod schemas
- Implement proper error handling and display
- Use controlled components for complex forms
- Validate Thing Descriptions before saving

### Discovery Integration
- Use discovery hooks from `useDiscovery.ts`
- Handle discovery progress and cancellation
- Implement proper error handling for network failures
- Support multiple discovery endpoint formats