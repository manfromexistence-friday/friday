"use client"
import { Button } from "@/registry/new-york/ui/button"
import { Separator } from "@/registry/new-york/ui/separator"
import { ChevronDown, Earth, Type, MessageCircle, Microscope } from "lucide-react"
import { CategorySidebarProvider } from "@/components/sidebar/category-sidebar"
import { SubCategorySidebarProvider } from "@/components/sidebar/sub-category-sidebar"
import { CategorySidebar, CategorySidebarContent } from "@/components/sidebar/category-sidebar"
import { SubCategorySidebar, SubCategorySidebarContent } from "@/components/sidebar/sub-category-sidebar"
import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AudioWaveform,
  Blocks,
  BookOpen,
  Bot,
  Calendar,
  CircleSlash2,
  Ellipsis,
  Frame,
  GalleryVerticalEnd,
  Home,
  LibraryBig,
  Map,
  MessageCircleQuestion,
  PieChart,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
  CircleDotDashed

} from "lucide-react"
import { NavActions } from "@/components/sidebar/nav-actions"
import { Tooltip } from 'antd';
import Link from "next/link"
import { NavFavorites } from "@/components/sidebar/favorites"
import { ScrollArea } from "@/components/scroll-area"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/new-york/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"
import { Input } from "@/registry/new-york/ui/input";
import { LoaderCircle, Mic, Search } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  CategorySidebarFooter,
  CategorySidebarHeader,
  CategorySidebarMenuButton,
  CategorySidebarRail,
  useCategorySidebar,
} from "@/components/sidebar/category-sidebar"
import {
  SubCategorySidebarFooter,
  SubCategorySidebarHeader,
  SubCategorySidebarMenuButton,
  SubCategorySidebarRail,
  useSubCategorySidebar,
} from "@/components/sidebar/sub-category-sidebar"
import { SidebarProvider } from "@/components/sidebar/actions-sidebar"
import { useCallback, useRef } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Globe, Paperclip, Plus, Send } from "lucide-react"
import { Textarea } from "@/registry/new-york/ui/textarea"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

const AnimatedPlaceholder = ({ showSearch, showResearch }: { showSearch: boolean, showResearch: boolean }) => (
  <AnimatePresence mode="wait">
    <motion.p
      key={showSearch ? "search" : "ask"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.1 }}
      className="pointer-events-none absolute w-[150px] text-sm text-muted-foreground"
    >
      {showSearch ? "Search the web..." : showResearch ? "Show Thinking..." : "Ask Friday..."}
    </motion.p>
  </AnimatePresence>
)

export function AiInput() {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })
  const [showSearch, setShowSearch] = useState(false)
  const [showResearch, setShowReSearch] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handelClose = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input
    }
    setImagePreview(null) // Use null instead of empty string
  }

  const handelChange = (e: any) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = () => {
    setValue("")
    adjustHeight(true)
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])
  return (
    <div className="fixed bottom-0 w-full py-4">
      <div className="relative mx-auto w-full max-w-xl rounded-[22px] p-1">
        <div className="relative flex flex-col rounded-2xl border bg-primary-foreground">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          >
            <div className="relative">
              <Textarea
                id="ai-input"
                value={value}
                placeholder=""
                className="w-full resize-none rounded-2xl rounded-b-none border-none px-4 py-3 leading-[1.2] focus-visible:ring-0 "
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                onChange={(e) => {
                  setValue(e.target.value)
                  adjustHeight()
                }}
              />
              {!value && (
                <div className="absolute left-4 top-3">
                  <AnimatedPlaceholder showResearch={showResearch} showSearch={showSearch} />
                </div>
              )}
            </div>
          </div>

          <div className="h-12 rounded-b-xl">
            <div className="absolute bottom-3 left-3 flex items-center gap-1">
              <label
                className={cn(
                  "relative cursor-pointer rounded-full p-2",
                  imagePreview
                    ? "border bg-background text-primary"
                    : "text-muted-foreground"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handelChange}
                  className="hidden"
                />
                <Paperclip
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-colors hover:text-primary",
                    imagePreview && "text-primary"
                  )}
                />
                {imagePreview && (
                  <div className="absolute bottom-[105px] left-0 h-[50px] w-[50px]">
                    <Image
                      className="rounded-lg object-cover"
                      src={imagePreview || "/picture1.jpeg"}
                      height={500}
                      width={500}
                      alt="additional image"
                    />
                    <button
                      onClick={handelClose}
                      className="shadow-3xl absolute -left-2 -top-2 rotate-45 rounded-lg"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  </div>
                )}
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(!showSearch)
                }}
                className={cn(
                  "flex h-8 items-center gap-1 rounded-full border px-2 py-0.5 transition-all",
                  showSearch
                    ? "border bg-background text-muted-foreground hover:text-primary"
                    : "border-transparent"
                )}
              >
                <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 180 : 0,
                      scale: showSearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showSearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Globe
                      className={cn(
                        "h-4 w-4 text-muted-foreground hover:text-primary",
                        showSearch ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 overflow-hidden whitespace-nowrap text-[11px] text-primary"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReSearch(!showResearch)
                }}
                className={cn(
                  "flex h-8 items-center gap-2 rounded-full border px-1.5 py-1 transition-all",
                  showResearch
                    ? "border bg-background text-muted-foreground hover:text-primary"
                    : "border-transparent"
                )}
              >
                <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: showResearch ? 180 : 0,
                      scale: showResearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showResearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <CircleDotDashed
                      className={cn(
                        "h-4 w-4 text-muted-foreground hover:text-primary",
                        showResearch ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showResearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 overflow-hidden whitespace-nowrap text-[11px] text-primary"
                    >
                      Research
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute bottom-3 right-3">
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "rounded-full p-2 text-muted-foreground transition-colors hover:text-primary",
                  value
                    ? " text-primary"
                    : " text-muted-foreground    "
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



export function CategoryRightSidebar() {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    if (inputValue) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [inputValue]);

  const { categorySidebarState, categorySidebarToggleSidebar } = useCategorySidebar();
  const { subCategorySidebarState, subCategorySidebarToggleSidebar } = useSubCategorySidebar();
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
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
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
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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
                  <span className="text-center text-sm leading-tight">Home</span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Automations">
              <Link href="/automations">
                <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">Automations</span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Varients">
              <Link href="/variants">
                <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <CircleSlash2 className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">Varients</span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>

            <Tooltip placement="rightTop" title="Library">
              <Link href="/library">
                <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <LibraryBig className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">Library</span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>

            <Tooltip placement="rightTop" title="More">
              <Link href="/more">
                <CategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Ellipsis className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">More</span>
                </CategorySidebarMenuButton>
              </Link>
            </Tooltip>
          </div>
          {categorySidebarState === "expanded" ? <div className="">
            <div className="mx-auto h-auto w-[94%] border-t border-dashed" />
            <NavFavorites favorites={data.favorites} />
            <NavFavorites favorites={data.favorites} />
            <NavFavorites favorites={data.favorites} />
          </div> : null}
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
      <CategorySidebarRail />
    </CategorySidebar>
  )
}

