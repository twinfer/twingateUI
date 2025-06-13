import * as React from "react"
import { ChevronsUpDown, Plus, Globe, Server, CheckCircle, AlertCircle, XCircle } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useDiscoveryEndpointsStore } from "@/stores/discoveryEndpointsStore"
import { useThingsStore } from "@/stores/thingsStore"
import { Link } from "react-router-dom"

export function DiscoveryEndpointSwitcher() {
  const { isMobile } = useSidebar()
  const { endpoints, selectedEndpointId, setSelectedEndpoint } = useDiscoveryEndpointsStore()
  const { setDiscoveryEndpointFilter } = useThingsStore()

  const selectedEndpoint = endpoints.find(e => e.id === selectedEndpointId) || 
                          endpoints.find(e => e.id === 'local') || 
                          endpoints[0]

  const handleEndpointSelect = (endpointId: string) => {
    setSelectedEndpoint(endpointId)
    setDiscoveryEndpointFilter(endpointId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'inactive':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />
      default:
        return <Globe className="h-3 w-3 text-gray-500" />
    }
  }

  const getEndpointIcon = (endpoint: any) => {
    if (endpoint.id === 'local') {
      return <Server className="h-4 w-4" />
    }
    return <Globe className="h-4 w-4" />
  }

  const formatLastDiscovered = (timestamp?: string) => {
    if (!timestamp) return 'Never'
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {getEndpointIcon(selectedEndpoint)}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selectedEndpoint?.name || 'Select Endpoint'}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {selectedEndpoint?.thingsCount || 0} Things
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Discovery Endpoints
            </DropdownMenuLabel>
            {endpoints.map((endpoint) => (
              <DropdownMenuItem
                key={endpoint.id}
                onClick={() => handleEndpointSelect(endpoint.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {getEndpointIcon(endpoint)}
                </div>
                <div className="flex-1 grid text-left text-sm leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-medium">{endpoint.name}</span>
                    {getStatusIcon(endpoint.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {endpoint.thingsCount} Things
                    </span>
                    {endpoint.lastDiscovered && (
                      <span className="text-xs text-muted-foreground">
                        • {formatLastDiscovered(endpoint.lastDiscovered)}
                      </span>
                    )}
                  </div>
                </div>
                {selectedEndpoint?.id === endpoint.id && (
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/things/discover" className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Discover More Endpoints
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setSelectedEndpoint(null)
                setDiscoveryEndpointFilter(null)
              }}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                <Globe className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Show All Things
              </div>
              {!selectedEndpointId && (
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}