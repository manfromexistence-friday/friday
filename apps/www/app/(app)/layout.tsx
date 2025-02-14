import LeftSidebar from "@/components/sidebar/left-sidebar"
import { SidebarProvider } from "@/registry/new-york/ui/sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <LeftSidebar />
      {children}
    </SidebarProvider>
  )
}
