"use client"

import { useParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from "@/lib/firebase/config"
import { GlobeIcon, LockIcon, EyeOff, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CategorySidebarProvider } from "@/components/sidebar/category-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { SubCategorySidebarProvider } from "@/components/sidebar/sub-category-sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

type ChatVisibility = "public" | "private" | "unlisted"

interface ChatData {
  id: string
  title: string
  visibility: ChatVisibility
  createdAt: string
  updatedAt: string
  creatorUID: string
}

const visibilityConfig = {
  public: {
    icon: <GlobeIcon className="size-[13px]" />,
    text: "Public",
    description: "Visible to everyone",
  },
  private: {
    icon: <LockIcon className="size-[13px]" />,
    text: "Private",
    description: "Only visible to you",
  },
  unlisted: {
    icon: <EyeOff className="size-[13px]" />,
    text: "Unlisted",
    description: "Only accessible via link",
  },
} as const

export default function AppLayout({ children }: AppLayoutProps) {
  const params = useParams()
  const queryClient = useQueryClient()
  const [isChangingVisibility, setIsChangingVisibility] = useState(false)

  const { 
    data: chatData,
    isLoading 
  } = useQuery<ChatData | null>({
    queryKey: ['chat', params?.slug],
    queryFn: async () => {
      if (!params?.slug) return null
      
      // Try to get from cache first
      const cachedData = queryClient.getQueryData(['chat', params.slug])
      if (cachedData) return cachedData as ChatData

      const chatRef = doc(db, "chats", params.slug as string)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) {
        return null
      }
      
      const data = {
        id: chatDoc.id,
        ...(chatDoc.data() as Omit<ChatData, 'id'>)
      }

      return data
    },
    enabled: !!params?.slug,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data in garbage collection for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false // Prevent refetch when component mounts
  })

  // Add real-time updates with optimistic UI
  useEffect(() => {
    if (!params?.slug) return

    const chatRef = doc(db, "chats", params.slug as string)
    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const data = {
          id: doc.id,
          ...doc.data()
        }
        queryClient.setQueryData(['chat', params.slug], data)
      }
    })

    return () => unsubscribe()
  }, [params?.slug, queryClient])

  const title = chatData?.title || "Untitled Chat"
  const visibility = chatData?.visibility || "public"

  const handleVisibilityChange = async (newVisibility: ChatVisibility) => {
    if (!params?.slug || newVisibility === visibility) return
    
    setIsChangingVisibility(true)
    try {
      const chatRef = doc(db, "chats", params.slug as string)
      await updateDoc(chatRef, {
        visibility: newVisibility,
        updatedAt: new Date().toISOString()
      })
      
      // Update React Query cache with proper typing
      queryClient.setQueryData<ChatData | null>(['chat', params.slug], (oldData) => {
        if (!oldData) return null
        return {
          ...oldData,
          visibility: newVisibility,
          updatedAt: new Date().toISOString()
        }
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    } catch (error) {
      console.error("Error updating visibility:", error)
    } finally {
      setIsChangingVisibility(false)
    }
  }

  return (
    <CategorySidebarProvider>
      <SubCategorySidebarProvider>
        <div className="relative w-full">
          <header className="bg-background absolute left-0 top-0 h-12 w-full items-center justify-between border-b px-4 hidden lg:flex">
            <div className="flex h-12 items-center gap-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="bg-muted h-4 w-24 animate-pulse rounded"></div>
                </div>
              ) : (
                <>
                  <span className="flex h-full w-min items-center truncate text-[13px]">
                    {title}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="hover:bg-primary-foreground hover:text-primary flex items-center justify-center gap-1 rounded-full border px-2 py-1"
                        disabled={isChangingVisibility}
                      >
                        {isChangingVisibility ? (
                          <>
                            <Loader2 className="size-[13px] animate-spin" />
                            <span className="flex h-full items-center text-[10px]">
                              Changing...
                            </span>
                          </>
                        ) : (
                          <>
                            {visibilityConfig[visibility].icon}
                            <span className="flex h-full items-center text-[10px]">
                              {visibilityConfig[visibility].text}
                            </span>
                          </>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {Object.entries(visibilityConfig)
                        .filter(([key]) => key !== visibility)
                        .map(([key, config]) => (
                          <DropdownMenuItem 
                            key={key}
                            onClick={() => handleVisibilityChange(key as ChatVisibility)}
                            className="flex items-center gap-2"
                            disabled={isChangingVisibility}
                          >
                            {config.icon}
                            <div className="flex flex-col">
                              <span className="text-sm">{config.text}</span>
                              <span className="text-muted-foreground text-xs">
                                {config.description}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
            <RightSidebar />
          </header>
          <main className="pt-.5 flex h-screen w-full flex-col overflow-hidden pt-16 lg:pt-12">
            {children}
          </main>
        </div>
      </SubCategorySidebarProvider>
    </CategorySidebarProvider>
  )
}