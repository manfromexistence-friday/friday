import { Message } from "@/types/chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/chat/chat-message"
import { Sparkles } from "lucide-react"

interface MessageListProps {
    messages: Message[]
    chatId: string | null
    isLoading: boolean
    error: string | null
    messagesEndRef: React.RefObject<HTMLDivElement>
}

export function MessageList({
    messages,
    chatId,
    isLoading,
    error,
    messagesEndRef
}: MessageListProps) {
    return (
        <ScrollArea className="z-10 mb-[110px] flex-1">
            <div className="mx-auto w-1/2 space-y-2.5 pb-2 pt-2">
                {messages.map((message, index) => (
                    <ChatMessage
                        key={index}
                        message={message}
                        chatId={chatId}
                        index={index}
                    />
                ))}
                {isLoading && (
                    <div className="flex gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="border rounded-lg p-2 text-sm">Thinking...</div>
                    </div>
                )}
                {error && (
                    <div className="text-destructive p-2 text-center">
                        {error}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    )
}