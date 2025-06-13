# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TwingateUI is a W3C Web of Things (WoT) dashboard application that provides a modern interface for managing IoT devices through the TwinCore Gateway API. It features 3D visualization of IoT devices, real-time monitoring, and visual stream processing configuration.

## Tech Stack

- **Frontend**: React 19.1.0 with TypeScript 5.8.3
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: Zustand
- **3D Visualization**: @microsoft/iot-cardboard-js
- **API Client**: Auto-generated TypeScript client from OpenAPI spec
- **WoT Tools**: Thing Description Playground libraries

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
- `/src/components/` - React components
  - `/ui/` - shadcn/ui base components (Radix UI based)
  - Application-specific components in root
- `/src/hooks/` - Custom React hooks
- `/src/lib/` - Utility functions
- `/swagger/` - OpenAPI specification (swagger.yaml)
- `/Docs/` - Comprehensive documentation (10 chapters)

### Key Architectural Patterns

1. **API Integration**: The application uses an auto-generated TypeScript client from the OpenAPI spec. Always regenerate the client after API changes using `npm run openapi`.

2. **Component Structure**: Uses shadcn/ui components built on Radix UI primitives. These are customizable and located in `/src/components/ui/`.

3. **Type Safety**: TypeScript with strict mode enabled. Path alias `@/*` maps to `./src/*`.

4. **Real-time Updates**: Implements Server-Sent Events (SSE) for real-time monitoring and WebSocket support for bidirectional communication.

5. **3D Visualization**: Integrates Microsoft IoT CardboardJS for spatial representation of IoT devices.

## Development Notes

1. **API Client**: Never manually edit files in `/src/api/generated/`. Use `npm run openapi` to regenerate from the swagger spec.

2. **Testing**: No test runner is currently configured. Testing strategy is documented in `/Docs/Chapter 10 - Testing.md`.

3. **Environment**: The project includes a `shell.nix` for consistent development environment with Python, ripgrep, and OpenAPI tools.

4. **Thing Descriptions**: The app works with W3C WoT Thing Descriptions. Validation is handled by Thing Description Playground libraries.

5. **Build Output**: Production builds output to `dist/` directory.

## Development Guidance

- Use shadcn/ui whenever possible