# W3C WoT Dashboard - Chapter 1: Executive Summary & Architecture

## Executive Summary

The W3C WoT Dashboard is a modern single-page application (SPA) built with Vite and React, designed to manage and visualize IoT devices through the TwinCore Gateway API. It integrates advanced WoT tooling for Thing Description authoring and validation while providing real-time 3D visualization capabilities.

### Key Features
- **WoT-Compliant Thing Management**: Full CRUD with integrated TD validation
- **Visual TD Authoring**: Eclipse editdor integration for graphical editing
- **TD Validation**: Eclipse thingweb/playground for testing and validation
- **3D Visualization**: IoT-CardboardJS for spatial device representation
- **Real-time Monitoring**: Live updates via Server-Sent Events (SSE)
- **Stream Processing**: Visual Benthos pipeline configuration

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend SPA (Vite + React)                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    React    │  │   Shadcn/UI  │  │ IoT-CardboardJS  │  │
│  │    Router   │  │  Components  │  │  Visualization   │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Eclipse    │  │   ThingWeb   │  │     Zustand     │  │
│  │   editdor   │  │  Playground  │  │  State Mgmt     │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Reverse Proxy   │
                    │     (Nginx)       │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    TwinCore Gateway API                      │
├─────────────────────────────────────────────────────────────┤
│  RESTful API  │  WebSocket  │  Server-Sent Events (SSE)    │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture Layers

```typescript
// Core architecture interfaces
interface AppArchitecture {
  presentation: {
    framework: 'React 18.2+';
    ui: 'Shadcn/UI';
    styling: 'Tailwind CSS';
    icons: 'Lucide React';
  };
  
  routing: {
    library: 'React Router v6';
    type: 'Client-side SPA';
    authGuard: 'Route-level protection';
  };
  
  state: {
    global: 'Zustand 4.5+';
    server: 'TanStack Query v5';
    forms: 'React Hook Form + Zod';
  };
  
  build: {
    tool: 'Vite 5.0+';
    language: 'TypeScript 5.3+';
    target: 'ES2022';
  };
  
  wotTools: {
    editor: '@eclipse-wot/editdor';
    validator: '@thingweb/playground';
    visualization: 'iot-cardboardjs';
  };
}
```

### Deployment Architecture

```yaml
# Docker Compose architecture
services:
  frontend:
    build: ./frontend
    environment:
      - VITE_API_URL=${API_URL}
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
      
  api:
    image: twincore/gateway:latest
    ports:
      - "8080:8080"
      
  redis:
    image: redis:alpine
    # For caching TD validation results
```

### Key Design Decisions

1. **SPA with Vite**: Optimized for development speed and bundle size
2. **Integrated WoT Tools**: Native integration of Eclipse WoT ecosystem
3. **Modular Architecture**: Feature-based code organization
4. **Type Safety**: Full TypeScript with Zod runtime validation
5. **Performance First**: Lazy loading, code splitting, and caching strategies