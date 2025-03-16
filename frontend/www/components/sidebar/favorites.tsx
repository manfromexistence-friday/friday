"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase/config"
import { useRouter } from 'next/navigation'
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
import { collection, query, getDocs, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore"

interface Chat {
  id: string
  name: string
  title: string
  url: string
  emoji: string
  lastMessage?: string
  timestamp?: number
}

export function NavFavorites() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { isMobile } = useSidebar()
  
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<{id: string, title: string} | null>(null)
  const [newTitle, setNewTitle] = useState("")

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const q = query(collection(db, "chats"))
      const snapshot = await getDocs(q)
      const chatData: Chat[] = []
      
      snapshot.forEach((doc) => {
        chatData.push({
          id: doc.id,
          ...doc.data() as Omit<Chat, 'id'>
        })
      })
      
      return chatData
    },
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
  })

  useEffect(() => {
    const q = query(collection(db, "chats"))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      queryClient.setQueryData(['chats'], (oldData: Chat[] = []) => {
        const newData = [...oldData]
        snapshot.docChanges().forEach((change) => {
          const chatData = { id: change.doc.id, ...change.doc.data() as Omit<Chat, 'id'> }
          
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
        return newData
      })
    })

    return () => unsubscribe()
  }, [queryClient])

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

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarMenu>
          {isLoading ? (
            <div className="flex items-center justify-start p-4 text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <span className="text-sm">No chats yet</span>
            </div>
          ) : (
            chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton asChild>
                  <a href={`/chat/${chat.id}`} title={chat.title}>
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
            ))
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
              Are you sure you want to delete "{selectedChat?.title}"? This action cannot be undone.
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
