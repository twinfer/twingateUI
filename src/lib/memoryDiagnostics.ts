import { monitoringService } from '@/services/monitoringService'

/**
 * Memory diagnostic utilities for detecting and preventing memory leaks
 */

interface MemorySnapshot {
  timestamp: number
  connections: {
    eventSources: number
    websockets: number
  }
  listeners: {
    properties: number
    events: number
    alerts: number
  }
  subscriptions: number
  activities: number
  heapUsed?: number
  heapTotal?: number
}

interface MemoryThresholds {
  maxConnections: number
  maxListeners: number
  maxSubscriptions: number
  memoryGrowthRate: number // MB per minute
}

class MemoryDiagnostics {
  private snapshots: MemorySnapshot[] = []
  private readonly maxSnapshots = 100
  private readonly thresholds: MemoryThresholds = {
    maxConnections: 50,
    maxListeners: 200,
    maxSubscriptions: 100,
    memoryGrowthRate: 10 // 10MB per minute
  }

  /**
   * Take a memory snapshot
   */
  takeSnapshot(): MemorySnapshot {
    const stats = monitoringService.getMemoryStats()
    const performance = (globalThis as any).performance
    
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      connections: stats.connections,
      listeners: stats.listeners,
      subscriptions: stats.subscriptions,
      activities: stats.activities
    }

