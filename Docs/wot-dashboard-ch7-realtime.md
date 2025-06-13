# W3C WoT Dashboard - Chapter 7: Real-time Features & SSE Implementation

## SSE Client Architecture

### Enhanced SSE Client
```typescript
// lib/sse/SSEClient.ts
export class SSEClient {
  private connections = new Map<string, SSEConnection>();
  private reconnectAttempts = new Map<string, number>();
  private config: SSEConfig;
  
  constructor(config: SSEConfig) {
    this.config = {
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      backoffMultiplier: 1.5,
      heartbeatInterval: 30000,
      ...config
    };
  }
  
  connect(endpoint: string, handlers: SSEHandlers): string {
    const connectionId = this.generateConnectionId();
    
    const connection: SSEConnection = {
      id: connectionId,
      endpoint,
      handlers,
      eventSource: null,
      status: 'connecting',
      lastEventId: null
    };
    
    this.establishConnection(connection);
    this.connections.set(connectionId, connection);
    
    return connectionId;
  }
  
  private establishConnection(connection: SSEConnection) {
    const url = new URL(connection.endpoint, window.location.origin);
    
    // Add auth token
    const token = useAuthStore.getState().token;
    if (token) {
      url.searchParams.set('token', token);
    }
    
    // Resume from last event
    if (connection.lastEventId) {
      url.searchParams.set('lastEventId', connection.lastEventId);
    }
    
    const eventSource = new EventSource(url.toString());
    connection.eventSource = eventSource;
    
    // Event handlers
    eventSource.onopen = () => {
      connection.status = 'connected';
      this.reconnectAttempts.set(connection.id, 0);
      connection.handlers.onConnect?.();
    };
    
    eventSource.onmessage = (event) => {
      connection.lastEventId = event.lastEventId;
      try {
        const data = JSON.parse(event.data);
        connection.handlers.onMessage(data);
      } catch (error) {
        connection.handlers.onError?.(new Error('Invalid message format'));
      }
    };
    
    eventSource.onerror = () => {
      connection.status = 'error';
      this.handleReconnect(connection);
    };
    
    // Custom event types
    if (connection.handlers.customEvents) {
      Object.entries(connection.handlers.customEvents).forEach(([event, handler]) => {
        eventSource.addEventListener(event, handler);
      });
    }
  }
}
```

### SSE Hook
```typescript
// hooks/useSSE.ts
export function useSSE<T = any>(
  endpoint: string,
  options?: UseSSEOptions
): UseSSEResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<SSEStatus>('disconnected');
  const clientRef = useRef<SSEClient>();
  const connectionRef = useRef<string>();
  
  useEffect(() => {
    clientRef.current = new SSEClient({
      maxReconnectAttempts: options?.maxReconnectAttempts ?? 5
    });
    
    connectionRef.current = clientRef.current.connect(endpoint, {
      onMessage: (message: T) => {
        setData(message);
        options?.onMessage?.(message);
      },
      onError: (err) => {
        setError(err);
        options?.onError?.(err);
      },
      onConnect: () => {
        setStatus('connected');
        setError(null);
      },
      customEvents: options?.customEvents
    });
    
    return () => {
      if (connectionRef.current) {
        clientRef.current?.disconnect(connectionRef.current);
      }
    };
  }, [endpoint]);
  
  const reconnect = useCallback(() => {
    if (connectionRef.current && clientRef.current) {
      clientRef.current.reconnect(connectionRef.current);
    }
  }, []);
  
  return { data, error, status, reconnect };
}
```

## Real-time Property Monitoring

### Property Observer Component
```tsx
// features/things/PropertyObserver.tsx
interface PropertyObserverProps {
  thingId: string;
  propertyName: string;
  schema: PropertyAffordance;
  displayMode: 'value' | 'chart' | 'gauge';
}

export function PropertyObserver({ 
  thingId, 
  propertyName, 
  schema,
  displayMode 
}: PropertyObserverProps) {
  const [history, setHistory] = useState<PropertyValue[]>([]);
  const maxHistory = 100;
  
  const { data, error, status } = useSSE<PropertyUpdate>(
    `/api/things/${thingId}/properties/${propertyName}`,
    {
      onMessage: (update) => {
        setHistory(prev => {
          const newHistory = [...prev, update];
          return newHistory.slice(-maxHistory);
        });
      }
    }
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{schema.title || propertyName}</CardTitle>
        <StatusIndicator status={status} />
      </CardHeader>
      <CardContent>
        {displayMode === 'value' && (
          <ValueDisplay value={data?.value} unit={schema.unit} />
        )}
        {displayMode === 'chart' && (
          <RealTimeChart data={history} schema={schema} />
        )}
        {displayMode === 'gauge' && (
          <GaugeDisplay 
            value={data?.value} 
            min={schema.minimum} 
            max={schema.maximum}
            unit={schema.unit}
          />
        )}
      </CardContent>
    </Card>
  );
}
```

