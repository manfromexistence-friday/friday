"use client"

import { useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { cn } from "@/lib/utils"

interface MainProps {
    children: React.ReactNode
}

export function Main({ children }: MainProps) {
    const { categorySidebarState } = useCategorySidebar()
    const { subCategorySidebarState } = useSubCategorySidebar()

    return (
        <div className={cn(
            "flex flex-col transition-all duration-200 ease-linear ",
            "mt-12", // Header height (48px)
            // "min-h-[calc(100vh-48px)]", // 100vh minus header height

            categorySidebarState === "expanded" ? "mr-64" : 
            subCategorySidebarState === "expanded" ? "mr-64" : ""
        )}>
            {children}
        </div>
    )
}