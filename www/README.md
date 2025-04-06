# Friday Website
Your ai friend in the website!

```
"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase/config"
import { User as FirebaseUser } from "firebase/auth"
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  StarOff,
  Trash2,
  MessageSquare,
  Edit2,
  Loader,
  Search, // Add Search icon
  ChevronRight
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command" // Import Command components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { collection, query, getDocs, onSnapshot, doc, deleteDoc, updateDoc, getDoc, where } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"

// Modify the Chat interface to include isPinned
interface Chat {
  id: string;
  name: string;
  title: string;
  url: string;
  emoji: string;
  creatorUid: string;
  lastMessage?: string;
  timestamp?: number;
  isPinned?: boolean;
}

// Format date in a user-friendly way
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // For dates today
  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }
  
  // For dates yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  // For dates within the last 7 days
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (date > oneWeekAgo) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[date.getDay()];
  }
  
  // For dates this year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  
  // For older dates
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Group chats by time periods
const groupChatsByTimePeriod = (chats: Chat[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastMonthStart = new Date(today);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  const lastYearStart = new Date(today);
  lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);

  return {
    today: chats.filter(chat => chat.timestamp && new Date(chat.timestamp) >= today),
    yesterday: chats.filter(chat => chat.timestamp && new Date(chat.timestamp) >= yesterday && new Date(chat.timestamp) < today),
    lastWeek: chats.filter(chat => chat.timestamp && new Date(chat.timestamp) >= lastWeekStart && new Date(chat.timestamp) < yesterday),
    lastMonth: chats.filter(chat => chat.timestamp && new Date(chat.timestamp) >= lastMonthStart && new Date(chat.timestamp) < lastWeekStart),
    lastYear: chats.filter(chat => chat.timestamp && new Date(chat.timestamp) >= lastYearStart && new Date(chat.timestamp) < lastMonthStart),
    older: chats.filter(chat => chat.timestamp && new Date(chat.timestamp) < lastYearStart)
  };
};

export function History() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  // Extract the current chat ID from pathname
  const currentChatId = pathname?.startsWith('/chat/')
    ? pathname.replace('/chat/', '')
    : null

  // Firebase user data with type safety
  const userUid = (user as FirebaseUser)?.uid

  const { data: chats = [], isLoading } = useQuery<Chat[]>({
    queryKey: ['chats', userUid],
    queryFn: async () => {
      if (!userUid) return []

      // Try to get from cache first
      const cachedData = queryClient.getQueryData(['chats', userUid])
      if (cachedData) return cachedData as Chat[]

      const q = query(
        collection(db, "chats"),
        where("creatorUid", "==", userUid)
      )
      const snapshot = await getDocs(q)
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Chat))

      // Sort the chats by pinned status first, then by timestamp
      return chats.sort((a, b) => {
        // First sort by pinned status
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then sort by timestamp
        return (b.timestamp || 0) - (a.timestamp || 0);
      })
    },
    enabled: !!userUid,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false // Prevent refetch when component mounts
  })

  // Add real-time updates
  useEffect(() => {
    if (!userUid) return

    const q = query(
      collection(db, "chats"),
      where("creatorUid", "==", userUid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      queryClient.setQueryData(['chats', userUid], (oldData: Chat[] = []) => {
        const newData = [...oldData]

        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data()
          const chatData = {
            id: change.doc.id,
            ...data
          } as Chat

          if (change.type === 'added' || change.type === 'modified') {
            const index = newData.findIndex(chat => chat.id === change.doc.id)
            if (index > -1) {
              newData[index] = chatData
            } else {
              newData.push(chatData)
            }
          } else if (change.type === 'removed') {
            const index = newData.findIndex(chat => chat.id === change.doc.id)
            if (index > -1) {
              newData.splice(index, 1)
            }
          }
        })

        return newData.sort((a, b) => {
          // First sort by pinned status
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          // Then sort by timestamp
          return (b.timestamp || 0) - (a.timestamp || 0);
        })
      })
    })

    return () => unsubscribe()
  }, [queryClient, userUid])

  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<{ id: string, title: string } | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  // Debug rendered state
  useEffect(() => {
    console.log('Rendered chats:', chats)
    console.log('Is loading:', isLoading)
  }, [chats, isLoading])

  const handleRename = async (chatId: string, currentTitle: string) => {
    setSelectedChat({ id: chatId, title: currentTitle })
    setNewTitle(currentTitle)
    setIsRenameOpen(true)
  }

  const confirmRename = async () => {
    if (!selectedChat || !newTitle || newTitle === selectedChat.title) {
      setIsRenameOpen(false)
      return
    }

    try {
      const chatRef = doc(db, "chats", selectedChat.id)
      await updateDoc(chatRef, {
        title: newTitle
      })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      toast.success("Chat renamed successfully")
    } catch (error) {
      console.error("Error renaming chat:", error)
      toast.error("Failed to rename chat")
    }
    setIsRenameOpen(false)
  }

  const handleDelete = (chatId: string, title: string) => {
    setSelectedChat({ id: chatId, title })
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedChat) return

    try {
      await deleteDoc(doc(db, "chats", selectedChat.id))
      toast.success("Chat deleted successfully")
    } catch (error) {
      console.error("Error deleting chat:", error)
      toast.error("Failed to delete chat")
    }
    setIsDeleteOpen(false)
  }

  const handleCopyLink = (chatId: string) => {
    const url = `${window.location.origin}/chat/${chatId}`
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"))
  }

  const handleOpenNewTab = (chatId: string) => {
    window.open(`/chat/${chatId}`, '_blank')
  }

  // Modify the handleTogglePin function to also update the timestamp
  const handleTogglePin = async (chatId: string, currentPinned: boolean) => {
    try {
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        isPinned: !currentPinned,
        timestamp: Date.now() // Update timestamp to current time when pin status changes
      })
      toast.success(currentPinned ? "Chat unpinned" : "Chat pinned")

      // No need to invalidate queries as onSnapshot will handle the update
    } catch (error) {
      console.error("Error updating pin status:", error)
      toast.error("Failed to update pin status")
    }
  }

  // Update prefetchChat to use strict UID checking
  const prefetchChat = async (chatId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['chat', chatId],
      queryFn: async () => {
        const chatRef = doc(db, "chats", chatId)
        const chatDoc = await getDoc(chatRef)

        if (!chatDoc.exists()) return null

        const data = chatDoc.data()
        if (data.creatorUid !== userUid) {
          console.warn(`Unauthorized access attempt to chat ${chatId}`)
          return null
        }

        return {
          id: chatDoc.id,
          ...data
        }
      },
      staleTime: 1000 * 30
    })
  }

  // Function to handle search
  const handleSearch = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    setIsCommandOpen(false)
  }

  // Helper function to render chat items
  const renderChatItem = (chat: Chat) => {
    const isActive = chat.id === currentChatId;
    
    return (
      <SidebarMenuItem key={chat.id}>
        <SidebarMenuButton
          asChild
          className={isActive ? "bg-accent text-accent-foreground" : ""}
        >
          <a
            href={`/chat/${chat.id}`}
            title={chat.title}
            onMouseEnter={() => prefetchChat(chat.id)}
          >
            <MessageSquare />
            <span className="w-[170px] truncate">{chat.title}</span>
          </a>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction showOnHover>
              <MoreHorizontal />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            <DropdownMenuItem onClick={() => handleRename(chat.id, chat.title)}>
              <Edit2 className="text-muted-foreground" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTogglePin(chat.id, !!chat.isPinned)}>
              {chat.isPinned ? (
                <>
                  <StarOff className="text-muted-foreground" />
                  <span>Unpin</span>
                </>
              ) : (
                <>
                  <svg className="text-muted-foreground" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>Pin</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleCopyLink(chat.id)}>
              <Link className="text-muted-foreground" />
              <span>Copy Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenNewTab(chat.id)}>
              <ArrowUpRight className="text-muted-foreground" />
              <span>Open in New Tab</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(chat.id, chat.title)}>
              <Trash2 className="text-muted-foreground" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <>
      <SidebarGroup className="!py-0 group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="mb-1 flex items-center justify-between !py-0 px-0">
          <span className="ml-0.5">
            Chats
          </span>
        </SidebarGroupLabel>
        <SidebarMenu>
          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-start px-0.5">
              <Loader className="mr-2 size-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-muted-foreground flex items-center justify-start px-0.5">
              <span className="text-sm">No chats yet</span>
            </div>
          ) : (
            <>
              {(() => {
                const groupedChats = groupChatsByTimePeriod(chats);
                return (
                  <>
                    {groupedChats.today.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground">
                          Today
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedChats.today.map(chat => renderChatItem(chat))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground">
                          Yesterday
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedChats.yesterday.map(chat => renderChatItem(chat))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <Collapsible defaultOpen className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground">
                          Last 7 Days
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedChats.lastWeek.map(chat => renderChatItem(chat))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <Collapsible className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground">
                          Last Month
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedChats.lastMonth.map(chat => renderChatItem(chat))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {groupedChats.lastYear.length > 0 && (
                      <Collapsible className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground">
                          Last Year
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedChats.lastYear.map(chat => renderChatItem(chat))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {groupedChats.older.length > 0 && (
                      <Collapsible className="mb-2">
                        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground">
                          Older
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {groupedChats.older.map(chat => renderChatItem(chat))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </SidebarMenu>
      </SidebarGroup>

      <CommandDialog
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
      >
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <CommandInput placeholder="Search chats..." />
        <CommandList>
          <CommandEmpty>No chats found.</CommandEmpty>
          <CommandGroup>
            {chats.map((chat) => (
              <CommandItem
                key={chat.id}
                onSelect={() => handleSearch(chat.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <MessageSquare className="mr-2 size-4" />
                  {chat.title}
                </div>
                {chat.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(chat.timestamp)}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new title"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRename}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedChat?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

```

