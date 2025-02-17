import { Earth } from "lucide-react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { CategorySidebarProvider } from "@/components/sidebar/category-sidebar"
import LeftSidebar from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { SubCategorySidebarProvider } from "@/components/sidebar/sub-category-sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <LeftSidebar />
      <CategorySidebarProvider>
        <SubCategorySidebarProvider>
          <div className="relative w-full">
            <header className="bg-background absolute left-0 top-0 flex h-12 w-full">
              <div className="flex h-12 p-2">
                <span className="text-muted-foregournd hover:text-primary flex h-full w-48 items-center truncate text-[13px]">
                  Project Management and stuffs
                </span>
                <div className="hover:bg-primary-foreground hover:text-primary flex items-center justify-center gap-1 rounded-full border px-2 py-1 ">
                  <Earth className="h-[13px] w-[13px]" />
                  <span className="flex h-full items-center text-[10px]">
                    Public
                  </span>
                </div>
              </div>
              <RightSidebar />
            </header>
            <main className="pt-.5 flex h-screen w-full flex-col overflow-hidden pt-12">
              {children}
            </main>
          </div>
        </SubCategorySidebarProvider>
      </CategorySidebarProvider>
    </SidebarProvider>
  )
}
