# W3C WoT Dashboard - Chapter 3: UI/UX Design & Component System

## Design System

### Theme Configuration
```typescript
// lib/theme.ts
export const theme = {
  colors: {
    // Semantic colors for IoT states
    device: {
      online: 'hsl(142, 76%, 36%)',
      offline: 'hsl(0, 84%, 60%)',
      warning: 'hsl(45, 93%, 47%)',
      unknown: 'hsl(220, 9%, 46%)'
    },
    
    // WoT specific colors
    wot: {
      property: 'hsl(199, 89%, 48%)',
      action: 'hsl(262, 83%, 58%)',
      event: 'hsl(45, 93%, 47%)',
      thing: 'hsl(142, 76%, 36%)'
    }
  },
  
  spacing: {
    dashboard: {
      header: '64px',
      sidebar: '260px',
      sidebarCollapsed: '64px'
    }
  }
};
```

### Layout Components

#### Dashboard Layout
```tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: boolean;
}

// Main layout structure with collapsible sidebar
// Header: Fixed position with user menu and theme toggle
// Sidebar: Navigation with icons and labels
// Content: Scrollable main area with responsive padding
```

#### Responsive Grid System
```tsx
// Responsive grid for dashboard widgets
const gridVariants = {
  dashboard: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6',
  detail: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
  form: 'grid grid-cols-1 md:grid-cols-2 gap-4'
};
```

## Core UI Components

### Thing Card Component
```tsx
interface ThingCardProps {
  thing: ThingDescription;
  view: 'grid' | 'list';
  actions?: {
    onView?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
  };
}

// Visual features:
// - Status indicator (online/offline)
// - Type badges (Device, Sensor, Actuator)
// - Property/Action/Event counters
// - Hover state with elevation
// - Quick action buttons
```

### Property Monitor Widget
```tsx
interface PropertyMonitorProps {
  thingId: string;
  property: PropertyAffordance;
  mode: 'compact' | 'detailed';
}

// Display modes:
// Compact: Value + unit + sparkline
// Detailed: Value + chart + controls + metadata
// Real-time updates via SSE
// Write controls for writable properties
```

### WoT Editor Integration
```tsx
interface WoTEditorProps {
  initialTD?: ThingDescription;
  mode: 'create' | 'edit';
  onSave: (td: ThingDescription) => void;
}

// Features:
// - Split view: Visual editor + JSON
// - Real-time validation
// - Auto-completion
// - Property/Action/Event builders
// - Import/Export functionality
```

## Page Layouts

### Dashboard Page
```
┌─────────────────────────────────────────────────┐
│ System Overview                                 │
├───────────────┬───────────────┬────────────────┤
│ Active Things │ Active Streams │ Events/Sec     │
│      125      │       89       │    1,234       │
├───────────────┴───────────────┴────────────────┤
│ Recent Activities Timeline                      │
├─────────────────────────────────────────────────┤
│ Quick Actions Grid                              │
│ [+Thing] [+Stream] [Discover] [Validate]        │
└─────────────────────────────────────────────────┘
```

### Things Management Page
```
┌─────────────────────────────────────────────────┐
│ [Search...] [Filter▼] [View▼]    [+New Thing]  │
├─────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│ │Thing│ │Thing│ │Thing│ │Thing│  Grid View    │
│ │Card │ │Card │ │Card │ │Card │              │
│ └─────┘ └─────┘ └─────┘ └─────┘              │
├─────────────────────────────────────────────────┤
│ [1] [2] [3] ... [10]  Showing 1-12 of 125     │
└─────────────────────────────────────────────────┘
```

### Thing Detail Page
```
┌─────────────────────────────────────────────────┐
│ ← Back  Thing: Smart Sensor 001    [Edit] [⋮]  │
├─────────────────────┬───────────────────────────┤
│ 3D Visualization    │ Properties               │
│ [IoT-CardboardJS]   │ ├─ temperature: 23.5°C   │
│                     │ ├─ humidity: 45%         │
│                     │ └─ pressure: 1013 hPa    │
├─────────────────────┼───────────────────────────┤
│ Actions             │ Events                   │
│ ├─ calibrate()      │ ├─ highTemp             │
│ └─ reset()          │ └─ lowBattery           │
└─────────────────────┴───────────────────────────┘
```

## Interactive States

### Component States
```css
/* Base state */
.thing-card {
  @apply border border-border bg-card;
}

/* Hover state */
.thing-card:hover {
  @apply shadow-lg border-primary/20;
}

/* Selected state */
.thing-card[data-selected="true"] {
  @apply ring-2 ring-primary;
}

/* Loading state */
.thing-card[data-loading="true"] {
  @apply opacity-60 pointer-events-none;
}
```

### Animation Patterns
```typescript
// Consistent animation timings
export const animations = {
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-300',
  slow: 'transition-all duration-500',
  
  // Specific animations
  slideIn: 'animate-in slide-in-from-right',
  fadeIn: 'animate-in fade-in-0',
  spin: 'animate-spin'
};
```

## Accessibility Features

### ARIA Labels and Roles
```tsx
// Proper ARIA implementation
<Card
  role="article"
  aria-label={`Thing: ${thing.title}`}
  aria-describedby={`thing-desc-${thing.id}`}
>
  <CardHeader>
    <CardTitle id={`thing-title-${thing.id}`}>
      {thing.title}
    </CardTitle>
  </CardHeader>
</Card>
```

### Keyboard Navigation
```typescript
// Keyboard shortcuts
const shortcuts = {
  'cmd+k': 'Open command palette',
  'cmd+/': 'Toggle search',
  'cmd+b': 'Toggle sidebar',
  'cmd+n': 'Create new thing',
  'esc': 'Close modal/drawer'
};
```