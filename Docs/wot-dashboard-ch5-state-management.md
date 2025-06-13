# W3C WoT Dashboard - Chapter 5: State Management & Data Flow

## Zustand Store Architecture

### Core Store Structure
```typescript
// stores/index.ts
interface StoreArchitecture {
  auth: AuthStore;        // Authentication state
  things: ThingsStore;    // Thing Descriptions
  streams: StreamsStore;  // Benthos streams
  ui: UIStore;           // UI preferences
  realtime: RealtimeStore; // SSE connections
  wot: WoTStore;         // WoT tools state
}
```

### Auth Store
```typescript
// stores/auth.store.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkPermission: (resource: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        isAuthenticated: false,
        permissions: [],
        
        // Actions with error handling
        login: async (credentials) => {
          try {
            const response = await api.auth.login(credentials);
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              permissions: response.permissions
            });
          } catch (error) {
            set({ isAuthenticated: false });
            throw error;
          }
        }
      }),
      { name: 'auth-storage' }
    )
  )
);
```

### Things Store with Real-time Updates
```typescript
// stores/things.store.ts
interface ThingsState {
  things: Map<string, ThingDescription>;
  selectedThingId: string | null;
  filters: ThingFilters;
  subscriptions: Map<string, EventSource>;
}

interface ThingsActions {
  // CRUD operations
  fetchThings: (filters?: ThingFilters) => Promise<void>;
  createThing: (td: ThingDescription) => Promise<void>;
  updateThing: (id: string, td: ThingDescription) => Promise<void>;
  deleteThing: (id: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToProperty: (thingId: string, property: string) => () => void;
  subscribeToEvents: (thingId: string, event: string) => () => void;
  
  // Property operations
  readProperty: (thingId: string, property: string) => Promise<any>;
  writeProperty: (thingId: string, property: string, value: any) => Promise<void>;
  
  // Action invocation
  invokeAction: (thingId: string, action: string, input?: any) => Promise<any>;
}

export const useThingsStore = create<ThingsState & ThingsActions>()((set, get) => ({
  // State
  things: new Map(),
  selectedThingId: null,
  filters: {},
  subscriptions: new Map(),
  
  // Subscribe to property changes
  subscribeToProperty: (thingId, property) => {
    const url = `/api/things/${thingId}/properties/${property}`;
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      set((state) => {
        const thing = state.things.get(thingId);
        if (thing) {
          // Update property value in real-time
          const updated = {
            ...thing,
            properties: {
              ...thing.properties,
              [property]: {
                ...thing.properties[property],
                value: data.value,
                lastUpdated: data.timestamp
              }
            }
          };
          state.things.set(thingId, updated);
        }
        return { things: new Map(state.things) };
      });
    };
    
    // Store subscription
    const key = `${thingId}:${property}`;
    get().subscriptions.set(key, eventSource);
    
    // Return cleanup function
    return () => {
      eventSource.close();
      get().subscriptions.delete(key);
    };
  }
}));
```

### WoT Tools Store
```typescript
// stores/wot.store.ts
interface WoTState {
  // Editor state
  editorContent: string;
  editorMode: 'json' | 'visual';
  isDirty: boolean;
  
  // Validation state
  validationResult: ValidationResult | null;
  isValidating: boolean;
  validationCache: Map<string, CachedValidation>;
  
  // Builder state
  builderStep: number;
  builderData: Partial<ThingDescription>;
}

interface WoTActions {
  // Editor actions
  setEditorContent: (content: string) => void;
  toggleEditorMode: () => void;
  
  // Validation actions
  validateTD: (td: ThingDescription) => Promise<ValidationResult>;
  clearValidation: () => void;
  
  // Builder actions
  updateBuilderData: (data: Partial<ThingDescription>) => void;
  resetBuilder: () => void;
  generateTD: () => ThingDescription;
}
```

## TanStack Query Integration

### Query Configuration
```typescript
// lib/query/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
      gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      
      // Custom error handler
      onError: (error) => {
        if (error instanceof UnauthorizedError) {
          useAuthStore.getState().logout();
        }
      }
    },
    mutations: {
      retry: 2,
      onError: (error) => {
        toast.error(error.message);
      }
    }
  }
});
```

### Thing Queries
```typescript
// api/hooks/useThings.ts
export function useThings(filters?: ThingFilters) {
  return useQuery({
    queryKey: ['things', filters],
    queryFn: () => api.things.list(filters),
    select: (data) => {
      // Transform to Map for efficient lookups
      const thingsMap = new Map<string, ThingDescription>();
      data.things.forEach(thing => {
        thingsMap.set(thing.id, thing);
      });
      return thingsMap;
    }
  });
}

export function useThing(id: string) {
  return useQuery({
    queryKey: ['things', id],
    queryFn: () => api.things.get(id),
    enabled: !!id
  });
}

export function useCreateThing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (td: ThingDescription) => api.things.create(td),
    onSuccess: (data) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['things'] });
      
      // Update Zustand store
      useThingsStore.getState().fetchThings();
      
      toast.success('Thing created successfully');
    }
  });
}
```

## Data Flow Patterns

### Optimistic Updates
```typescript
// features/things/hooks/useOptimisticUpdate.ts
export function useOptimisticPropertyUpdate(thingId: string, propertyName: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (value: any) => 
      api.things.writeProperty(thingId, propertyName, value),
      
    onMutate: async (newValue) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries(['things', thingId]);
      
      // Snapshot previous value
      const previousThing = queryClient.getQueryData<ThingDescription>(['things', thingId]);
      
      // Optimistically update
      if (previousThing) {
        queryClient.setQueryData(['things', thingId], {
          ...previousThing,
          properties: {
            ...previousThing.properties,
            [propertyName]: {
              ...previousThing.properties[propertyName],
              value: newValue
            }
          }
        });
      }
      
      return { previousThing };
    },
    
    onError: (err, newValue, context) => {
      // Rollback on error
      if (context?.previousThing) {
        queryClient.setQueryData(['things', thingId], context.previousThing);
      }
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['things', thingId]);
    }
  });
}
```

### Real-time Sync Pattern
```typescript
// hooks/useRealtimeSync.ts
export function useRealtimeSync(thingId: string) {
  const { subscribeToProperty, subscribeToEvents } = useThingsStore();
  const thing = useThing(thingId);
  
  useEffect(() => {
    if (!thing.data) return;
    
    const unsubscribers: Array<() => void> = [];
    
    // Subscribe to all observable properties
    Object.entries(thing.data.properties || {}).forEach(([name, prop]) => {
      if (prop.observable) {
        const unsub = subscribeToProperty(thingId, name);
        unsubscribers.push(unsub);
      }
    });
    
    // Subscribe to all events
    Object.keys(thing.data.events || {}).forEach((eventName) => {
      const unsub = subscribeToEvents(thingId, eventName);
      unsubscribers.push(unsub);
    });
    
    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [thingId, thing.data]);
}
```