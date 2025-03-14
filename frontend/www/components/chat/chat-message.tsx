import { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
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
      "flex gap-0 w-full",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      {isAssistant ? (
        <div className="flex items-start gap-2">
          <Popover>
            <PopoverTrigger>
              <div className="flex min-h-10 min-w-10 items-center justify-center rounded-full border">
                <Sparkles className="h-4 w-4" />
              </div>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-min h-min p-0 border-none shadow-none">
              <AiMessage
                content={message.content}
                reactions={message.reactions}
              />
            </PopoverContent>
          </Popover>
          <HoverCard>
            <HoverCardTrigger>
              <div className="relative text-sm font-mono rounded-md border p-2 hover:bg-primary-foreground hover:text-primary">
                {message.content}
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <AiMessage
                content={message.content}
                reactions={message.reactions}
              />
            </HoverCardContent>
          </HoverCard>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <HoverCard>
            <HoverCardTrigger className="relative text-sm font-mono rounded-md border p-2 hover:bg-primary-foreground hover:text-primary">
              {message.content}
            </HoverCardTrigger>
            <HoverCardContent align="end">
              <UserMessage
                className="right-0"
                content={message.content}
                reactions={message.reactions}
              />
            </HoverCardContent>
          </HoverCard>
          <Popover>
            <PopoverTrigger>
              <Avatar className="h-10 w-10">
                <AvatarImage src={userImage ?? undefined} alt={userName || userEmail || 'User'} />
                <AvatarFallback>{fallbackInitial}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-min h-min p-0 border-none shadow-none">
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