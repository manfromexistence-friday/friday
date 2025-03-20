"use client"

import { useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MainProps {
    children: React.ReactNode
}

export function Main({ children }: MainProps) {
    const { categorySidebarState } = useCategorySidebar()
    const { subCategorySidebarState } = useSubCategorySidebar()

    return (
        <ScrollArea className={cn(
            "flex flex-col transition-all duration-200 ease-linear",
            "mt-12", // Header height
            "h-[calc(100vh-48px)]", // Full height minus header
            "overflow-y-auto", // Enable scrolling
            "no-scrollbar", // Hide scrollbar but keep functionality
            categorySidebarState === "expanded" ? "mr-64" : 
            subCategorySidebarState === "expanded" ? "mr-64" : ""
        )}>
            {children}
        </ScrollArea>
    )
}