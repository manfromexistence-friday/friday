import React, { useLayoutEffect, useRef, useState, useCallback, useEffect } from "react";
import { Message } from "@/types/chat";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MessageListProps {
  chatId: string | null;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isThinking?: boolean;
  selectedAI?: string;
}

export function MessageList({
  chatId,
  messages,
  messagesEndRef,
  isThinking,
  selectedAI = "",
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>(messages);
  const [showThinking, setShowThinking] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const previousScrollHeight = useRef<number>(0); // Track the previous scroll height

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight + 1000;
      setShowScrollButton(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!nearBottom);
    }
  }, []);

  useEffect(() => {
    if (isThinking) {
      setShowThinking(true);
      setIsFadingOut(false);
      const lastMessage = messages[messages.length - 1];
      const needsThinkingIndicator = lastMessage && lastMessage.role === "user";
      if (needsThinkingIndicator) {
        setVisibleMessages([
          ...messages,
          {
            id: "thinking-placeholder",
            content: "thinking",
            role: "assistant",
            timestamp: Date.now().toString(),
          },
        ]);
      } else {
        setVisibleMessages([...messages]);
      }
    } else if (showThinking) {
      setIsFadingOut(true);
    } else {
      setVisibleMessages([...messages]);
    }
  }, [isThinking, messages, showThinking]);

  const handleTransitionEnd = useCallback(() => {
    if (isFadingOut) {
      setShowThinking(false);
      setIsFadingOut(false);
      setVisibleMessages([...messages]);
    }
  }, [isFadingOut, messages]);

  // Scroll to bottom when visibleMessages or showThinking changes
  useLayoutEffect(() => {
    scrollToBottom();
  }, [visibleMessages, showThinking, scrollToBottom]);

  // Use ResizeObserver to monitor changes in the container's scrollHeight
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (container) {
        const currentScrollHeight = container.scrollHeight;
        // Only scroll if the scrollHeight has increased
        if (currentScrollHeight > previousScrollHeight.current) {
          console.log(
            `Scroll height increased from ${previousScrollHeight.current} to ${currentScrollHeight}, scrolling to bottom`
          );
          scrollToBottom();
        }
        previousScrollHeight.current = currentScrollHeight;
      }
    });

    observer.observe(container);

    // Initialize the previous scroll height
    previousScrollHeight.current = container.scrollHeight;

    return () => {
      observer.disconnect();
    };
  }, [scrollToBottom]);

  useEffect(() => {
    const ref = containerRef.current;
    if (!ref) return;
    ref.addEventListener("scroll", handleScroll);
    return () => ref.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleResize = () => setTimeout(scrollToBottom, 100);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [scrollToBottom]);

  return (
    <div
      ref={containerRef}
      className="relative h-full flex-1 overflow-y-auto px-1 pb-32 pt-16 md:pb-14"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="w-full space-y-4 md:px-4 lg:mx-auto lg:w-[90%] lg:px-0 xl:w-1/2">
        {visibleMessages.map((message, index) => (
          <ChatMessage
            key={`${message.id || index}-${message.timestamp}`}
            message={message}
            chatId={chatId}
            index={index}
            isFadingOut={isFadingOut && message.content === "thinking"}
            onTransitionEnd={message.content === "thinking" ? handleTransitionEnd : undefined}
            selectedAI={selectedAI}
          />
        ))}
        <div ref={messagesEndRef} className="h-20 w-full" />
      </div>

      <Button
        onClick={scrollToBottom}
        className={cn(
          "fixed bottom-48 left-1/2 -translate-x-1/2 z-[1000] size-12 rounded-full p-0 shadow-lg transition-all duration-300 md:bottom-32 lg:bottom-[135px] xl:bottom-36",
          showScrollButton ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
        )}
        size="icon"
        variant="outline"
      >
        <ChevronDown className="size-7" />
      </Button>
    </div>
  );
}