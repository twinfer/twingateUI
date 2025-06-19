import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStatus, useLogin } from '../useAuth'
import { useAuthStore } from '@/stores/authStore'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAuthStatus', () => {
  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.getState().clearAuth()
  })

  it('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuthStatus(), { wrapper: createWrapper() })
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns correct permission check', () => {
    const { result } = renderHook(() => useAuthStatus(), { wrapper: createWrapper() })
    
    expect(result.current.hasPermission('read')).toBe(false)
    expect(result.current.isAdmin()).toBe(false)
  })

  it('handles authenticated state', () => {
    // Simulate authenticated state
    act(() => {
      useAuthStore.getState().setAuth({
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
          permissions: ['read', 'write']
        },
        token: 'test-token'
      })
    })

    const { result } = renderHook(() => useAuthStatus(), { wrapper: createWrapper() })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toMatchObject({
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      permissions: ['read', 'write']
    })
  })
})