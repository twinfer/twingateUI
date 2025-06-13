# W3C WoT Dashboard - Chapter 9: Security & Authentication

## Authentication Architecture

### Auth Provider System
```typescript
// auth/AuthProvider.tsx
interface AuthProviderProps {
  children: React.ReactNode;
  config?: AuthConfig;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { initialize, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Check for stored token
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // 2. Validate token with API
          const isValid = await api.auth.validateToken(token);
          
          if (isValid) {
            // 3. Get user profile
            const user = await api.auth.getProfile();
            initialize({ token, user });
          } else {
            // 4. Try refresh
            await refreshAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initAuth();
  }, []);
  
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Multi-Provider Authentication
```typescript
// auth/providers/AuthProviderFactory.ts
export class AuthProviderFactory {
  private providers = new Map<string, IAuthProvider>();
  
  register(type: string, provider: IAuthProvider) {
    this.providers.set(type, provider);
  }
  
  async getAvailableProviders(): Promise<AuthProviderInfo[]> {
    const response = await api.admin.auth.listProviders();
    
    return response.providers
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map(p => ({
        id: p.id,
        type: p.type,
        name: p.name,
        icon: this.getProviderIcon(p.type)
      }));
  }
  
  getProvider(type: string): IAuthProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Unknown auth provider: ${type}`);
    }
    return provider;
  }
}

// OAuth2 Provider Implementation
export class OAuth2Provider implements IAuthProvider {
  async login(config: OAuth2Config): Promise<AuthResult> {
    // 1. Redirect to OAuth provider
    const authUrl = this.buildAuthUrl(config);
    window.location.href = authUrl;
  }
  
  async handleCallback(code: string, state: string): Promise<AuthResult> {
    // 2. Exchange code for token
    const response = await api.auth.oauth2.callback({
      code,
      state,
      provider: this.providerId
    });
    
    return {
      token: response.access_token,
      user: response.user,
      expiresAt: new Date(Date.now() + response.expires_in * 1000)
    };
  }
}
```

## Route Protection

### Protected Route Component
```tsx
// auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  roles?: Role[];
  permissions?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ProtectedRoute({ 
  roles, 
  permissions, 
  fallback,
  children 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, checkPermission } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated) {
      // Save intended destination
      sessionStorage.setItem('auth_redirect', location.pathname);
      navigate('/login');
    }
  }, [isAuthenticated, location, navigate]);
  
  // Check roles
  if (roles && !roles.some(role => user?.roles.includes(role))) {
    return fallback || <AccessDenied reason="Insufficient role" />;
  }
  
  // Check permissions
  if (permissions && !permissions.every(p => checkPermission(p))) {
    return fallback || <AccessDenied reason="Missing permissions" />;
  }
  
  return <>{children}</>;
}

// Route configuration
export const protectedRoutes: RouteConfig[] = [
  {
    path: '/admin/*',
    element: (
      <ProtectedRoute roles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    )
  },
  {
    path: '/things/create',
    element: (
      <ProtectedRoute permissions={['things:create']}>
        <CreateThingPage />
      </ProtectedRoute>
    )
  }
];
```

## API Security

### Request Signing
```typescript
// auth/RequestSigner.ts
export class RequestSigner {
  private readonly algorithm = 'sha256';
  
  signRequest(request: AxiosRequestConfig, secret: string): void {
    const timestamp = Date.now();
    const nonce = generateNonce();
    
    // Build canonical request
    const canonical = this.buildCanonicalRequest(request, timestamp, nonce);
    
    // Generate signature
    const signature = crypto
      .createHmac(this.algorithm, secret)
      .update(canonical)
      .digest('hex');
    
    // Add security headers
    request.headers = {
      ...request.headers,
      'X-Timestamp': timestamp.toString(),
      'X-Nonce': nonce,
      'X-Signature': signature
    };
  }
  
  private buildCanonicalRequest(
    request: AxiosRequestConfig,
    timestamp: number,
    nonce: string
  ): string {
    const parts = [
      request.method?.toUpperCase(),
      request.url,
      timestamp,
      nonce,
      JSON.stringify(request.data || '')
    ];
    
    return parts.join('\n');
  }
}
```

### CSRF Protection
```typescript
// auth/CSRFProtection.ts
export class CSRFProtection {
  private token: string | null = null;
  
  async initialize() {
    // Get CSRF token from API
    const response = await api.auth.getCsrfToken();
    this.token = response.token;
    
    // Set default header
    axios.defaults.headers.common['X-CSRF-Token'] = this.token;
  }
  
  validateToken(token: string): boolean {
    return token === this.token;
  }
  
  refreshToken(): void {
    this.initialize();
  }
}

// Hook for forms
export function useCSRFToken() {
  const [token, setToken] = useState<string>('');
  
  useEffect(() => {
    CSRFProtection.getInstance().getToken().then(setToken);
  }, []);
  
  return token;
}
```

## Permission System

### Fine-grained Permissions
```typescript
// auth/permissions/PermissionChecker.ts
export class PermissionChecker {
  private permissions: Set<string>;
  
  constructor(permissions: string[]) {
    this.permissions = new Set(permissions);
  }
  
  check(resource: string, action: string): boolean {
    // Check exact permission
    if (this.permissions.has(`${resource}:${action}`)) {
      return true;
    }
    
    // Check wildcard permissions
    if (this.permissions.has(`${resource}:*`)) {
      return true;
    }
    
    if (this.permissions.has('*:*')) {
      return true;
    }
    
    // Check hierarchical permissions
    return this.checkHierarchical(resource, action);
  }
  
  private checkHierarchical(resource: string, action: string): boolean {
    // Example: things.sensor.temperature -> things.sensor.* -> things.*
    const parts = resource.split('.');
    
    for (let i = parts.length; i > 0; i--) {
      const partial = parts.slice(0, i).join('.');
      if (this.permissions.has(`${partial}.*:${action}`)) {
        return true;
      }
    }
    
    return false;
  }
}

// React hook
export function usePermission(resource: string, action: string): boolean {
  const { permissions } = useAuthStore();
  const checker = useMemo(
    () => new PermissionChecker(permissions),
    [permissions]
  );
  
  return checker.check(resource, action);
}
```

### Resource-based Access Control
```typescript
// auth/ResourceGuard.tsx
interface ResourceGuardProps {
  resource: string;
  resourceId?: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ResourceGuard({
  resource,
  resourceId,
  action,
  children,
  fallback
}: ResourceGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const result = await api.auth.checkResourceAccess({
          resource,
          resourceId,
          action
        });
        setHasAccess(result.allowed);
      } catch {
        setHasAccess(false);
      }
    };
    
    checkAccess();
  }, [resource, resourceId, action]);
  
  if (hasAccess === null) {
    return <LoadingSpinner />;
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
```

## Security Headers & CSP

### Security Middleware
```typescript
// middleware/security.ts
export function securityMiddleware(): Middleware {
  return (req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // For React DevTools
      "style-src 'self' 'unsafe-inline'", // For Tailwind
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' wss: https:",
      "frame-ancestors 'none'"
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
    
    // HSTS
    if (req.secure) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
    }
    
    next();
  };
}
```

## Session Management

### Secure Session Store
```typescript
// auth/SessionManager.ts
export class SessionManager {
  private readonly SESSION_KEY = 'wot_session';
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  
  async createSession(authResult: AuthResult): Promise<Session> {
    const session: Session = {
      id: generateSessionId(),
      token: authResult.token,
      refreshToken: authResult.refreshToken,
      user: authResult.user,
      expiresAt: authResult.expiresAt,
      createdAt: new Date()
    };
    
    // Store encrypted session
    const encrypted = await this.encryptSession(session);
    sessionStorage.setItem(this.SESSION_KEY, encrypted);
    
    // Set up auto-refresh
    this.scheduleRefresh(session);
    
    return session;
  }
  
  private scheduleRefresh(session: Session) {
    const timeUntilExpiry = session.expiresAt.getTime() - Date.now();
    const refreshTime = timeUntilExpiry - this.REFRESH_THRESHOLD;
    
    if (refreshTime > 0) {
      setTimeout(() => {
        this.refreshSession(session);
      }, refreshTime);
    }
  }
  
  private async refreshSession(session: Session) {
    try {
      const response = await api.auth.refresh({
        refreshToken: session.refreshToken
      });
      
      const newSession = await this.createSession(response);
      
      // Notify store
      useAuthStore.getState().updateSession(newSession);
    } catch (error) {
      // Refresh failed, logout
      useAuthStore.getState().logout();
    }
  }
}
```