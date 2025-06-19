import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'

export const customInstance = <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const token = useAuthStore.getState().token
  const fullUrl = `${env.API_BASE_URL}${url}`

  const requestConfig: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  }

  return fetch(fullUrl, requestConfig).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  })
}

export default customInstance