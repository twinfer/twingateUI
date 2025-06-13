# W3C WoT Dashboard - Chapter 2: Technology Stack & Project Setup

## Technology Stack

### Core Dependencies
```json
{
  "dependencies": {
    // Core React
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    
    // UI Components
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.309.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    
    // State Management
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.17.0",
    
    // Forms & Validation
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    
    // WoT Tools
    "@eclipse-wot/editdor": "^1.0.0",
    "@thingweb/playground": "^1.0.0",
    
    // 3D Visualization
    "iot-cardboardjs": "^1.0.0",
    "three": "^0.160.0",
    
    // API & Real-time
    "axios": "^1.6.0",
    "eventsource": "^2.0.0"
  },
  
  "devDependencies": {
    // Build Tools
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    
    // Code Quality
    "eslint": "^8.56.0",
    "prettier": "^3.2.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    
    // Testing
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.0"
  }
}
```

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@wot': path.resolve(__dirname, './src/features/wot'),
      '@ui': path.resolve(__dirname, './src/components/ui')
    }
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true
      },
      '/sse': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        ws: true
      }
    }
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', 'lucide-react'],
          'wot-tools': ['@eclipse-wot/editdor', '@thingweb/playground'],
          '3d-vendor': ['three', 'iot-cardboardjs']
        }
      }
    }
  }
});
```

### Project Structure
```
src/
├── main.tsx                    # App entry point
├── app.tsx                     # Root component with providers
├── router.tsx                  # Route definitions
│
├── api/                        # API layer
│   ├── client.ts              # Axios instance
│   ├── hooks/                 # TanStack Query hooks
│   └── services/              # API service classes
│
├── components/                 # Shared components
│   ├── ui/                    # Shadcn/UI components
│   ├── layout/                # Layout components
│   └── common/                # Common components
│
├── features/                   # Feature modules
│   ├── auth/                  # Authentication
│   ├── things/                # Thing management
│   ├── wot/                   # WoT tools integration
│   │   ├── editor/           # Eclipse editdor wrapper
│   │   ├── playground/       # ThingWeb playground wrapper
│   │   └── validation/       # TD validation logic
│   ├── visualization/         # 3D visualization
│   └── streams/              # Benthos streams
│
├── hooks/                     # Global hooks
├── stores/                    # Zustand stores
├── types/                     # TypeScript types
├── lib/                       # Utilities
└── styles/                    # Global styles
```

### Environment Configuration
```bash
# .env.development
VITE_API_URL=http://localhost:8080
VITE_SSE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
VITE_ENABLE_WOT_TOOLS=true
VITE_ENABLE_3D_VISUALIZATION=true

# .env.production
VITE_API_URL=https://api.production.com
VITE_SSE_URL=https://api.production.com
VITE_WS_URL=wss://api.production.com
VITE_ENABLE_WOT_TOOLS=true
VITE_ENABLE_3D_VISUALIZATION=true
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"],
      "@wot/*": ["./src/features/wot/*"],
      "@ui/*": ["./src/components/ui/*"]
    },
    "types": ["vite/client", "node"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}