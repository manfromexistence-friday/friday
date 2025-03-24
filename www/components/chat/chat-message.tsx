import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { User as FirebaseUser } from 'firebase/auth'
import AiMessage from '@/components/chat/ai-message-actions'
import UserMessage from '@/components/chat/user-message-actions'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MarkdownPreview } from './markdown-preview'
import AnimatedGradientText from '@/components/ui/animated-gradient-text'

interface ChatMessageProps {
  message: Message
  chatId: string | null
  index: number
  className?: string
  isFadingOut?: boolean
  onTransitionEnd?: () => void
}

export function ChatMessage({ 
  message, 
  chatId, 
  index, 
  className, 
  isFadingOut, 
  onTransitionEnd 
}: ChatMessageProps) {
  const { user } = useAuth()
  const isAssistant = message.role === 'assistant'

  const userImage = (user as FirebaseUser)?.photoURL
  const userName = (user as FirebaseUser)?.displayName
  const userEmail = (user as FirebaseUser)?.email
  const fallbackInitial = userName?.[0] || userEmail?.[0]?.toUpperCase() || 'U'

  return (
    <div className={cn('flex w-full gap-0', isAssistant ? 'justify-start' : 'justify-end', className)}>
      {!isAssistant && (
        <div className="flex w-full items-center justify-end gap-2">
          <div className="hover:bg-primary-foreground hover:text-primary relative flex min-h-10 items-center justify-center rounded-xl rounded-tr-none border p-2 font-mono text-sm">
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
              <UserMessage content={message.content} reactions={message.reactions} />
            </PopoverContent>
          </Popover>
        </div>
      )}
      {isAssistant && (
        <div className="flex w-full items-start gap-2">
          <Popover>
            <PopoverTrigger>
              <div className="flex min-h-10 min-w-10 items-center justify-center rounded-full border">
                <Sparkles className="size-4" />
              </div>
            </PopoverTrigger>
            <PopoverContent align="start" className="size-min w-min border-none p-0 shadow-none">
              <AiMessage content={message.content} reactions={message.reactions} />
            </PopoverContent>
          </Popover>
          <div
            className={cn(
              "hover:text-primary relative flex min-h-10 w-full items-center p-2 font-mono text-sm",
              { "fade-out": isFadingOut }
            )}
            onTransitionEnd={onTransitionEnd}
          >
            {message.content === 'thinking' ? (
              <div className="thinking-content">
                <AnimatedGradientText text="AI is thinking..." />
              </div>
            ) : (
              <MarkdownPreview content={message.content} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}