export function SubCategoryRightSidebar() {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    subCategorySidebarState,
    subCategorySidebarToggleSidebar,
  } = useSubCategorySidebar();

  useEffect(() => {
    if (inputValue) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [inputValue]);

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
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
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
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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
                  <span className="text-center text-sm leading-tight">Home</span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Automations">
              <Link href="/automations">
                <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">Automations</span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Varients">
              <Link href="/variants">
                <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <CircleSlash2 className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">Varients</span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="Library">
              <Link href="/library">
                <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <LibraryBig className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">Library</span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
            <Tooltip placement="rightTop" title="More">
              <Link href="/more">
                <SubCategorySidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Ellipsis className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">More</span>
                </SubCategorySidebarMenuButton>
              </Link>
            </Tooltip>
          </div>
          {subCategorySidebarState === "expanded" ? <div className="">
            <div className="mx-auto h-auto w-[94%] border-t border-dashed" />
            <NavFavorites favorites={data.favorites} />
            <NavFavorites favorites={data.favorites} />
            <NavFavorites favorites={data.favorites} />
          </div> : null}
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
      <SubCategorySidebarRail />
    </SubCategorySidebar>
  )
}

export function RightSidebar() {
  const [aiOpen, setAiOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { categorySidebarState, categorySidebarToggleSidebar } = useCategorySidebar();
  const { subCategorySidebarState, subCategorySidebarToggleSidebar } = useSubCategorySidebar();

  const handleCategorySidebarToggle = () => {
    categorySidebarToggleSidebar();
    if (subCategorySidebarState === "expanded") {
      subCategorySidebarToggleSidebar();
    }
  };

  const handleSubCategorySidebarToggle = () => {
    subCategorySidebarToggleSidebar();
    if (categorySidebarState === "expanded") {
      categorySidebarToggleSidebar();
    }
  };

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
            {value
              ? ais.find((ai) => ai.value === value)?.label
              : "Friday"}
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
      <div className="mr-2 flex h-9 items-center justify-center gap-1 rounded-md border px-1.5 hover:bg-primary-foreground">
        <div
          onClick={handleCategorySidebarToggle}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-background">
          <MessageCircle className={cn(categorySidebarState === "expanded" ? "text-primary" : "text-muted-foreground", "h-4 w-4")} />
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div
          onClick={handleSubCategorySidebarToggle}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-background">
          <Type className={cn(subCategorySidebarState === "expanded" ? "text-primary" : "text-muted-foreground", "h-4 w-4")} />
        </div>
      </div>
      <CategoryRightSidebar />
      <SubCategoryRightSidebar />
    </div>
  )
}

