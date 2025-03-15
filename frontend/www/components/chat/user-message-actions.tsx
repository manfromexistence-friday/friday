import { Copy, Volume2, Edit } from 'lucide-react'
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
        className="rounded-full p-1.5 hover:bg-muted transition-colors"
      >
        <Edit className="h-3.5 w-3.5" />
      </button>

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
      {/* <TooltipProvider>
        <Tooltip>

          <TooltipTrigger asChild>
            <button
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit</p>
          </TooltipContent>
        </Tooltip>

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
        <SidebarProvider>
          <MoreActions />
        </SidebarProvider>
      </TooltipProvider> */}
    </motion.div>
  )
}
