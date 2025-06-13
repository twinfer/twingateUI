import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { queryKeys } from '@/config/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/stores/uiStore';
import { useNavigate } from 'react-router-dom';
export function useLogin() {
    var queryClient = useQueryClient();
    var showToast = useToast().showToast;
    var navigate = useNavigate();
    return useMutation({
        mutationFn: function (credentials) { return authService.login(credentials); },
        onSuccess: function (data) {
            // Invalidate and refetch user-related queries
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
            showToast({
                title: 'Login successful',
                description: "Welcome back, ".concat(data.user.name, "!"),
                type: 'success',
            });
            // Redirect to dashboard
            navigate('/dashboard');
        },
        onError: function (error) {
            showToast({
                title: 'Login failed',
                description: error.message,
                type: 'error',
            });
        },
    });
}
export function useLogout() {
    var queryClient = useQueryClient();
    var showToast = useToast().showToast;
    var navigate = useNavigate();
    return useMutation({
        mutationFn: function () { return authService.logout(); },
        onSuccess: function () {
            // Clear all cached data
            queryClient.clear();
            showToast({
                title: 'Logged out',
                description: 'You have been successfully logged out.',
                type: 'info',
            });
            // Redirect to login
            navigate('/login');
        },
        onError: function (error) {
            showToast({
                title: 'Logout failed',
                description: error.message,
                type: 'error',
            });
        },
    });
}
export function useCurrentUser() {
    var _a = useAuthStore(), isAuthenticated = _a.isAuthenticated, user = _a.user;
    return useQuery({
        queryKey: queryKeys.auth.user,
        queryFn: function () { return authService.getCurrentUser(); },
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: function (failureCount, error) {
            // Don't retry if unauthorized
            if ((error === null || error === void 0 ? void 0 : error.status) === 401) {
                return false;
            }
            return failureCount < 3;
        },
        initialData: user || undefined,
    });
}
export function useRefreshToken() {
    var queryClient = useQueryClient();
    var showToast = useToast().showToast;
    return useMutation({
        mutationFn: function () { return authService.refreshToken(); },
        onSuccess: function () {
            // Invalidate user queries to refetch with new token
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
        },
        onError: function (error) {
            showToast({
                title: 'Session expired',
                description: error.message,
                type: 'error',
            });
        },
    });
}
export function useChangePassword() {
    var showToast = useToast().showToast;
    return useMutation({
        mutationFn: function (_a) {
            var oldPassword = _a.oldPassword, newPassword = _a.newPassword;
            return authService.changePassword(oldPassword, newPassword);
        },
        onSuccess: function () {
            showToast({
                title: 'Password changed',
                description: 'Your password has been successfully updated.',
                type: 'success',
            });
        },
        onError: function (error) {
            showToast({
                title: 'Password change failed',
                description: error.message,
                type: 'error',
            });
        },
    });
}
// Helper hook for checking authentication status
export function useAuthStatus() {
    var _a = useAuthStore(), isAuthenticated = _a.isAuthenticated, user = _a.user, isLoading = _a.isLoading;
    var _b = useCurrentUser(), currentUser = _b.data, isUserLoading = _b.isLoading;
    return {
        isAuthenticated: isAuthenticated,
        user: currentUser || user,
        isLoading: isLoading || isUserLoading,
        hasPermission: function (permission) { var _a; return (_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.permissions.includes(permission)) !== null && _a !== void 0 ? _a : false; },
        isAdmin: function () {
            return (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'admin';
        },
    };
}
