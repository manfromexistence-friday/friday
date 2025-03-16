import { useQuery } from "@tanstack/react-query"
import { Message } from "@/types/chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/chat/chat-message"
import { Sparkles, Loader2 } from "lucide-react"
import { doc, getDoc } from 'firebase/firestore'
import { db } from "@/lib/firebase/config"

interface MessageListProps {
    chatId: string | null
    messagesEndRef: React.RefObject<HTMLDivElement>
}

export function MessageList({ chatId, messagesEndRef }: MessageListProps) {
    // Use React Query to fetch and cache messages
    const { 
        data: messages = [], 
        isLoading, 
        error 
    } = useQuery({
        queryKey: ['messages', chatId],
        queryFn: async () => {
            if (!chatId) return []
            
            const chatRef = doc(db, "chats", chatId)
            const chatDoc = await getDoc(chatRef)
            
            if (chatDoc.exists()) {
                const data = chatDoc.data()
                return Array.isArray(data.messages) ? data.messages : []
            }
            return []
        },
        enabled: !!chatId,
        staleTime: 1000 * 30, // Consider data fresh for 30 seconds
    })

    // Ensure messages is always an array
    const messagesList = Array.isArray(messages) ? messages : []

    return (
        <ScrollArea className="z-10 mb-[110px] flex-1">
            <div className="mx-auto w-1/2 space-y-2.5 pb-2 pt-2">
                {messagesList.map((message, index) => (
                    <ChatMessage
                        key={`${chatId}-${index}`}
                        message={message}
                        chatId={chatId}
                        index={index}
                    />
                ))}
                {isLoading && (
                    <div className="flex gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                        <div className="border rounded-lg p-2 text-sm">Loading messages...</div>
                    </div>
                )}
                {error && (
                    <div className="text-destructive p-2 text-center">
                        Failed to load messages. Please try again.
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    )
}