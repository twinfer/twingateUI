# W3C WoT Dashboard - Chapter 8: API Integration & Type Safety

## API Client Architecture

### Type-Safe API Client
```typescript
// api/client.ts
export class ApiClient {
  private axios: AxiosInstance;
  private interceptors: InterceptorManager;
  
  constructor(config: ApiConfig) {
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.interceptors = new InterceptorManager(this.axios);
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor for auth
    this.axios.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request ID for tracing
        config.headers['X-Request-ID'] = generateRequestId();
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshed = await this.interceptors.handleTokenRefresh();
          if (refreshed) {
            // Retry original request
            return this.axios(error.config!);
          }
        }
        
        // Transform error for consistent handling
        throw new ApiError(
          error.response?.data?.error || 'Unknown error',
          error.response?.status || 0,
          error.response?.data?.details
        );
      }
    );
  }
}
```

### Generated Types from OpenAPI
```typescript
// api/types/generated.ts (from swagger.yaml)
export interface ThingDescription {
  '@context': string | string[];
  '@type'?: string[];
  id: string;
  title: string;
  description?: string;
  properties?: Record<string, PropertyAffordance>;
  actions?: Record<string, ActionAffordance>;
  events?: Record<string, EventAffordance>;
  forms?: Form[];
  security: string[];
  securityDefinitions: Record<string, SecurityScheme>;
  // ... other fields
}

export interface PropertyAffordance extends DataSchema {
  forms: Form[];
  observable?: boolean;
  uriVariables?: Record<string, DataSchema>;
}

// Zod schemas for runtime validation
export const ThingDescriptionSchema = z.object({
  '@context': z.union([z.string(), z.array(z.string())]),
  id: z.string(),
  title: z.string(),
  properties: z.record(PropertyAffordanceSchema).optional(),
  // ... rest of schema
});
```

### Service Layer

#### Things Service
```typescript
// api/services/things.service.ts
export class ThingsService extends BaseService {
  async list(params?: ThingListParams): Promise<ThingListResponse> {
    const response = await this.client.get<ThingListResponse>('/api/things', { params });
    
    // Validate response
    return ThingListResponseSchema.parse(response.data);
  }
  
  async create(td: ThingDescription): Promise<ThingRegistrationResponse> {
    // Validate input
    const validatedTD = ThingDescriptionSchema.parse(td);
    
    const response = await this.client.post<ThingRegistrationResponse>(
      '/api/things',
      {
        thing_description: JSON.stringify(validatedTD)
      }
    );
    
    return response.data;
  }
  
  async readProperty(thingId: string, propertyName: string): Promise<PropertyReadResponse> {
    const response = await this.client.get<PropertyReadResponse>(
      `/api/things/${thingId}/properties/${propertyName}`
    );
    
    return {
      value: response.data.value,
      timestamp: new Date(response.data.timestamp),
      cached: response.data.cached
    };
  }
  
  async invokeAction(
    thingId: string, 
    actionName: string, 
    input?: any,
    options?: ActionOptions
  ): Promise<ActionInvocationResponse> {
    const response = await this.client.post<ActionInvocationResponse>(
      `/api/things/${thingId}/actions/${actionName}`,
      {
        input,
        async: options?.async ?? false
      },
      {
        timeout: options?.timeout ? options.timeout * 1000 : undefined
      }
    );
    
    return response.data;
  }
}
```

#### Streams Service
```typescript
// api/services/streams.service.ts
export class StreamsService extends BaseService {
  async create(request: StreamCreationRequest): Promise<StreamInfo> {
    // Validate processor chain
    request.processor_chain?.forEach(processor => {
      this.validateProcessorConfig(processor);
    });
    
    const response = await this.client.post<StreamInfo>('/api/streams', request);
    return response.data;
  }
  
  private validateProcessorConfig(processor: ProcessorConfig) {
    // Type-specific validation
    switch (processor.type) {
      case 'json_validation':
        z.object({
          schema: z.record(z.any())
        }).parse(processor.config);
        break;
        
      case 'transformation':
        z.object({
          mapping: z.record(z.string())
        }).parse(processor.config);
        break;
        
      // ... other processor types
    }
  }
}
```

## Query Hooks with Type Safety

### Custom Query Hooks
```typescript
// api/hooks/useThingQueries.ts
export function useThings(filters?: ThingFilters) {
  return useQuery({
    queryKey: ['things', filters],
    queryFn: async () => {
      const response = await api.things.list(filters);
      
      // Transform to typed map
      const thingsMap = new Map<string, ThingDescription>();
      response.things.forEach(thing => {
        // Additional client-side validation
        const validated = ThingDescriptionSchema.parse(thing);
        thingsMap.set(validated.id, validated);
      });
      
      return {
        things: thingsMap,
        total: response.total,
        metadata: response
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });
}

export function usePropertyValue<T = any>(
  thingId: string, 
  propertyName: string,
  options?: UsePropertyOptions
) {
  return useQuery({
    queryKey: ['things', thingId, 'properties', propertyName],
    queryFn: () => api.things.readProperty(thingId, propertyName),
    refetchInterval: options?.pollingInterval,
    select: (data) => data.value as T,
    enabled: options?.enabled ?? true
  });
}
```

### Mutation Hooks
```typescript
// api/hooks/useThingMutations.ts
export function useCreateThing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (td: ThingDescription) => {
      // Pre-validate on client
      const validated = ThingDescriptionSchema.parse(td);
      
      // Additional business validation
      await validateBusinessRules(validated);
      
      return api.things.create(validated);
    },
    
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['things'] });
      
      // Optimistically add to store
      useThingsStore.getState().addThing(data.thing_description);
      
      // Show success notification
      toast.success(`Thing "${variables.title}" created successfully`);
    },
    
    onError: (error: ApiError) => {
      // Specific error handling
      if (error.status === 409) {
        toast.error('A thing with this ID already exists');
      } else {
        toast.error(error.message);
      }
    }
  });
}
```

## Error Handling

### Global Error Handler
```typescript
// api/errors/ErrorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
  
  isRetryable(): boolean {
    return this.status >= 500 || this.status === 429;
  }
  
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
  
  getUIMessage(): string {
    // User-friendly error messages
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Please log in to continue.',
      403: 'You don\'t have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'This resource already exists.',
      429: 'Too many requests. Please try again later.',
      500: 'Something went wrong. Please try again.',
      503: 'Service temporarily unavailable.'
    };
    
    return messages[this.status] || this.message;
  }
}
```

### Error Boundary with API Errors
```tsx
// components/ErrorBoundary.tsx
export class ApiErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    if (error instanceof ApiError) {
      return {
        hasError: true,
        error: {
          message: error.getUIMessage(),
          status: error.status,
          details: error.details
        }
      };
    }
    
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          error={this.state.error}
          onRetry={() => window.location.reload()}
        />
      );
    }
    
    return this.props.children;
  }
}
```

## Request Caching & Optimization

### Smart Caching Strategy
```typescript
// api/cache/CacheManager.ts
export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private pending = new Map<string, Promise<any>>();
  
  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options?: CacheOptions
  ): Promise<T> {
    // Check if request is already pending (deduplication)
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }
    
    // Check cache
    const cached = this.cache.get(key);
    if (cached && !this.isStale(cached, options)) {
      return cached.data;
    }
    
    // Fetch new data
    const promise = fetcher()
      .then(data => {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl: options?.ttl || 5 * 60 * 1000
        });
        return data;
      })
      .finally(() => {
        this.pending.delete(key);
      });
    
    this.pending.set(key, promise);
    return promise;
  }
}
```