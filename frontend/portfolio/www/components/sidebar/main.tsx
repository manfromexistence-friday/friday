"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { 
  CategorySidebarProvider, 
  useCategorySidebar 
} from "@/components/sidebar/category-sidebar"
import { 
  SubCategorySidebarProvider, 
  useSubCategorySidebar 
} from "@/components/sidebar/sub-category-sidebar"

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that handles responsive sidebar states
 * @param {MainLayoutProps} props - Component properties
 * @returns {JSX.Element} Main layout with dynamic margin based on sidebar states
 */
export default function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  const { categorySidebarState } = useCategorySidebar()
  const { subCategorySidebarState } = useSubCategorySidebar()

  const sidebarMarginClass = subCategorySidebarState === "expanded" || 
    categorySidebarState === "expanded" 
    ? "mr-64" 
    : ""

  const mainClassNames = cn(
    "flex h-screen w-full flex-col overflow-hidden pt-12",
    "transition-[margin] duration-300 ease-in-out",
    sidebarMarginClass
  )

  return (
    <CategorySidebarProvider>
      <SubCategorySidebarProvider>
        <main className={mainClassNames}>
          {children}
        </main>
      </SubCategorySidebarProvider>
    </CategorySidebarProvider>
  )
}
