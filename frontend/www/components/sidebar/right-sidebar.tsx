"use client"

import * as React from "react"
import { useEffect, useId, useState, ElementType } from "react"
import Link from "next/link"
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

interface DynamicIconProps {
  name: string
  className?: string
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  const IconComponent = Icons[name as keyof typeof Icons] as ElementType
  return IconComponent ? <IconComponent className={className} /> : null
}

export function CategoryRightSidebar({ className }: { className?: string }) {
  const id = useId()
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  useEffect(() => {
    if (inputValue) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
    setIsLoading(false)
  }, [inputValue])

  const { categorySidebarState } = useCategorySidebar()
  // useSubCategorySidebar()
  return (
    <CategorySidebar className={cn(className, "bg-op z-[1000]")} side="right">
      <CategorySidebarHeader>
        <div className="space-y-2">
          <div className="relative">
            <Input
              id={id}
              className="peer pe-9 ps-9"
              placeholder="Search Category..."
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              {isLoading ? (
                <LoaderCircle
                  className="animate-spin"
                  size={16}
                  strokeWidth={2}
                  role="status"
                  aria-label="Loading..."
                />
              ) : (
                <Search size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </div>
            <button
              className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Press to speak"
              type="submit"
            >
              <Mic size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </CategorySidebarHeader>
      <CategorySidebarContent>
        <ScrollArea className="w-full p-0">
          <div className="mb-2 flex flex-col gap-1 px-2">
            {categoryItems.map((item) => (
              <Tooltip key={item.href} placement="rightTop" title={item.title}>
                <Link href={{ pathname: item.href }}>
                  <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <DynamicIcon name={item.icon} className="size-4" />
                    <span className="text-center text-sm leading-tight">
                      {item.title}
                    </span>
                  </CategorySidebarMenuButton>
                </Link>
              </Tooltip>
            ))}
          </div>
          {categorySidebarState === "expanded" ? (
            <div className="">
              <div className="mx-auto h-auto w-[94%] border-t border-dashed" />
              {/* <NavFavorites favorites={data.favorites} />
              <NavFavorites favorites={data.favorites} />
              <NavFavorites favorites={data.favorites} /> */}
            </div>
          ) : null}
        </ScrollArea>
      </CategorySidebarContent>
      <CategorySidebarFooter>
        {/* {categorySidebarState === "expanded" ? (
              ""
            ) : (
              <div
                onClick={() => {
                  toggleSidebar()
                }}
                className="flex min-h-8 min-w-8 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <PanelRight className="h-4 w-4" />
              </div>
            )} */}
      </CategorySidebarFooter>
      {/* <CategorySidebarRail /> */}
    </CategorySidebar>
  )
}

export function SubCategoryRightSidebar({ className }: { className?: string }) {
  const id = useId()
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { subCategorySidebarState } = useSubCategorySidebar()

  useEffect(() => {
    if (inputValue) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
    setIsLoading(false)
  }, [inputValue])

  return (
    <SubCategorySidebar className={cn(className, "bg-op z-[1000]")}  side="right">
      <SubCategorySidebarHeader>
        <div className="space-y-2">
          <div className="relative">
            <Input
              id={id}
              className="peer pe-9 ps-9"
              placeholder="Search SubCategory..."
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              {isLoading ? (
                <LoaderCircle
                  className="animate-spin"
                  size={16}
                  strokeWidth={2}
                  role="status"
                  aria-label="Loading..."
                />
              ) : (
                <Search size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </div>
            <button
              className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Press to speak"
              type="submit"
            >
              <Mic size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </SubCategorySidebarHeader>
      <SubCategorySidebarContent>
        <ScrollArea className="w-full p-0">
          <div className="mb-2 flex flex-col gap-1 px-2">
            {subCategoryItems.map((item) => (
              <Tooltip key={item.href} placement="rightTop" title={item.title}>
                <Link href={{ pathname: item.href }}>
                  <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <DynamicIcon name={item.icon} className="size-4" />
                    <span className="text-center text-sm leading-tight">
                      {item.title}
                    </span>
                  </SubCategorySidebarMenuButton>
                </Link>
              </Tooltip>
            ))}
          </div>
          {subCategorySidebarState === "expanded" ? (
            <div className="">
              <div className="mx-auto h-auto w-[94%] border-t border-dashed" />
              {/* <NavFavorites favorites={data.favorites} />
              <NavFavorites favorites={data.favorites} />
              <NavFavorites favorites={data.favorites} /> */}
            </div>
          ) : null}
        </ScrollArea>
      </SubCategorySidebarContent>
      <SubCategorySidebarFooter>
        {/* {categorySidebarState === "expanded" ? (
              ""
            ) : (
              <div
                onClick={() => {
                  toggleSidebar()
                }}
                className="flex min-h-8 min-w-8 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <PanelRight className="h-4 w-4" />
              </div>
            )} */}
      </SubCategorySidebarFooter>
      {/* <SubCategorySidebarRail /> */}
    </SubCategorySidebar>
  )
}

export function RightSidebar() {
  const { categorySidebarState, categorySidebarToggleSidebar } = useCategorySidebar()
  const { subCategorySidebarState, subCategorySidebarToggleSidebar } = useSubCategorySidebar()

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
    <div className="ml-auto flex max-h-12 items-center">
      <NavActions />

      <div className="hover:bg-primary-foreground ml-2 flex h-8 items-center justify-center gap-1 rounded-md border px-1.5">
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
  )
}
