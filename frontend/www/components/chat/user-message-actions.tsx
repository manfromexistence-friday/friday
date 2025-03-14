import { Copy, Download, ThumbsDown, ThumbsUp, Share2, Volume2, RotateCcw, EllipsisVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  Bell,
  CornerUpLeft,
  CornerUpRight,
  FileText,
  GalleryVerticalEnd,
  LineChart,
  Link,
  MoreHorizontal,
  Settings2,
  Star,
  Trash,
  Trash2,
  CheckCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar/actions-sidebar"
import { SidebarProvider } from "@/components/sidebar/actions-sidebar"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface MessageActionsProps {
  content: string
  onLike?: () => void
  onDislike?: () => void
  reactions?: {
    likes: number
    dislikes: number
  }
  className?: string  // Add className prop
}

const data = [
  [
    {
      label: "Save to Favorites",
      icon: Star,
    },
    {
      label: "Share Response",
      icon: Share2,
    }
  ],
  [
    {
      label: "Download as PDF",
      icon: FileText,
    },
    {
      label: "Download as Text",
      icon: Download,
    }
  ],
  [
    {
      label: "View Analytics",
      icon: LineChart,
    },
    {
      label: "Report Issue",
      icon: Bell,
    }
  ],
  [
    {
      label: "Delete Response",
      icon: Trash2,
    }
  ]
]

function MoreActions() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="flex items-center text-sm">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="rounded-full p-1.5 hover:bg-muted transition-colors"
                >
                  <EllipsisVertical className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton>
                            <item.icon /> <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default function UserMessage({
  content,
  onLike,
  onDislike,
  reactions,
  className
}: MessageActionsProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast(
        <div className="flex items-center gap-2">
          <CheckCheck className='h-[20px] w-[20px]' />
          <span className='text-sm'>Copied to clipboard!</span>
        </div>,
      )

      // You might want to add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `friday-response-${new Date().toISOString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "absolute flex items-center gap-0.5 rounded-2xl bg-background/95 p-1.5 shadow-lg backdrop-blur-sm border max-h-10",
        className
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Listen</p>
          </TooltipContent>
        </Tooltip>

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Regenerate</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onLike}
              className={cn(
                "rounded-full p-1.5 hover:bg-muted transition-colors flex items-center gap-1",
                reactions?.likes && "text-primary"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {reactions?.likes && reactions.likes > 0 && (
                <span className="text-xs tabular-nums">{reactions.likes}</span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Like</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDislike}
              className={cn(
                "rounded-full p-1.5 hover:bg-muted transition-colors flex items-center gap-1",
                reactions?.dislikes && "text-destructive"
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              {reactions?.dislikes && reactions.dislikes > 0 && (
                <span className="text-xs tabular-nums">{reactions.dislikes}</span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dislike</p>
          </TooltipContent>
        </Tooltip> */}

        <SidebarProvider>
          <MoreActions />
        </SidebarProvider>
      </TooltipProvider>
    </motion.div>
  )
}
