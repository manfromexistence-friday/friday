import { SidebarProvider } from "@/components/ui/sidebar"
import { CategorySidebarProvider } from "@/components/sidebar/category-sidebar"
import LeftSidebar from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { SubCategorySidebarProvider } from "@/components/sidebar/sub-category-sidebar"
import Main from "@/components/sidebar/main"
import Time from "@/components/time"

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
            <header className="absolute left-0 top-0 flex h-12 w-full">
              <div className="flex h-12 p-2">
                <span className="flex h-full w-48 items-center truncate font-bold transition-colors duration-200">
                  manfromexistence
                </span>
              </div>
              <RightSidebar />
            </header>
            <Main>
              {children}
            </Main>
          </div>
          {/* <Time /> */}
        </SubCategorySidebarProvider>
      </CategorySidebarProvider>
    </SidebarProvider>
  )
}
