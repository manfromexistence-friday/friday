import { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { User as FirebaseUser } from 'firebase/auth'
import AiMessage from "@/components/chat/ai-message-actions"
import UserMessage from "@/components/chat/user-message-actions"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MarkdownPreview } from './markdown-preview'

interface ChatMessageProps {
  message: Message
  chatId: string | null
  index: number
}

export function ChatMessage({ message, chatId, index }: ChatMessageProps) {
  const { user } = useAuth()
  const isAssistant = message.role === "assistant"

  // Firebase user photoURL, displayName and email are used directly
  const userImage = (user as FirebaseUser)?.photoURL
  const userName = (user as FirebaseUser)?.displayName
  const userEmail = (user as FirebaseUser)?.email

  // Get the first character for the fallback
  const fallbackInitial = userName?.[0] || userEmail?.[0]?.toUpperCase() || "U"

  return (
    <div className={cn(
      "flex w-full gap-0",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      {isAssistant ? (
        <div className="flex w-full items-start gap-2">
          <Popover>
            <PopoverTrigger>
              <div className="flex min-h-10 min-w-10 items-center justify-center rounded-full border">
                <Sparkles className="size-4" />
              </div>
            </PopoverTrigger>
            <PopoverContent align="start" className="size-min w-min border-none p-0 shadow-none">
              <AiMessage
                content={message.content}
                reactions={message.reactions}
              />
            </PopoverContent>
          </Popover>
          <div className="hover:text-primary relative flex min-h-10 w-full items-center rounded-xl rounded-tl-none p-2 font-mono text-sm">
            <MarkdownPreview content={message.content} />
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-end gap-2">
          <div className="hover:bg-primary-foreground relativeborder flex min-h-10 items-center justify-center rounded-xl rounded-tr-none border p-2 font-mono text-sm">
            <MarkdownPreview content={message.content} />
          </div>
          <Popover>
            <PopoverTrigger>
              <Avatar className="size-10">
                <AvatarImage src={userImage ?? undefined} alt={userName || userEmail || 'User'} />
                <AvatarFallback>{fallbackInitial}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent align="end" className="size-min w-min border-none p-0 shadow-none">
              <UserMessage
                content={message.content}
                reactions={message.reactions}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}