export default function Page() {
  return (
    <main className="w-full">
      <header className="flex">
        <div className="flex h-12 p-2">
          <span className="text-muted-foregournd flex h-full w-48 items-center truncate text-[13px] hover:text-primary">Project Management and stuffs</span>
          <div className="flex items-center justify-center gap-1 rounded-full border px-2 py-1 hover:bg-primary-foreground hover:text-primary ">
            <Earth className="h-[13px] w-[13px]" />
            <span className="flex h-full items-center text-[10px]">
              Public
            </span>
          </div>
        </div>
        <CategorySidebarProvider>
          <SubCategorySidebarProvider>
            <RightSidebar />
          </SubCategorySidebarProvider>
        </CategorySidebarProvider>
      </header>
      <AiInput />
    </main>
  )
}


const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Templates",
      url: "#",
      icon: Blocks,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
  favorites: [
    {
      name: "Project Management & Task Tracking",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Family Recipe Collection & Meal Planning",
      url: "#",
      emoji: "🍳",
    },
    {
      name: "Fitness Tracker & Workout Routines",
      url: "#",
      emoji: "💪",
    },
    {
      name: "Book Notes & Reading List",
      url: "#",
      emoji: "📚",
    },
    {
      name: "Sustainable Gardening Tips & Plant Care",
      url: "#",
      emoji: "🌱",
    },
    {
      name: "Language Learning Progress & Resources",
      url: "#",
      emoji: "🗣️",
    },
    {
      name: "Home Renovation Ideas & Budget Tracker",
      url: "#",
      emoji: "🏠",
    },
    {
      name: "Personal Finance & Investment Portfolio",
      url: "#",
      emoji: "💰",
    },
    {
      name: "Movie & TV Show Watchlist with Reviews",
      url: "#",
      emoji: "🎬",
    },
    {
      name: "Daily Habit Tracker & Goal Setting",
      url: "#",
      emoji: "✅",
    },
  ],
  workspaces: [
    {
      name: "Personal Life Management",
      emoji: "🏠",
      pages: [
        {
          name: "Daily Journal & Reflection",
          url: "#",
          emoji: "📔",
        },
        {
          name: "Health & Wellness Tracker",
          url: "#",
          emoji: "🍏",
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "#",
          emoji: "🌟",
        },
      ],
    },
    {
      name: "Professional Development",
      emoji: "💼",
      pages: [
        {
          name: "Career Objectives & Milestones",
          url: "#",
          emoji: "🎯",
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "#",
          emoji: "🧠",
        },
        {
          name: "Networking Contacts & Events",
          url: "#",
          emoji: "🤝",
        },
      ],
    },
    {
      name: "Creative Projects",
      emoji: "🎨",
      pages: [
        {
          name: "Writing Ideas & Story Outlines",
          url: "#",
          emoji: "✍️",
        },
        {
          name: "Art & Design Portfolio",
          url: "#",
          emoji: "🖼️",
        },
        {
          name: "Music Composition & Practice Log",
          url: "#",
          emoji: "🎵",
        },
      ],
    },
    {
      name: "Home Management",
      emoji: "🏡",
      pages: [
        {
          name: "Household Budget & Expense Tracking",
          url: "#",
          emoji: "💰",
        },
        {
          name: "Home Maintenance Schedule & Tasks",
          url: "#",
          emoji: "🔧",
        },
        {
          name: "Family Calendar & Event Planning",
          url: "#",
          emoji: "📅",
        },
      ],
    },
    {
      name: "Travel & Adventure",
      emoji: "🧳",
      pages: [
        {
          name: "Trip Planning & Itineraries",
          url: "#",
          emoji: "🗺️",
        },
        {
          name: "Travel Bucket List & Inspiration",
          url: "#",
          emoji: "🌎",
        },
        {
          name: "Travel Journal & Photo Gallery",
          url: "#",
          emoji: "📸",
        },
      ],
    },
  ],
}

const ais = [

  {
    value: "chatgpt",
    label: "ChatGPT"
  },
  {
    value: "bard",
    label: "Bard"
  },
  {
    value: "llama2",
    label: "Llama 2"
  },
  {
    value: "claude",
    label: "Claude"
  },
  {
    value: "dalle2",
    label: "DALL-E 2"
  },
  {
    value: "midjourney",
    label: "Midjourney"
  },
  {
    value: "stable_diffusion",
    label: "Stable Diffusion"
  },
  {
    value: "gpt3",
    label: "GPT-3"
  },
  {
    value: "gpt4",
    label: "GPT-4"
  },
  {
    value: "palm2",
    label: "PaLM 2"
  },
  {
    value: "ernie",
    label: "ERNIE"
  },
  {
    value: "bloom",
    label: "BLOOM"
  },
  {
    value: "jurassic2",
    label: "Jurassic-2"
  },
  {
    value: "cohere",
    label: "Cohere"
  },
  {
    value: "ai21_labs_j2",
    label: "AI21 Labs J2"
  }
]
