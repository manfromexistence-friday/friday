"use client"
import { Button } from "@/registry/new-york/ui/button"
import { Separator } from "@/registry/new-york/ui/separator"
import { ChevronDown, Earth, Type, MessageCircle } from "lucide-react"
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

export function CategoryRightSidebar() {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    categorySidebarState,
    categorySidebarToggleSidebar,
  } = useCategorySidebar();

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
  const { categorySidebarToggleSidebar } = useCategorySidebar();
  const { subCategorySidebarToggleSidebar } = useSubCategorySidebar();

  return (
    <div className="ml-auto flex max-h-12 items-center gap-2">
      <NavActions />
      <Popover open={aiOpen} onOpenChange={setAiOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={aiOpen}
            className="min-w-[100px] justify-between px-2 text-sm"
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
      <div className="flex h-9 items-center justify-center gap-1 rounded-md border px-1.5 hover:bg-primary-foreground">
        <div 
          onClick={() => {categorySidebarToggleSidebar();}}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-background">
          <MessageCircle className="h-4 w-4" />
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div
          onClick={() => {subCategorySidebarToggleSidebar();}}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-background">
          <Type className="h-4 w-4" />
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
