var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Configuration } from '@/api/generated/src';
import { env } from '@/config/env';
import { useAuthStore } from '@/stores/authStore';
// Create base API configuration
export function createApiConfiguration() {
    var token = useAuthStore.getState().token;
    return new Configuration({
        basePath: env.API_BASE_URL,
        accessToken: token || undefined,
        headers: __assign({ 'Content-Type': 'application/json' }, (token && { Authorization: "Bearer ".concat(token) })),
    });
}
// Create API configuration that updates with auth state
export function useApiConfiguration() {
    var token = useAuthStore().token;
    return new Configuration({
        basePath: env.API_BASE_URL,
        accessToken: token || undefined,
        headers: __assign({ 'Content-Type': 'application/json' }, (token && { Authorization: "Bearer ".concat(token) })),
    });
}