```
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { InlineMath, BlockMath } from 'react-katex'
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import 'katex/dist/katex.min.css'
import type { Components } from 'react-markdown'

// Extend Components type to include math components
declare module 'react-markdown' {
  interface ComponentPropsWithoutRef<T> {
    value?: string;
  }
}

interface ImageGenResponse {
  text: string;
  image: string;
  model_used: string;
  file_path: string;
}

interface ReasoningResponse {
  response: string;
  image?: string;
}

type CustomComponents = Omit<Components, 'code'> & {
    code: React.ComponentType<{ inline?: boolean; className?: string; children?: React.ReactNode } & BasicComponentProps>;
    math: React.ComponentType<{ value: string }>;
    inlineMath: React.ComponentType<{ value: string }>;
}
  
// Custom theme extensions for coldarkDark
const codeTheme = {
    ...coldarkDark,
    'pre[class*="language-"]': {
        ...coldarkDark['pre[class*="language-"]'],
        backgroundColor: 'hsl(var(--background))',
        borderRadius: '0 0 0.5rem 0.5rem',
    },
    'code[class*="language-"]': {
        ...coldarkDark['code[class*="language-"]'],
        backgroundColor: 'transparent',
    }
}

// Helper function to determine if a text might be a data URI for an image
const isDataUri = (text: string): boolean => {
    return text.trim().startsWith('data:image/') && text.includes('base64,');
}

// Helper function to extract the image URLs from content
const extractImageUrls = (content: string): string[] => {
    // This regex looks for data:image URLs in the content, including those in markdown image syntax
    const dataUriRegex = /data:image\/[^;]+;base64,[^\s)"']*/g;
    
    // Also look for image URLs in markdown format: ![...](data:image/...)
    const markdownImageRegex = /!\[[^\]]*\]\((data:image\/[^;]+;base64,[^\s)"']*)\)/g;
    
    let urls: string[] = [];
    
    // Extract direct data URIs
    const directMatches = content.match(dataUriRegex) || [];
    urls = [...urls, ...directMatches];
    
    // Extract URLs from markdown image syntax
    const markdownMatches = Array.from(content.matchAll(markdownImageRegex) || []);
    for (const match of markdownMatches) {
        if (match[1] && !urls.includes(match[1])) {
            urls.push(match[1]);
        }
    }
    
    return Array.from(new Set(urls)); // Remove duplicates
}

// Modify the parseJsonResponse function to better handle image_generation responses

const parseJsonResponse = (content: string): { text: string; imageUrl: string | null; isJsonContent: boolean } => {
    try {
        // First check if this is a full URL to an image endpoint
        if (content.trim().includes('friday-backend.vercel.app/image_generation')) {
            // This might be a direct reference to the image generation endpoint
            return {
                text: "Image generated successfully.",
                imageUrl: content.trim(),
                isJsonContent: true
            };
        }

        // Check if content is valid JSON
        const jsonData = JSON.parse(content);
        
        // Handle direct ImageGenResponse format (most important case)
        if (jsonData.text !== undefined && jsonData.image) {
            console.log("Found ImageGenResponse format", jsonData);
            return {
                text: jsonData.text || "Image generated successfully.",
                imageUrl: jsonData.image,
                isJsonContent: true
            };
        }
        
        // Handle ReasoningResponse format
        if (jsonData.response) {
            console.log("Found ReasoningResponse format", jsonData);
            return {
                text: jsonData.response,
                imageUrl: jsonData.image || null,
                isJsonContent: true
            };
        }
        
        // Other JSON format with image field
        if (jsonData.image) {
            console.log("Found generic JSON with image field", jsonData);
            return {
                text: jsonData.text || "Image generated successfully.",
                imageUrl: jsonData.image,
                isJsonContent: true
            };
        }
        
        // Generic JSON - use the full content
        return {
            text: content,
            imageUrl: null,
            isJsonContent: false
        };
    } catch (e) {
        // Not valid JSON, check if it's a direct URL to an image
        if (content.trim().startsWith('http') && 
            (content.trim().endsWith('.png') || 
             content.trim().endsWith('.jpg') || 
             content.trim().endsWith('.jpeg') || 
             content.trim().endsWith('.gif') ||
             content.trim().includes('image'))) {
            
            return {
                text: "Image generated successfully.",
                imageUrl: content.trim(),
                isJsonContent: true
            };
        }
        
        // Not valid JSON and not an image URL, use as plain text
        return {
            text: content,
            imageUrl: null,
            isJsonContent: false
        };
    }
}

// Add this utility function to check if the content is directly related to image generation
const isImageGenerationContent = (content: string): boolean => {
  return (
    content.includes('image_generation') || 
    content.includes('gemini-2.0-flash-exp-image-generation') ||
    (content.length < 1000 && content.includes('image'))
  );
}

interface CodeBlockProps {
    language: string
    value: string
}

function CodeBlock({ language, value }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="w-full overflow-hidden">
            <div className={cn(
                "bg-background flex items-center justify-between px-4 py-2",
                isCollapsed ? "" : "border-b"
            )}>
                <div className="flex items-center gap-2">
                    <span className='h-full text-center text-sm'>{language}</span>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hover:text-primary text-muted-foreground h-full"
                    >
                        {isCollapsed ? (
                            <ChevronDown className="size-4" />
                        ) : (
                            <ChevronUp className="size-4" />
                        )}
                    </button>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="hover:text-primary text-muted-foreground"
                >
                    {copied ? (
                        <Check className="size-4" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </button>
            </div>
            <div
                className={cn(
                    "transition-all duration-200 ease-in-out",
                    isCollapsed ? "max-h-0" : "max-h-fit"
                )}
            >
                <ScrollArea
                    className="relative w-full text-lg"
                >
                    <div className="min-w-full p-2">
                        <SyntaxHighlighter
                            style={codeTheme}
                            language={language}
                            PreTag="div"
                            customStyle={{
                                margin: 0,
                                background: 'transparent',
                                minWidth: '100%',
                                width: 'fit-content',
                                whiteSpace: 'pre',
                            }}
                        >
                            {value}
                        </SyntaxHighlighter>
                    </div>
                </ScrollArea>
            </div>
        </Card>
    )
}

// Component to render image galleries when multiple images are generated
function ImageGallery({ urls }: { urls: string[] }) {
    if (!urls || urls.length === 0) return null;
    
    return (
        <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {urls.map((url, index) => (
                <div key={index} className="overflow-hidden rounded-lg border shadow-md">
                    <img 
                        src={url} 
                        alt={`Generated image ${index + 1}`} 
                        className="mx-auto h-auto max-h-[60vh] w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.appendChild(
                                document.createTextNode('Failed to load image')
                            );
                        }}
                    />
                    <div className="text-muted-foreground p-2 text-center text-sm">
                        Generated Image {index + 1}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Component to render a single image with caption (for image generation and reasoning)
function GeneratedImage({ url, caption }: { url: string; caption?: string }) {
    const [error, setError] = useState(false);
    
    if (error) {
        return (
            <div className="bg-muted/20 my-4 rounded-lg border p-4 text-center">
                <p className="text-destructive">Failed to load image</p>
            </div>
        );
    }
    
    return (
        <div className="my-6 w-full">
            <div className="overflow-hidden rounded-lg border shadow-md">
                <img 
                    src={url} 
                    alt={caption || 'Generated image'} 
                    className="mx-auto h-auto max-h-[60vh] w-full object-contain"
                    loading="lazy"
                    onError={() => setError(true)}
                />
                {caption && (
                    <div className="text-muted-foreground p-2 text-center text-sm">
                        {caption}
                    </div>
                )}
            </div>
        </div>
    );
}

interface MarkdownPreviewProps {
  content: string
  currentWordIndex?: number
}

// Define a type for the children prop
interface TextRendererProps {
  children: React.ReactNode;
}

// Define basic component props type
interface BasicComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export function MarkdownPreview({ content, currentWordIndex = -1 }: MarkdownPreviewProps) {
    const [parsedContent, setParsedContent] = useState<{
        text: string;
        imageUrl: string | null;
        isJsonContent: boolean;
    }>({ text: content, imageUrl: null, isJsonContent: false });
    
    // Parse content when it changes, with special handling for image generation
    useEffect(() => {
        console.log("Original content:", content);

        // Direct handling for image_generation endpoint
        if (isImageGenerationContent(content)) {
            try {
                // Try to parse as JSON first
                const jsonData = JSON.parse(content);
                if (jsonData.image) {
                    console.log("Found direct image URL in JSON:", jsonData.image);
                    setParsedContent({
                        text: jsonData.text || "Image generated successfully.",
                        imageUrl: jsonData.image,
                        isJsonContent: true
                    });
                    return;
                }
            } catch (e) {
                // Not JSON, might be a direct URL or endpoint reference
                console.log("Not valid JSON, treating as direct reference to image");
                
                // If it looks like a URL or endpoint reference, treat it as an image URL
                if (content.includes('https://') || content.includes('http://')) {
                    setParsedContent({
                        text: "Image generated successfully.",
                        imageUrl: content.trim(),
                        isJsonContent: true
                    });
                    return;
                }
                
                // This could be a case where the model is referring to image generation 
                // but didn't actually provide an image URL
                if (content.includes('image_generation')) {
                    // In this case, we can either show a placeholder or just display the text
                    setParsedContent({
                        text: content,
                        imageUrl: null,
                        isJsonContent: false
                    });
                    return;
                }
            }
        }
        
        // Standard parsing for other content
        const parsed = parseJsonResponse(content);
        console.log("Parsed content:", parsed);
        setParsedContent(parsed);
    }, [content]);

    const splitIntoTokens = (text: string) => {
        return text.match(/[a-zA-Z0-9']+|[^\s\w']+|\s+/g) || []
    }

    // Helper function to safely convert ReactNode to string
    const getTextFromChildren = (children: React.ReactNode): string => {
        if (children === undefined || children === null) return '';
        if (typeof children === 'string') return children;
        if (typeof children === 'number') return String(children);
        if (Array.isArray(children)) {
            return children.map(getTextFromChildren).join('');
        }
        return '';
    }

    const TextRenderer = ({ children }: TextRendererProps) => {
        const plainText = getTextFromChildren(children);
        const tokens = splitIntoTokens(plainText);
        let wordIndex = 0;

        return (
            <>
                {tokens.map((token, index) => {
                    const isWord = /[a-zA-Z0-9']+/.test(token);
                    const tokenIndex = isWord ? wordIndex++ : -1;
                    return (
                        <span
                            key={index}
                            className={isWord && tokenIndex === currentWordIndex ? "bg-primary/20 text-primary rounded px-1 font-medium" : ""}
                        >
                            {token}
                        </span>
                    );
                })}
            </>
        );
    };

    // Build markdown components with proper typing
    const markdownComponents: CustomComponents = {
        code({ inline, className, children, ...props }: { inline?: boolean, className?: string, children?: React.ReactNode } & BasicComponentProps) {
            const match = /language-(\w+)/.exec(className || '')
            if (!inline && match && children) {
                return (
                    <CodeBlock
                        language={match[1]}
                        value={String(children).replace(/\n$/, '')}
                    />
                )
            }
            return (
                <code className={cn("bg-muted rounded-md", className)} {...props}>
                    {children}
                </code>
            )
        },
        // Text formatting components with highlighting
        p: ({ children, ...props }: BasicComponentProps) => (
            <p {...props}>
                <TextRenderer>{children}</TextRenderer>
            </p>
        ),
        li: ({ children, ...props }: BasicComponentProps) => (
            <li {...props}>
                <TextRenderer>{children}</TextRenderer>
            </li>
        ),
        h1: ({ children, ...props }: BasicComponentProps) => (
            <h1 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h1>
        ),
        h2: ({ children, ...props }: BasicComponentProps) => (
            <h2 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h2>
        ),
        h3: ({ children, ...props }: BasicComponentProps) => (
            <h3 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h3>
        ),
        h4: ({ children, ...props }: BasicComponentProps) => (
            <h4 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h4>
        ),
        h5: ({ children, ...props }: BasicComponentProps) => (
            <h5 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h5>
        ),
        h6: ({ children, ...props }: BasicComponentProps) => (
            <h6 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h6>
        ),
        a: ({ children, ...props }: BasicComponentProps) => (
            <a {...props}>
                <TextRenderer>{children}</TextRenderer>
            </a>
        ),
        em: ({ children, ...props }: BasicComponentProps) => (
            <em {...props}>
                <TextRenderer>{children}</TextRenderer>
            </em>
        ),
        strong: ({ children, ...props }: BasicComponentProps) => (
            <strong {...props}>
                <TextRenderer>{children}</TextRenderer>
            </strong>
        ),
        // Table components
        table: ({ children, ...props }: BasicComponentProps) => {
            return (
                <div className="my-4 w-full">
                    <Table>{children}</Table>
                </div>
            )
        },
        thead: ({ children, ...props }: BasicComponentProps) => {
            return <TableHeader>{children}</TableHeader>
        },
        tbody: ({ children, ...props }: BasicComponentProps) => {
            return <TableBody>{children}</TableBody>
        },
        tr: ({ children, ...props }: BasicComponentProps) => {
            return <TableRow>{children}</TableRow>
        },
        th: ({ children, ...props }: BasicComponentProps) => {
            return <TableHead>{children}</TableHead>
        },
        td: ({ children, ...props }: BasicComponentProps) => {
            return <TableCell>{children}</TableCell>
        },
        // Special elements
        blockquote: ({ children, ...props }: BasicComponentProps) => {
            return (
                <Alert className="my-4">
                    <AlertDescription>
                        <TextRenderer>{children}</TextRenderer>
                    </AlertDescription>
                </Alert>
            )
        },
        // Image rendering
        img: ({ src, alt, ...props }: { src?: string, alt?: string } & BasicComponentProps) => {
            const [error, setError] = useState(false);
            
            if (error) {
                return (
                    <div className="bg-muted/20 my-4 rounded-lg border p-4 text-center">
                        <p className="text-destructive">Failed to load image</p>
                    </div>
                );
            }
            
            if (src && (isDataUri(src) || src.startsWith('data:image/'))) {
                return (
                    <div className="my-4 w-full">
                        <img 
                            src={src} 
                            alt={alt || 'Generated image'} 
                            className="mx-auto h-auto max-w-full overflow-hidden rounded-lg shadow-md"
                            loading="lazy"
                            onError={() => setError(true)}
                            {...props}
                        />
                    </div>
                );
            }
            return <img src={src} alt={alt} onError={() => setError(true)} {...props} />;
        },
        math: ({ value }: { value: string }) => (
            <Card className="my-4 overflow-x-auto p-4">
                <BlockMath math={value} />
            </Card>
        ),
        inlineMath: ({ value }: { value: string }) => <InlineMath math={value} />,
    };

    return (
        <div className="prose prose-sm dark:prose-invert min-w-full [&_ol]:ml-2 [&_pre]:bg-transparent [&_pre]:p-0">
            {/* Special handling for image generation strings */}
            {content === "image_generation" ? (
                <div className="my-6 w-full text-center">
                    <p>Image is being generated...</p>
                </div>
            ) : (
                <>
                    {/* Render markdown content */}
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={markdownComponents}
                    >
                        {parsedContent.isJsonContent ? parsedContent.text : content}
                    </ReactMarkdown>
                    
                    {/* Render single image from JSON response if available */}
                    {parsedContent.imageUrl && (
                        <GeneratedImage 
                            url={parsedContent.imageUrl} 
                            caption={parsedContent.isJsonContent ? "Generated Image" : undefined} 
                        />
                    )}
                    
                    {/* Render extracted image URLs if no JSON image was found */}
                    {!parsedContent.imageUrl && extractImageUrls(content).length > 0 && (
                        <ImageGallery urls={extractImageUrls(content)} />
                    )}
                </>
            )}
            
            <style jsx global>{`
                .prose .highlight {
                    background-color: hsl(var(--primary) / 0.2);
                    color: hsl(var(--primary));
                    font-weight: 500;
                    border-radius: 0.25rem;
                    padding-left: 0.25rem;
                    padding-right: 0.25rem;
                }
            `}</style>
        </div>
    )
}
```