    // Add heap information if available (Node.js environment)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage()
      snapshot.heapUsed = memory.heapUsed / 1024 / 1024 // Convert to MB
      snapshot.heapTotal = memory.heapTotal / 1024 / 1024
    }
    // Browser environment memory API
    else if (performance?.memory) {
      snapshot.heapUsed = performance.memory.usedJSHeapSize / 1024 / 1024
      snapshot.heapTotal = performance.memory.totalJSHeapSize / 1024 / 1024
    }

    // Store snapshot
    this.snapshots.push(snapshot)
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift()
    }

    return snapshot
  }

  /**
   * Analyze memory trends and detect potential leaks
   */
  analyzeMemoryTrends(): {
    hasLeaks: boolean
    issues: string[]
    recommendations: string[]
    growthRate?: number
  } {
    if (this.snapshots.length < 2) {
      return {
        hasLeaks: false,
        issues: ['Insufficient data for analysis'],
        recommendations: ['Take more snapshots over time']
      }
    }

    const latest = this.snapshots[this.snapshots.length - 1]
    const oldest = this.snapshots[0]
    const timeSpan = (latest.timestamp - oldest.timestamp) / 60000 // minutes

    const issues: string[] = []
    const recommendations: string[] = []

    // Check connection counts
    const totalConnections = latest.connections.eventSources + latest.connections.websockets
    if (totalConnections > this.thresholds.maxConnections) {
      issues.push(`High connection count: ${totalConnections} (threshold: ${this.thresholds.maxConnections})`)
      recommendations.push('Consider implementing connection pooling or reducing concurrent connections')
    }

    // Check listener counts
    const totalListeners = latest.listeners.properties + latest.listeners.events + latest.listeners.alerts
    if (totalListeners > this.thresholds.maxListeners) {
      issues.push(`High listener count: ${totalListeners} (threshold: ${this.thresholds.maxListeners})`)
      recommendations.push('Review listener cleanup in component unmounting')
    }

    // Check subscription counts
    if (latest.subscriptions > this.thresholds.maxSubscriptions) {
      issues.push(`High subscription count: ${latest.subscriptions} (threshold: ${this.thresholds.maxSubscriptions})`)
      recommendations.push('Implement subscription cleanup and avoid duplicate subscriptions')
    }

    // Analyze growth trends
    let growthRate: number | undefined
    if (timeSpan > 0 && latest.heapUsed && oldest.heapUsed) {
      growthRate = (latest.heapUsed - oldest.heapUsed) / timeSpan
      if (growthRate > this.thresholds.memoryGrowthRate) {
        issues.push(`High memory growth rate: ${growthRate.toFixed(2)} MB/min (threshold: ${this.thresholds.memoryGrowthRate})`)
        recommendations.push('Check for memory leaks in event listeners and connections')
      }
    }

    // Check for continuously growing metrics
    if (this.snapshots.length >= 5) {
      const recentSnapshots = this.snapshots.slice(-5)
      const connectionsGrowth = this.isMonotonicallyIncreasing(recentSnapshots.map(s => 
        s.connections.eventSources + s.connections.websockets
      ))
      const listenersGrowth = this.isMonotonicallyIncreasing(recentSnapshots.map(s => 
        s.listeners.properties + s.listeners.events + s.listeners.alerts
      ))

      if (connectionsGrowth) {
        issues.push('Connections count is continuously increasing')
        recommendations.push('Ensure connections are properly closed when no longer needed')
      }

      if (listenersGrowth) {
        issues.push('Listeners count is continuously increasing')
        recommendations.push('Ensure event listeners are removed in cleanup functions')
      }
    }

    return {
      hasLeaks: issues.length > 0,
      issues,
      recommendations,
      growthRate
    }
  }

  /**
   * Get memory usage report
   */
  getMemoryReport(): {
    current: MemorySnapshot
    analysis: ReturnType<typeof this.analyzeMemoryTrends>
    history: MemorySnapshot[]
  } {
    const current = this.takeSnapshot()
    const analysis = this.analyzeMemoryTrends()

    return {
      current,
      analysis,
      history: [...this.snapshots]
    }
  }

  /**
   * Set custom memory thresholds
   */
  setThresholds(thresholds: Partial<MemoryThresholds>): void {
    Object.assign(this.thresholds, thresholds)
  }

  /**
   * Clear stored snapshots
   */
  clearSnapshots(): void {
    this.snapshots = []
  }

  /**
   * Export snapshots for analysis
   */
  exportSnapshots(): string {
    return JSON.stringify(this.snapshots, null, 2)
  }

  /**
   * Import snapshots from JSON
   */
  importSnapshots(data: string): void {
    try {
      const snapshots = JSON.parse(data)
      if (Array.isArray(snapshots)) {
        this.snapshots = snapshots.slice(-this.maxSnapshots)
      }
    } catch (error) {
      console.error('Failed to import snapshots:', error)
    }
  }

  /**
   * Check if array values are monotonically increasing
   */
  private isMonotonicallyIncreasing(values: number[]): boolean {
    if (values.length < 2) return false
    
    for (let i = 1; i < values.length; i++) {
      if (values[i] <= values[i - 1]) {
        return false
      }
    }
    return true
  }

  /**
   * Start automatic memory monitoring
   */
  startMonitoring(intervalMs: number = 60000): () => void {
    const interval = setInterval(() => {
      const report = this.getMemoryReport()
      
      if (report.analysis.hasLeaks) {
        console.warn('Memory leak detected:', report.analysis)
      }
      
      // Log periodic stats in development
      if (process.env.NODE_ENV === 'development') {
        console.debug('Memory stats:', report.current)
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }
}

// Export singleton instance
export const memoryDiagnostics = new MemoryDiagnostics()

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private readonly metrics = new Map<string, number[]>()
  private readonly maxMetrics = 100

  /**
   * Record a performance metric
   */
  record(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    if (values.length > this.maxMetrics) {
      values.shift()
    }
  }

  /**
   * Get statistics for a metric
   */
  getStats(name: string): {
    count: number
    avg: number
    min: number
    max: number
    latest: number
  } | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null

    return {
      count: values.length,
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1]
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Get all metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys())
  }
}

export const performanceMonitor = new PerformanceMonitor()

/**
 * Utility function to measure and record execution time
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now()
  
  const finish = () => {
    const duration = performance.now() - start
    performanceMonitor.record(name, duration)
  }

  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(finish) as Promise<T>
    } else {
      finish()
      return result
    }
  } catch (error) {
    finish()
    throw error
  }
}