"use client"

import {useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { cn } from "@/lib/utils"

interface MainProps {
    children: React.ReactNode
}

export function Main({ children }: MainProps) {
    const { categorySidebarState } = useCategorySidebar()
    const { subCategorySidebarState } = useSubCategorySidebar()

    return (
        <div className={cn("overflow-hidden bg-red-500 flex flex-col min-h-screen w-full transition-all duration-200 ease-linear", categorySidebarState === "expanded" ? "pr-64" : subCategorySidebarState === "expanded" ? "pr-64" : "")}>
            {children}
        </div>
    )
}
