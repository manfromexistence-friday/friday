import React, { useLayoutEffect, useRef, useState, useCallback, useEffect } from "react"
import { Message } from "@/types/chat"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MessageListProps {
  chatId: string
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  isThinking?: boolean
}

export function MessageList({
  chatId,
  messages,
  messagesEndRef,
  isThinking
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState<Message[]>(messages)
  const [showThinking, setShowThinking] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight + 1000
      setShowScrollButton(false)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!nearBottom)
    }
  }, [])

  // Handle thinking indicator and message updates
  useEffect(() => {
    if (isThinking) {
      setShowThinking(true)
      setIsFadingOut(false)
      
      // FIXED: Instead of checking for ANY assistant message,
      // check if the last message is from the user (meaning we need to show thinking)
      const lastMessage = messages[messages.length - 1];
      const needsThinkingIndicator = lastMessage && lastMessage.role === "user";
      
      if (needsThinkingIndicator) {
        // Add the thinking indicator after the user's message
        setVisibleMessages([
          ...messages,
          {
            id: "thinking-placeholder",
            content: "thinking",
            role: "assistant",
            timestamp: Date.now().toString(),
          }
        ]);
      } else {
        // Just update with current messages
        setVisibleMessages([...messages]);
      }
    } else if (showThinking) {
      setIsFadingOut(true) // Start fading out the thinking indicator
    } else {
      setVisibleMessages([...messages]) // Update with latest messages
    }
  }, [isThinking, messages, showThinking])

  // Handle transition end to update messages after fade-out
  const handleTransitionEnd = useCallback(() => {
    if (isFadingOut) {
      setShowThinking(false)
      setIsFadingOut(false)
      setVisibleMessages([...messages]) // Show AI response after fade-out
    }
  }, [isFadingOut, messages])

  // Auto-scroll to bottom when messages or thinking state change
  useLayoutEffect(() => {
    scrollToBottom()
  }, [visibleMessages, showThinking, scrollToBottom])

  // Watch for container scrolling
  useEffect(() => {
    const ref = containerRef.current
    if (!ref) return
    ref.addEventListener("scroll", handleScroll)
    return () => ref.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Scroll on resize
  useEffect(() => {
    const handleResize = () => setTimeout(scrollToBottom, 100)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [scrollToBottom])

  return (
    <div
      ref={containerRef}
      className="relative h-full flex-1 overflow-y-auto px-1 pb-32 pt-16 md:pb-14"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="w-full space-y-3 md:px-4 lg:mx-auto lg:w-[90%] lg:px-0 xl:w-1/2">
        {visibleMessages.map((message, index) => (
          <ChatMessage
            key={`${message.id || index}-${message.timestamp}`}
            message={message}
            chatId={chatId}
            index={index}
            isFadingOut={isFadingOut && message.content === "thinking"}
            onTransitionEnd={message.content === "thinking" ? handleTransitionEnd : undefined}
          />
        ))}

        <div ref={messagesEndRef} className="h-20 w-full" />
      </div>

      <Button
        onClick={scrollToBottom}
        className={cn(
          "fixed bottom-48 right-4 z-[1001] size-12 rounded-full p-0 shadow-lg transition-all duration-300 md:bottom-36 md:right-[3%] lg:bottom-[135px] lg:right-[2.5%] xl:bottom-36 xl:right-[24.5%]",
          showScrollButton ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
        )}
        size="icon"
        variant="outline"
      >
        <ChevronDown className="size-6" />
      </Button>
    </div>
  )
}