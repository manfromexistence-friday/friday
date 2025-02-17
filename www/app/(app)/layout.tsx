import { CategorySidebarProvider } from "@/components/sidebar/category-sidebar"
import LeftSidebar from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { SubCategorySidebarProvider } from "@/components/sidebar/sub-category-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Earth } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <LeftSidebar />
      <CategorySidebarProvider>
        <SubCategorySidebarProvider>
          <div className="w-full relative">
            <header className="flex h-12 w-full absolute top-0 left-0 bg-background">
              <div className="flex h-12 p-2">
                <span className="text-muted-foregournd flex h-full w-48 items-center truncate text-[13px] hover:text-primary">Project Management and stuffs</span>
                <div className="flex items-center justify-center gap-1 rounded-full border px-2 py-1 hover:bg-primary-foreground hover:text-primary ">
                  <Earth className="h-[13px] w-[13px]" />
                  <span className="flex h-full items-center text-[10px]">
                    Public
                  </span>
                </div>
              </div>
              <RightSidebar />
            </header>
            <main className="flex flex-col w-full pt-.5 h-screen overflow-hidden pt-12">
              {children}
            </main>
          </div>
        </SubCategorySidebarProvider>
      </CategorySidebarProvider>
    </SidebarProvider>
  )
}
