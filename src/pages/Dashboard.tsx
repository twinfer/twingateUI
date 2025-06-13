import { SystemStatsWidget } from '@/components/dashboard/widgets/SystemStatsWidget'
import { ActivityFeedWidget } from '@/components/dashboard/widgets/ActivityFeedWidget'
import { DeviceStatusGrid } from '@/components/dashboard/widgets/DeviceStatusGrid'

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to TwinGate UI - Your Web of Things Command Center
        </p>
      </div>

      {/* System Statistics */}
      <SystemStatsWidget />

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Device Status Grid - Takes 2 columns */}
        <div className="lg:col-span-2">
          <DeviceStatusGrid />
        </div>
        
        {/* Activity Feed - Takes 1 column */}
        <div className="lg:col-span-1">
          <ActivityFeedWidget />
        </div>
      </div>
    </div>
  )
}