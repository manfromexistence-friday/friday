"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { LogoIcon } from "@/components/sidebar/team-switcher"
import Link from "next/link"
import { data } from "@/data"
import Friday from "./friday/friday"
import * as React from "react"
import { useEffect, useId, useState, ElementType } from "react"
import { Tooltip } from "antd"
import {
  LoaderCircle,
  MessageCircle,
  Mic,
  Search,
  Type,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  CategorySidebar,
  CategorySidebarContent,
  CategorySidebarFooter,
  CategorySidebarHeader,
  CategorySidebarMenuButton,
  useCategorySidebar,
} from "@/components/sidebar/category-sidebar"
import { NavActions } from "@/components/sidebar/nav-actions"
import {
  SubCategorySidebar,
  SubCategorySidebarContent,
  SubCategorySidebarFooter,
  SubCategorySidebarHeader,
  SubCategorySidebarMenuButton,
  useSubCategorySidebar,
} from "@/components/sidebar/sub-category-sidebar"
import { categoryItems, subCategoryItems } from "@/data/sidebar-items"
import * as Icons from "lucide-react"
import { CategoryRightSidebar, SubCategoryRightSidebar } from "./sidebar/right-sidebar"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { categorySidebarState, categorySidebarToggleSidebar } = useCategorySidebar()
  const { subCategorySidebarState, subCategorySidebarToggleSidebar } = useSubCategorySidebar()

  // Get route name
  const getRouteName = () => {
    if (pathname === "/") return "Home"
    const lastSegment = pathname ? pathname.split("/").pop() : undefined
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : "Home"
  }

  // Check if route is chat related
  const isChatRoute = pathname?.startsWith("/chat") ?? false

  const handleCategorySidebarToggle = () => {
    categorySidebarToggleSidebar()
    if (subCategorySidebarState === "expanded") {
      subCategorySidebarToggleSidebar()
    }
  }

  const handleSubCategorySidebarToggle = () => {
    subCategorySidebarToggleSidebar()
    if (categorySidebarState === "expanded") {
      categorySidebarToggleSidebar()
    }
  }

  return (
    <header className="bg-background abs0lute left-0 top-0 z-50 flex h-12 w-full items-center justify-between border-b pl-2 pr-1.5">
      <div className="flex items-center gap-1 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <ScrollArea className="h-full py-4">
              <div className="mb-4 flex items-center gap-2 px-4">
                <LogoIcon className="size-8" />
                <span className="font-semibold">V0</span>
              </div>

              <div className="flex flex-col gap-1 px-2">
                <Link
                  href="/chat"
                  className="flex items-center gap-2 rounded-md px-4 py-2 hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  <span>Start New</span>
                </Link>
                {data.navMain.map((item: any) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    className="flex items-center gap-2 rounded-md px-4 py-2 hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <Friday orbSize={25} shapeSize={21} />
      </div>
      <span className="hidden md:flex">{getRouteName()}</span>
      <div className="ml-auto flex max-h-12 items-center">
        {isChatRoute && <NavActions />}

        <div className="ml-1.5 hover:bg-primary-foreground flex h-8 items-center justify-center gap-1 rounded-md border px-1.5">
          <div
            onClick={handleCategorySidebarToggle}
            className="hover:bg-background flex size-6 items-center justify-center rounded-md"
          >
            <MessageCircle
              className={cn(
                categorySidebarState === "expanded"
                  ? "text-primary"
                  : "text-muted-foreground",
                "size-4"
              )}
            />
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div
            onClick={handleSubCategorySidebarToggle}
            className="hover:bg-background flex size-6 items-center justify-center rounded-md"
          >
            <Type
              className={cn(
                subCategorySidebarState === "expanded"
                  ? "text-primary"
                  : "text-muted-foreground",
                "size-4"
              )}
            />
          </div>
        </div>
        <CategoryRightSidebar />
        <SubCategoryRightSidebar />
      </div>
    </header>
  )
}