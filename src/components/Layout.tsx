import { Outlet } from 'react-router-dom'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { ModeToggle } from './mode-toggle'

export function Layout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Add the theme switcher here */}
          <div className="flex justify-end p-2">
            <ModeToggle />
          </div>
          <main className="container mx-auto p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}