```
  const handleImageGeneration = async (response: {
    text_response: string;
    images: { image: string; mime_type: string }[];
    model_used: string;
  }) => {
    if (!sessionId || chatState.isLoading) return;

    try {
      setChatState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: `Generate an image: ${value.trim()}`,
        timestamp: new Date().toISOString(),
      };

      const sanitizedUserMessage = sanitizeForFirestore(userMessage);
      if (!validateMessage(sanitizedUserMessage)) {
        throw new Error("Invalid user message structure for image generation");
      }

      const chatRef = doc(db, "chats", sessionId);
      console.log("Saving user message for image generation:", { messages: arrayUnion(sanitizedUserMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedUserMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
      }

      const validImages = response.images
        .filter((img) => img && typeof img.image === "string" && typeof img.mime_type === "string")
        .map((img) => ({
          url: img.image,
          mime_type: img.mime_type,
        }));

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.text_response,
        ...(validImages.length > 0 ? { images: validImages } : {}),
        timestamp: new Date().toISOString(),
      };

      const sanitizedMessage = sanitizeForFirestore(assistantMessage);
      if (!validateMessage(sanitizedMessage)) {
        throw new Error("Invalid assistant message structure for image generation");
      }

      console.log("Saving image generation message:", { messages: arrayUnion(sanitizedMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setChatState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error("Error in image generation:", error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to process image generation",
      }));
      toast.error("Failed to process image generation");
    }
  };


interface AIModel {
  value: string;
  label: string;
  hasSearch?: boolean;
  hasThinking?: boolean;
  hasImageGen?: boolean;
}

const ais: AIModel[] = [
  {
    value: "gemini-2.5-pro-exp-03-25",
    label: "Gemini 2.5 Pro (Experimental)",
    hasSearch: true,
    hasThinking: true,
    hasImageGen: false
  },
  {
    value: "gemini-2.0-flash-thinking-exp-01-21",
    label: "Gemini 2.0 Flash Thinking",
    hasSearch: false,
    hasThinking: true,
    hasImageGen: false
  },
  {
    value: "gemini-2.0-flash-exp-image-generation",
    label: "Gemini 2.0 Flash Image Gen",
    hasSearch: false,
    hasThinking: false,
    hasImageGen: true
  },
  {
    value: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    hasSearch: true,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "gemini-2.0-flash-lite",
    label: "Gemini 2.0 Flash Lite",
    hasSearch: false,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "learnlm-1.5-pro-experimental",
    label: "LearnLM 1.5 Pro",
    hasSearch: false,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    hasSearch: true,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
    hasSearch: true,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "gemini-1.5-flash-8b",
    label: "Gemini 1.5 Flash 8B",
    hasSearch: false,
    hasThinking: false,
    hasImageGen: false
  }
];

        {/* AI Model Selector */}
        {/* <Popover open={aiOpen} onOpenChange={setAiOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={aiOpen}
              className="bg-primary-foreground hover:bg-secondary h-8 w-full min-w-[50px] justify-between px-2 text-xs sm:min-w-[150px] md:w-[200px] md:min-w-[180px]"
            >
              <span className="mr-1 flex-1 truncate text-start">
                {selectedAI ? ais.find((ai) => ai.value === selectedAI)?.label : 'Gemini 2.5 Pro (Experimental)'}
              </span>
              <ChevronDown className="shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-[100000] mr-2 w-[var(--radix-popover-trigger-width)] p-0 text-xs">
            <Command className="bg-primary-foreground">
              <CommandInput placeholder="Search ai..." />
              <CommandList className="overflow-hidden">
                <CommandEmpty>No ai found.</CommandEmpty>
                <CommandGroup className="px-0">
                  <ScrollArea className="h-max max-h-[300px] px-1.5">
                    {ais.map((ai) => (
                      <CommandItem
                        className="text-xs"
                        key={ai.value}
                        value={ai.value}
                        onSelect={handleAISelect}
                      >
                        <span className="w-[20px] max-w-full flex-1 truncate">{ai.label}</span>
                        <Check
                          className={cn(
                            'ml-auto',
                            selectedAI === ai.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover> */}
```