### Real-time Chart Component
```tsx
// components/charts/RealTimeChart.tsx
interface RealTimeChartProps {
  data: PropertyValue[];
  schema: PropertyAffordance;
  timeWindow?: number; // seconds
}

export function RealTimeChart({ data, schema, timeWindow = 300 }: RealTimeChartProps) {
  const chartRef = useRef<ChartJS>();
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Filter data to time window
    const now = Date.now();
    const windowStart = now - (timeWindow * 1000);
    const filteredData = data.filter(d => 
      new Date(d.timestamp).getTime() > windowStart
    );
    
    // Update chart
    chartRef.current.data.datasets[0].data = filteredData.map(d => ({
      x: d.timestamp,
      y: d.value
    }));
    
    chartRef.current.update('none'); // No animation for performance
  }, [data, timeWindow]);
  
  const options: ChartOptions = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            second: 'HH:mm:ss',
            minute: 'HH:mm'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: schema.unit || 'Value'
        }
      }
    },
    plugins: {
      streaming: {
        duration: timeWindow * 1000,
        refresh: 1000,
        delay: 1000
      }
    }
  };
  
  return <Line ref={chartRef} data={chartData} options={options} />;
}
```

## Event Subscription System

### Event Subscriber
```typescript
// features/events/EventSubscriber.ts
export class EventSubscriber {
  private subscriptions = new Map<string, EventSubscription>();
  
  subscribe(
    thingId: string, 
    eventName: string, 
    handler: EventHandler,
    options?: SubscriptionOptions
  ): string {
    const subscriptionId = this.generateId();
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      thingId,
      eventName,
      handler,
      filter: options?.filter,
      buffer: options?.enableBuffer ? [] : null,
      maxBufferSize: options?.maxBufferSize || 100
    };
    
    // Create SSE connection
    const endpoint = `/api/things/${thingId}/events/${eventName}`;
    const client = new SSEClient({});
    
    const connectionId = client.connect(endpoint, {
      onMessage: (event) => {
        // Apply filters
        if (subscription.filter && !this.matchesFilter(event, subscription.filter)) {
          return;
        }
        
        // Buffer events if enabled
        if (subscription.buffer !== null) {
          subscription.buffer.push(event);
          if (subscription.buffer.length > subscription.maxBufferSize) {
            subscription.buffer.shift();
          }
        }
        
        // Call handler
        handler(event);
      }
    });
    
    subscription.connectionId = connectionId;
    this.subscriptions.set(subscriptionId, subscription);
    
    return subscriptionId;
  }
  
  getBufferedEvents(subscriptionId: string): Event[] {
    const subscription = this.subscriptions.get(subscriptionId);
    return subscription?.buffer || [];
  }
}
```

### Event Dashboard
```tsx
// features/events/EventDashboard.tsx
export function EventDashboard({ things }: { things: ThingDescription[] }) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [filters, setFilters] = useState<EventFilters>({});
  const subscriber = useRef(new EventSubscriber());
  
  useEffect(() => {
    const subscriptions: string[] = [];
    
    // Subscribe to all events from all things
    things.forEach(thing => {
      Object.keys(thing.events || {}).forEach(eventName => {
        const subId = subscriber.current.subscribe(
          thing.id,
          eventName,
          (event) => {
            setEvents(prev => [{
              ...event,
              thingId: thing.id,
              thingTitle: thing.title,
              timestamp: new Date()
            }, ...prev].slice(0, 1000)); // Keep last 1000 events
          },
          { enableBuffer: true }
        );
        subscriptions.push(subId);
      });
    });
    
    return () => {
      subscriptions.forEach(id => 
        subscriber.current.unsubscribe(id)
      );
    };
  }, [things]);
  
  const filteredEvents = useMemo(() => 
    filterEvents(events, filters), 
    [events, filters]
  );
  
  return (
    <div className="space-y-4">
      <EventFilters onChange={setFilters} />
      <EventTimeline events={filteredEvents} />
      <EventStatistics events={filteredEvents} />
    </div>
  );
}
```

## Real-time Alerts

### Alert Manager
```typescript
// features/alerts/AlertManager.ts
interface AlertRule {
  id: string;
  thingId: string;
  property: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'between';
    value: number | [number, number];
  };
  severity: 'info' | 'warning' | 'critical';
  actions: AlertAction[];
}

export class AlertManager {
  private rules = new Map<string, AlertRule>();
  private activeAlerts = new Map<string, Alert>();
  
  addRule(rule: AlertRule) {
    this.rules.set(rule.id, rule);
    
    // Subscribe to property updates
    const subscription = this.subscribeToProperty(rule.thingId, rule.property, (value) => {
      if (this.checkCondition(value, rule.condition)) {
        this.triggerAlert(rule, value);
      } else {
        this.clearAlert(rule.id);
      }
    });
    
    rule.subscription = subscription;
  }
  
  private triggerAlert(rule: AlertRule, value: any) {
    const alert: Alert = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      timestamp: new Date(),
      value,
      severity: rule.severity,
      acknowledged: false
    };
    
    this.activeAlerts.set(alert.id, alert);
    
    // Execute actions
    rule.actions.forEach(action => {
      this.executeAction(action, alert);
    });
  }
}
```