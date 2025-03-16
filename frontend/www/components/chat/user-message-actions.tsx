import { Copy, Volume2, Edit, Download } from 'lucide-react'
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

interface UserMessageProps {
  content: string
  onLike?: () => void
  onDislike?: () => void
  reactions?: {
    likes: number
    dislikes: number
  }
  className?: string
}

export default function UserMessage({
  content,
  onLike,
  onDislike,
  reactions,
  className
}: UserMessageProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("Copied to clipboard")

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
        "bg-background/95 flex max-h-10 items-center gap-0.5 rounded-lg border p-1.5 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <button
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <Edit className="size-3.5" />
      </button>

      <button
        onClick={handleCopy}
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <Copy className="size-3.5" />
      </button>

      <button
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <Volume2 className="size-3.5" />
      </button>

      <button
        onClick={handleDownload}
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <Download className="size-3.5" />
      </button>
    </motion.div>
  )
}
