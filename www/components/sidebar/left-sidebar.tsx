"use client"

import * as React from "react"
import Link from "next/link"
import {
  AudioWaveform,
  Blocks,
  BookOpen,
  Bot,
  Calendar,
  CircleSlash2,
  Command,
  Ellipsis,
  Frame,
  GalleryVerticalEnd,
  Home,
  LibraryBig,
  Map,
  MessageCircleQuestion,
  PanelRight,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
  SidebarRail
} from "@/components/ui/sidebar"
import { History } from "@/components/sidebar/history"
import { NavUser } from "@/components/sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import { useCallback } from "react"
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from "next/navigation"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
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

export default function LeftSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar()
  const router = useRouter()
  const { user } = useAuth()
  
  // Create a handler function for the Start New button
  const handleStartNew = useCallback(async () => {
    try {
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to start a new chat",
          duration: 3000,
        });
        return;
      }
      
      // Generate a new UUID for the chat
      const chatId = uuidv4()
      
      // Create initial chat data with empty messages array
      const chatData = {
        id: chatId,
        title: "New Chat",
        messages: [], // Start with empty messages array
        model: "gemini-2.0-flash", // Default model
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creatorUid: user.uid,
        isNew: true // Flag to indicate this is a brand new chat
      }

      // Store chat data in Firestore
      await setDoc(doc(db, "chats", chatId), chatData)
      
      // Store information in sessionStorage
      sessionStorage.setItem('selectedAI', "gemini-2.0-flash")
      sessionStorage.setItem('chatId', chatId)
      sessionStorage.setItem('isNewChat', 'true')
      
      // Navigate to the new chat
      router.push(`/chat/${chatId}`)
      
    } catch (error) {
      console.error("Error creating new chat:", error)
      toast.error("Failed to create new chat", {
        description: "Please try again"
      });
    }
  }, [user, router])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="w-full p-0">
          <div className="mb-2 flex flex-col gap-1 px-2">
            {/* Replace Link with button that calls our handler */}
            <button 
              onClick={handleStartNew}
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex min-h-8 min-w-8 items-center justify-center rounded-md border text-sm"
            >
              {state === "expanded" ? (
                "Start New"
              ) : (
                <Plus className="size-4" />
              )}
            </button>

            <Link href="/">
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Home className="size-4" />
                <span className="text-center text-sm leading-tight">
                  Home
                </span>
              </SidebarMenuButton>
            </Link>

            <Link href="/automations">
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Sparkles className="size-4" />
                <span className="text-center text-sm leading-tight">
                  Automations
                </span>
              </SidebarMenuButton>
            </Link>

            <Link href="/variants">
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <CircleSlash2 className="size-4" />
                <span className="text-center text-sm leading-tight">
                  Varients
                </span>
              </SidebarMenuButton>
            </Link>

            <Link href="/library">
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <LibraryBig className="size-4" />
                <span className="text-center text-sm leading-tight">
                  Library
                </span>
              </SidebarMenuButton>
            </Link>

            <Link href={{ pathname: "/more" }}>
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Ellipsis className="size-4" />
                <span className="text-center text-sm leading-tight">
                  More
                </span>
              </SidebarMenuButton>
            </Link>

            {/* <Tooltip placement="rightTop" title="Home">
              <Link href="/home">
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Home className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Home
                  </span>
                </SidebarMenuButton>
              </Link>
            </Tooltip>

            <Tooltip placement="rightTop" title="Automations">
              <Link href="/automations">
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Automations
                  </span>
                </SidebarMenuButton>
              </Link>
            </Tooltip>

            <Tooltip placement="rightTop" title="Varients">
              <Link href="/variants">
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <CircleSlash2 className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Varients
                  </span>
                </SidebarMenuButton>
              </Link>
            </Tooltip>

            <Tooltip placement="rightTop" title="Library">
              <Link href="/library">
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <LibraryBig className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    Library
                  </span>
                </SidebarMenuButton>
              </Link>
            </Tooltip>

            <Tooltip placement="rightTop" title="More">
              <Link href="/more">
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Ellipsis className="h-4 w-4" />
                  <span className="text-center text-sm leading-tight">
                    More
                  </span>
                </SidebarMenuButton>
              </Link>
            </Tooltip> */}
          </div>
          {state === "expanded" ? (
            <div className="">
              <div className="mx-auto h-auto w-[94%] border-t border-dashed" />
              <History />
            </div>
          ) : null}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {state === "expanded" ? (
          ""
        ) : (
          <div
            onClick={() => {
              toggleSidebar()
            }}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex min-h-8 min-w-8 items-center justify-center rounded-md"
          >
            <PanelRight className="size-4" />
          </div>
        )}
        {/* <SettingsDialog /> */}
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
