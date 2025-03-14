"use client"

import * as React from "react"
import { useEffect, useId, useState, ElementType } from "react"
import Link from "next/link"
import { ais, data } from "@/data"
import { aiService } from "@/lib/services/ai-service"
import { Tooltip } from "antd"
import {
  Check,
  ChevronDown,
  CircleSlash2,
  Ellipsis,
  Home,
  LibraryBig,
  LoaderCircle,
  MessageCircle,
  Mic,
  Search,
  Sparkles,
  Type,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider } from "@/components/sidebar/actions-sidebar"
import {
  CategorySidebar,
  CategorySidebarContent,
  CategorySidebarFooter,
  CategorySidebarHeader,
  CategorySidebarMenuButton,
  useCategorySidebar,
} from "@/components/sidebar/category-sidebar"
import { NavFavorites } from "@/components/sidebar/favorites"
import { NavActions } from "@/components/sidebar/nav-actions"
import {
  SubCategorySidebar,
  SubCategorySidebarContent,
  SubCategorySidebarFooter,
  SubCategorySidebarHeader,
  SubCategorySidebarMenuButton,
  useSubCategorySidebar,
} from "@/components/sidebar/sub-category-sidebar"
import { Switch } from "../ui/switch"
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

export function CategoryRightSidebar() {
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
  useSubCategorySidebar()
  return (
    <CategorySidebar side="right">
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
                <Link href={item.href}>
                  <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <DynamicIcon name={item.icon} className="h-4 w-4" />
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
              <NavFavorites favorites={data.favorites} />
              <NavFavorites favorites={data.favorites} />
              <NavFavorites favorites={data.favorites} />
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

export function SubCategoryRightSidebar() {
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
    <SubCategorySidebar side="right">
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
                <Link href={item.href}>
                  <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <DynamicIcon name={item.icon} className="h-4 w-4" />
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
              <NavFavorites favorites={data.favorites} />
              <NavFavorites favorites={data.favorites} />
              <NavFavorites favorites={data.favorites} />
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
  const [aiOpen, setAiOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const { categorySidebarState, categorySidebarToggleSidebar } =
    useCategorySidebar()
  const { subCategorySidebarState, subCategorySidebarToggleSidebar } =
    useSubCategorySidebar()

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
      <SidebarProvider>
        <NavActions />
      </SidebarProvider>

      <Popover open={aiOpen} onOpenChange={setAiOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={aiOpen}
            className="mx-2 min-w-[200px] justify-between px-2 text-xs h-8"
          >
            <span className="w-32 truncate text-start">
              {value
                ? ais.find((ai) => ai.value === value)?.label
                : "Gemini 2.0 Flash"}
            </span>
            <ChevronDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mr-2 w-[200px] p-0 text-xs">
          <Command>
            <CommandInput placeholder="Search ai..." />
            <CommandList>
              <CommandEmpty>No ai found.</CommandEmpty>
              <CommandGroup>
                {ais.map((ai) => (
                  <CommandItem
                    className="text-xs"
                    key={ai.value}
                    value={ai.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      // Update AI service with new model
                      aiService.setModel(currentValue === value ? "gemini-2.0-flash" : currentValue)
                      setAiOpen(false)
                    }}
                  >
                    {ai.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === ai.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="hover:bg-primary-foreground mr-2 flex h-8 items-center justify-center gap-1 rounded-md border px-1.5">
        <div
          onClick={handleCategorySidebarToggle}
          className="hover:bg-background flex h-6 w-6 items-center justify-center rounded-md"
        >
          <MessageCircle
            className={cn(
              categorySidebarState === "expanded"
                ? "text-primary"
                : "text-muted-foreground",
              "h-4 w-4"
            )}
          />
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div
          onClick={handleSubCategorySidebarToggle}
          className="hover:bg-background flex h-6 w-6 items-center justify-center rounded-md"
        >
          <Type
            className={cn(
              subCategorySidebarState === "expanded"
                ? "text-primary"
                : "text-muted-foreground",
              "h-4 w-4"
            )}
          />
        </div>
      </div>
      <CategoryRightSidebar />
      <SubCategoryRightSidebar />
    </div>
  )
}
