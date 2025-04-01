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
  Loader
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

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarMenu>
          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-start px-2">
              <Loader className="mr-2 size-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-muted-foreground flex items-center justify-start px-2">
              <span className="text-sm">No chats yet</span>
            </div>
          ) : (
            chats.map((chat) => {
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
            })
          )}
        </SidebarMenu>
      </SidebarGroup>

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
