import { AuthApi } from '@/api/generated/src'
import { createApiConfiguration } from './api'
import { useAuthStore, User } from '@/stores/authStore'
import { env } from '@/config/env'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken?: string
}

class AuthService {
  private getApi() {
    return new AuthApi(createApiConfiguration())
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Since this API uses bearer token auth with external providers,
      // we'll simulate login for demo purposes
      if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
        // Mock successful login with a demo token
        const mockToken = 'demo-bearer-token-12345'
        const mockUser: User = {
          id: 'admin-user-123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
        }
        
        const loginResponse: LoginResponse = {
          user: mockUser,
          token: mockToken,
          refreshToken: 'demo-refresh-token-67890',
        }
        
        // Update auth store
        useAuthStore.getState().setAuth(
          loginResponse.user,
          loginResponse.token,
          loginResponse.refreshToken
        )
        
        return loginResponse
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Invalid email or password')
    }
  }

  async logout(): Promise<void> {
    try {
      // Since this API doesn't have a logout endpoint,
      // we just clear local state
      console.log('Logging out user...')
    } catch (error) {
      console.warn('Logout failed:', error)
    } finally {
      // Always clear local auth state
      useAuthStore.getState().clearAuth()
      // Clear tokens from localStorage
      localStorage.removeItem(env.AUTH_TOKEN_KEY)
      localStorage.removeItem(env.AUTH_REFRESH_TOKEN_KEY)
    }
  }

  async refreshToken(): Promise<string> {
    const { refreshToken } = useAuthStore.getState()
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      // Mock token refresh for demo
      const newToken = 'demo-bearer-token-refreshed-' + Date.now()
      const newRefreshToken = 'demo-refresh-token-refreshed-' + Date.now()
      
      // Update auth store with new tokens
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        useAuthStore.getState().setAuth(currentUser, newToken, newRefreshToken)
      }
      
      return newToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, clear auth state
      this.logout()
      throw new Error('Session expired. Please login again.')
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // For demo mode, return the current user from store
      // In production, this would call the API
      const currentUser = useAuthStore.getState().user
      
      if (currentUser) {
        return currentUser
      }
      
      // If no user in store, return mock user for demo
      const mockUser: User = {
        id: 'admin-user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
      }
      
      // Update user in auth store
      useAuthStore.getState().updateUser(mockUser)
      
      return mockUser
    } catch (error) {
      console.error('Get current user failed:', error)
      throw new Error('Failed to get user information')
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      // Mock password change for demo
      console.log('Password change simulated')
      // In a real implementation, this would call an API endpoint
      return Promise.resolve()
    } catch (error) {
      console.error('Change password failed:', error)
      throw new Error('Failed to change password')
    }
  }

  // Check if user is authenticated and token is valid
  isAuthenticated(): boolean {
    const { token, isAuthenticated } = useAuthStore.getState()
    return isAuthenticated && !!token
  }

  // Get current auth token
  getToken(): string | null {
    return useAuthStore.getState().token
  }
}

export const authService = new AuthService()