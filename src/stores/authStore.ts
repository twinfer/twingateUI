import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { env } from '@/config/env'

export interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  avatar?: string
}

export interface AuthState {
  // State
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setAuth: (user: User, token: string, refreshToken?: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          error: null,
        })
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setError: (error) => {
        set({ error })
      },

      updateUser: (userUpdate) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userUpdate },
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist essential auth data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Computed selectors
export const useAuth = () => {
  const store = useAuthStore()
  return {
    ...store,
    hasPermission: (permission: string) => 
      store.user?.permissions.includes(permission) ?? false,
    isAdmin: () => 
      store.user?.role === 'admin',
  }
}