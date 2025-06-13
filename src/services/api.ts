import { Configuration } from '@/api/generated/src'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'

// Create base API configuration
export function createApiConfiguration(): Configuration {
  const token = useAuthStore.getState().token
  
  return new Configuration({
    basePath: env.API_BASE_URL,
    accessToken: token || undefined,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
}

// Create API configuration that updates with auth state
export function useApiConfiguration(): Configuration {
  const { token } = useAuthStore()
  
  return new Configuration({
    basePath: env.API_BASE_URL,
    accessToken: token || undefined,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
}