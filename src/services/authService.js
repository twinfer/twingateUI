var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { AuthApi } from '@/api/generated/src';
import { createApiConfiguration } from './api';
import { useAuthStore } from '@/stores/authStore';
import { env } from '@/config/env';
var AuthService = /** @class */ (function () {
    function AuthService() {
    }
    AuthService.prototype.getApi = function () {
        return new AuthApi(createApiConfiguration());
    };
    AuthService.prototype.login = function (credentials) {
        return __awaiter(this, void 0, void 0, function () {
            var mockToken, mockUser, loginResponse;
            return __generator(this, function (_a) {
                try {
                    // Since this API uses bearer token auth with external providers,
                    // we'll simulate login for demo purposes
                    if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
                        mockToken = 'demo-bearer-token-12345';
                        mockUser = {
                            id: 'admin-user-123',
                            email: 'admin@example.com',
                            name: 'Admin User',
                            role: 'admin',
                            permissions: ['read', 'write', 'admin'],
                        };
                        loginResponse = {
                            user: mockUser,
                            token: mockToken,
                            refreshToken: 'demo-refresh-token-67890',
                        };
                        // Update auth store
                        useAuthStore.getState().setAuth(loginResponse.user, loginResponse.token, loginResponse.refreshToken);
                        return [2 /*return*/, loginResponse];
                    }
                    else {
                        throw new Error('Invalid credentials');
                    }
                }
                catch (error) {
                    console.error('Login failed:', error);
                    throw new Error('Invalid email or password');
                }
                return [2 /*return*/];
            });
        });
    };
    AuthService.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Since this API doesn't have a logout endpoint,
                    // we just clear local state
                    console.log('Logging out user...');
                }
                catch (error) {
                    console.warn('Logout failed:', error);
                }
                finally {
                    // Always clear local auth state
                    useAuthStore.getState().clearAuth();
                    // Clear tokens from localStorage
                    localStorage.removeItem(env.AUTH_TOKEN_KEY);
                    localStorage.removeItem(env.AUTH_REFRESH_TOKEN_KEY);
                }
                return [2 /*return*/];
            });
        });
    };
    AuthService.prototype.refreshToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var refreshToken, newToken, newRefreshToken, currentUser;
            return __generator(this, function (_a) {
                refreshToken = useAuthStore.getState().refreshToken;
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                try {
                    newToken = 'demo-bearer-token-refreshed-' + Date.now();
                    newRefreshToken = 'demo-refresh-token-refreshed-' + Date.now();
                    currentUser = useAuthStore.getState().user;
                    if (currentUser) {
                        useAuthStore.getState().setAuth(currentUser, newToken, newRefreshToken);
                    }
                    return [2 /*return*/, newToken];
                }
                catch (error) {
                    console.error('Token refresh failed:', error);
                    // If refresh fails, clear auth state
                    this.logout();
                    throw new Error('Session expired. Please login again.');
                }
                return [2 /*return*/];
            });
        });
    };
    AuthService.prototype.getCurrentUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, mockUser;
            return __generator(this, function (_a) {
                try {
                    currentUser = useAuthStore.getState().user;
                    if (currentUser) {
                        return [2 /*return*/, currentUser];
                    }
                    mockUser = {
                        id: 'admin-user-123',
                        email: 'admin@example.com',
                        name: 'Admin User',
                        role: 'admin',
                        permissions: ['read', 'write', 'admin'],
                    };
                    // Update user in auth store
                    useAuthStore.getState().updateUser(mockUser);
                    return [2 /*return*/, mockUser];
                }
                catch (error) {
                    console.error('Get current user failed:', error);
                    throw new Error('Failed to get user information');
                }
                return [2 /*return*/];
            });
        });
    };
    AuthService.prototype.changePassword = function (oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Mock password change for demo
                    console.log('Password change simulated');
                    // In a real implementation, this would call an API endpoint
                    return [2 /*return*/, Promise.resolve()];
                }
                catch (error) {
                    console.error('Change password failed:', error);
                    throw new Error('Failed to change password');
                }
                return [2 /*return*/];
            });
        });
    };
    // Check if user is authenticated and token is valid
    AuthService.prototype.isAuthenticated = function () {
        var _a = useAuthStore.getState(), token = _a.token, isAuthenticated = _a.isAuthenticated;
        return isAuthenticated && !!token;
    };
    // Get current auth token
    AuthService.prototype.getToken = function () {
        return useAuthStore.getState().token;
    };
    return AuthService;
}());
export var authService = new AuthService();
