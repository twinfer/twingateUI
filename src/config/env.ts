// Type-safe environment configuration
export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  
  // Authentication
  AUTH_TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || 'twingate_auth_token',
  AUTH_REFRESH_TOKEN_KEY: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'twingate_refresh_token',
  
  // Discovery
  DISCOVERY_TIMEOUT: Number(import.meta.env.VITE_DISCOVERY_TIMEOUT) || 30000,
  WELL_KNOWN_PATH: import.meta.env.VITE_WELL_KNOWN_PATH || '/.well-known/wot',
  
  // WebSocket/SSE
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  SSE_URL: import.meta.env.VITE_SSE_URL || 'http://localhost:8080/events',
  
  // Feature Flags
  ENABLE_3D_VISUALIZATION: import.meta.env.VITE_ENABLE_3D_VISUALIZATION === 'true',
  ENABLE_STREAM_EDITOR: import.meta.env.VITE_ENABLE_STREAM_EDITOR === 'true',
  ENABLE_TD_PLAYGROUND: import.meta.env.VITE_ENABLE_TD_PLAYGROUND === 'true',
} as const

// Validate required environment variables
const requiredEnvVars = ['API_BASE_URL'] as const

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// API URL builder
export function buildApiUrl(path: string): string {
  const baseUrl = env.API_BASE_URL.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  return `${baseUrl}/${env.API_VERSION}/${cleanPath}`
}

export type EnvConfig = typeof env