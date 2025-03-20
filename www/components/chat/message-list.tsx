import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Message } from "@/types/chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/chat/chat-message"
import { Sparkles, Loader2 } from "lucide-react"
import { doc, getDoc } from 'firebase/firestore'
import { db } from "@/lib/firebase/config"
import AnimatedGradientText from "@/components/ui/animated-gradient-text"

interface MessageListProps {
    chatId: string
    messagesEndRef: React.RefObject<HTMLDivElement>
    isThinking?: boolean
}

export function MessageList({ chatId, messagesEndRef, isThinking }: MessageListProps) {
    const { data: messages = [], isLoading, error } = useQuery({
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
        refetchOnMount: true,
        refetchOnWindowFocus: false
    })

    // Ensure messages is always an array
    const messagesList = Array.isArray(messages) ? messages : []

    // Improved scroll effect with extra padding
    React.useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                // Get the parent scroll container
                const scrollContainer = messagesEndRef.current.parentElement
                if (scrollContainer) {
                    // Add extra padding to ensure message is fully visible
                    scrollContainer.scrollTop = scrollContainer.scrollHeight + 20
                }
                
                messagesEndRef.current.scrollIntoView({ 
                    behavior: "smooth",
                    block: "end"
                })
            }
        }
        
        // Immediate scroll for user messages, delayed for AI responses
        const timeoutId = setTimeout(scrollToBottom, isThinking ? 200 : 0)
        return () => clearTimeout(timeoutId)
    }, [messagesList.length, isThinking, messagesEndRef])

    // Remove the delayed thinking state pb-[110px] 
    const [showThinking, setShowThinking] = React.useState(false)

    React.useEffect(() => {
        setShowThinking(isThinking ?? false)
    }, [isThinking])

    return (
        <ScrollArea className="z-10 max-h-full flex-1">
            <div className="w-full space-y-2.5 px-2 pt-3.5 lg:mx-auto lg:w-[90%] lg:px-0 xl:w-1/2">
                {messagesList.map((message, index) => (
                    <ChatMessage
                        key={`${message.id || index}-${message.timestamp}`}
                        message={message}
                        chatId={chatId}
                        index={index}
                    />
                ))}
                {isThinking && (
                    <div className="mt-2 flex w-full justify-start">
                        <div className="flex items-start gap-2">
                            <div className="flex min-h-10 min-w-10 items-center justify-center rounded-full border">
                                <Sparkles className="size-4" />
                            </div>
                            <div className="hover:bg-primary-foreground text-muted-foreground relative rounded-xl rounded-tl-none border p-2 font-mono text-sm">
                                <AnimatedGradientText text="AI is thinking..." />
                            </div>
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className="flex size-full items-center justify-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-full border">
                            <Loader2 className="size-4 animate-spin" />
                        </div>
                        <div className="rounded-lg border p-2 text-sm">Loading messages...</div>
                    </div>
                )}
                {error && (
                    <div className="text-destructive p-2 text-center">
                        Failed to load messages. Please try again.
                    </div>
                )}
                <div ref={messagesEndRef} className="h-2" />
            </div>
            <div className="h-64 w-full md:h-[115px]"></div>
        </ScrollArea>
    )
}