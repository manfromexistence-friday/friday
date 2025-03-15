import { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { User as FirebaseUser } from 'firebase/auth'

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
          <div className="flex min-h-10 min-w-10 items-center justify-center rounded-full border">
            <Sparkles className="h-4 w-4" />
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="relative max-w-2xl text-sm font-mono rounded-md border p-2 hover:bg-primary-foreground hover:text-primary">
                {message.content}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="flex gap-2">
              <button className="hover:text-primary">👍</button>
              <button className="hover:text-primary">👎</button>
              <button 
                className="hover:text-primary"
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                📋
              </button>
            </HoverCardContent>
          </HoverCard>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div className="relative max-w-2xl text-sm font-mono rounded-md border p-2 hover:bg-primary-foreground hover:text-primary">
            {message.content}
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={userImage ?? undefined} alt={userName || userEmail || 'User'} />
            <AvatarFallback>{fallbackInitial}</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  )
}