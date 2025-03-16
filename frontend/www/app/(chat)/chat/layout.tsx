"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Earth, GlobeIcon, LockIcon, EyeOff, MoreVertical } from "lucide-react"
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from "@/lib/firebase/config"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CategorySidebarProvider } from "@/components/sidebar/category-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { SubCategorySidebarProvider } from "@/components/sidebar/sub-category-sidebar"

// Add type for visibility options
type ChatVisibility = "public" | "private" | "unlisted"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const params = useParams()
  const [title, setTitle] = useState("Untitled Chat")
  const [visibility, setVisibility] = useState<ChatVisibility>("public")

  // Update visibility icon and text mapping
  const visibilityConfig = {
    public: {
      icon: <GlobeIcon className="h-[13px] w-[13px]" />,
      text: "Public",
      description: "Anyone can find and view"
    },
    private: {
      icon: <LockIcon className="h-[13px] w-[13px]" />,
      text: "Private",
      description: "Only you can access"
    },
    unlisted: {
      icon: <EyeOff className="h-[13px] w-[13px]" />,
      text: "Unlisted",
      description: "Anyone with the link can view"
    }
  }

  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!params?.slug) return

      try {
        const chatRef = doc(db, "chats", params.slug as string)
        const chatDoc = await getDoc(chatRef)

        if (chatDoc.exists()) {
          const data = chatDoc.data()
          setTitle(data.title || "Untitled Chat")
          setVisibility(data.visibility || "public")
        }
      } catch (error) {
        console.error("Error fetching chat details:", error)
      }
    }

    fetchChatDetails()
  }, [params?.slug])

  const handleVisibilityChange = async (newVisibility: ChatVisibility) => {
    if (newVisibility === visibility || !params?.slug) return
    
    try {
      const chatRef = doc(db, "chats", params.slug as string)
      await updateDoc(chatRef, {
        visibility: newVisibility
      })
      setVisibility(newVisibility)
    } catch (error) {
      console.error("Error updating visibility:", error)
    }
  }

  return (
    <CategorySidebarProvider>
      <SubCategorySidebarProvider>
        <div className="relative w-full">
          <header className="bg-background absolute left-0 top-0 flex h-12 w-full border-b justify-between items-center px-4">
            <div className="flex h-12 items-center gap-2">
              <span className="flex h-full w-min items-center truncate text-[13px]">
                {title}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:bg-primary-foreground hover:text-primary flex items-center justify-center gap-1 rounded-full border px-2 py-1">
                    {visibilityConfig[visibility].icon}
                    <span className="flex h-full items-center text-[10px]">
                      {visibilityConfig[visibility].text}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {Object.entries(visibilityConfig)
                    .filter(([key]) => key !== visibility)
                    .map(([key, config]) => (
                      <DropdownMenuItem 
                        key={key}
                        onClick={() => handleVisibilityChange(key as ChatVisibility)}
                        className="flex items-center gap-2"
                      >
                        {config.icon}
                        <div className="flex flex-col">
                          <span className="text-sm">{config.text}</span>
                          <span className="text-xs text-muted-foreground">
                            {config.description}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <RightSidebar />
          </header>
          <main className="pt-.5 flex h-screen w-full flex-col overflow-hidden pt-12">
            {children}
          </main>
        </div>
      </SubCategorySidebarProvider>
    </CategorySidebarProvider>
  )
}