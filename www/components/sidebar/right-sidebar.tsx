"use client"

import * as React from "react"
import { useEffect, useId, useState } from "react"
import Link from "next/link"
import { ais, data } from "@/data"
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
            <Tooltip placement="rightTop" title="Home">
              <Link href="/home">
                <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Home className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Home
                  </span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Automations">
              <Link href="/automations">
                <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Automations
                  </span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Varients">
              <Link href="/variants">
                <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <CircleSlash2 className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Varients
                  </span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>

            <Tooltip placement="rightTop" title="Library">
              <Link href="/library">
                <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <LibraryBig className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Library
                  </span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>

            <Tooltip placement="rightTop" title="More">
              <Link href="/more">
                <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Ellipsis className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    More
                  </span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>
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
            <Tooltip placement="rightTop" title="Home">
              <Link href="/home">
                <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Home className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Home
                  </span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Automations">
              <Link href="/automations">
                <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Automations
                  </span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Varients">
              <Link href="/variants">
                <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <CircleSlash2 className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Varients
                  </span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Library">
              <Link href="/library">
                <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <LibraryBig className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Library
                  </span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="More">
              <Link href="/more">
                <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Ellipsis className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    More
                  </span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
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
            className="mx-2 min-w-[100px] justify-between px-2 text-sm"
          >
            {value ? ais.find((ai) => ai.value === value)?.label : "Friday"}
            <ChevronDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mr-2 w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search ai..." />
            <CommandList>
              <CommandEmpty>No ai found.</CommandEmpty>
              <CommandGroup>
                {ais.map((ai) => (
                  <CommandItem
                    key={ai.value}
                    value={ai.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
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
      <div className="hover:bg-primary-foreground mr-2 flex h-9 items-center justify-center gap-1 rounded-md border px-1.5">
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
