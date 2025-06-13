import * as React from "react"
import {
  Home,
  Cpu,
  Box,
  Activity,
  FileJson,
  GitBranch,
  Settings,
  Eye,
  Search,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { DiscoveryEndpointSwitcher } from "@/components/discovery-endpoint-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation data for WoT Dashboard
const data = {
  user: {
    name: "WoT Admin",
    email: "admin@wot-dashboard.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "TwinCore Gateway",
      logo: Cpu,
      plan: "IoT Platform",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [],
    },
    {
      title: "Things",
      url: "/things",
      icon: Cpu,
      items: [
        {
          title: "All Things",
          url: "/things",
        },
        {
          title: "Discover",
          url: "/things/discover",
        },
        {
          title: "Create TD",
          url: "/things/create",
        },
      ],
    },
    {
      title: "Visualization",
      url: "/visualization",
      icon: Box,
      items: [
        {
          title: "3D View",
          url: "/visualization",
        },
        {
          title: "Floor Plan",
          url: "/visualization/floorplan",
        },
      ],
    },
    {
      title: "Monitoring",
      url: "/monitoring",
      icon: Activity,
      items: [
        {
          title: "Live Data",
          url: "/monitoring/live",
        },
        {
          title: "Events",
          url: "/monitoring/events",
        },
        {
          title: "Alerts",
          url: "/monitoring/alerts",
        },
      ],
    },
    {
      title: "Streams",
      url: "/streams",
      icon: GitBranch,
      items: [
        {
          title: "Pipelines",
          url: "/streams/pipelines",
        },
        {
          title: "Editor",
          url: "/streams/editor",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "API Keys",
          url: "/settings/api-keys",
        },
        {
          title: "Users",
          url: "/settings/users",
        },
      ],
    },
  ],
  projects: [
    {
      name: "TD Playground",
      url: "/td-playground",
      icon: FileJson,
    },
    {
      name: "Discovery",
      url: "/discovery",
      icon: Search,
    },
    {
      name: "Live View",
      url: "/live-view",
      icon: Eye,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <DiscoveryEndpointSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
