import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService, LoginCredentials } from '@/services/authService'
import { queryKeys } from '@/config/queryClient'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/stores/uiStore'
import { useNavigate } from 'react-router-dom'

export function useLogin() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user })
      
      showToast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.name}!`,
        type: 'success',
      })
      
      // Redirect to dashboard
      navigate('/dashboard')
    },
    onError: (error: Error) => {
      showToast({
        title: 'Login failed',
        description: error.message,
        type: 'error',
      })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear()
      
      showToast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        type: 'info',
      })
      
      // Redirect to login
      navigate('/login')
    },
    onError: (error: Error) => {
      showToast({
        title: 'Logout failed',
        description: error.message,
        type: 'error',
      })
    },
  })
}

export function useCurrentUser() {
  const { isAuthenticated, user } = useAuthStore()

  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if unauthorized
      if (error?.status === 401) {
        return false
      }
      return failureCount < 3
    },
    initialData: user || undefined,
  })
}

export function useRefreshToken() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: () => {
      // Invalidate user queries to refetch with new token
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user })
    },
    onError: (error: Error) => {
      showToast({
        title: 'Session expired',
        description: error.message,
        type: 'error',
      })
    },
  })
}

export function useChangePassword() {
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      authService.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      showToast({
        title: 'Password changed',
        description: 'Your password has been successfully updated.',
        type: 'success',
      })
    },
    onError: (error: Error) => {
      showToast({
        title: 'Password change failed',
        description: error.message,
        type: 'error',
      })
    },
  })
}

// Helper hook for checking authentication status
export function useAuthStatus() {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser()

  return {
    isAuthenticated,
    user: currentUser || user,
    isLoading: isLoading || isUserLoading,
    hasPermission: (permission: string) => 
      currentUser?.permissions.includes(permission) ?? false,
    isAdmin: () => 
      currentUser?.role === 'admin',
  }
}