import { Copy, ThumbsDown, ThumbsUp, Volume2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as React from "react"
import { CheckCheck } from "lucide-react"
import { SidebarProvider } from "@/components/sidebar/actions-sidebar"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MoreActions } from "@/components/chat/chat-more-options"

interface AiMessageProps {
  content: string
  onLike?: () => void
  onDislike?: () => void
  reactions?: {
    likes: number
    dislikes: number
  }
  className?: string
}

export default function AiMessage({
  content,
  onLike,
  onDislike,
  reactions,
  className
}: AiMessageProps) {
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
        "flex items-center gap-0.5 rounded-lg bg-background/95 p-1.5 shadow-lg backdrop-blur-sm border max-h-10",
        className
      )}
    >

      <button
        onClick={handleCopy}
        className="rounded-full p-1.5 hover:bg-muted transition-colors"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>

      <button
        className="rounded-full p-1.5 hover:bg-muted transition-colors"
      >
        <Volume2 className="h-3.5 w-3.5" />
      </button>

      <button
        className="rounded-full p-1.5 hover:bg-muted transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>

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

      <SidebarProvider>
        <MoreActions />
      </SidebarProvider>
      
    </motion.div>
  )
}
