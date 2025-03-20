"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { aiService } from '@/lib/services/ai-service'
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea'
import { ChatInput } from '@/components/chat/chat-input'
import { useQueryClient } from "@tanstack/react-query"
import type { Message } from "@/types/chat"
import { cn } from "@/lib/utils"

// First, update the ChatState interface if not already defined
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

// Alternative approach using ref
export default function AiInput() {
  const queryClient = useQueryClient()
  const { categorySidebarState } = useCategorySidebar()
  const { subCategorySidebarState } = useSubCategorySidebar()

  const [value, setValue] = useState("")
  const [isMaxHeight, setIsMaxHeight] = useState(false)

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })

  // Add new state to track input height
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT)

  // Update handleAdjustHeight to track current input height
  const handleAdjustHeight = useCallback((reset = false) => {
    if (!textareaRef.current) return
    
    if (reset) {
      textareaRef.current.style.height = `${MIN_HEIGHT}px`
      return
    }
    
    const scrollHeight = textareaRef.current.scrollHeight
    textareaRef.current.style.height = `${Math.min(scrollHeight, MAX_HEIGHT)}px`
  }, [textareaRef]) // Add textareaRef to dependencies

  const [showSearch, setShowSearch] = useState(false)
  const [showResearch, setShowReSearch] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add chat state management
  const [chatState, setChatState] = useState<ChatState>({
    messages: [], // Ensure this is always an array
    isLoading: false,
    error: null,
  })
  const [chatHistory, setChatHistory] = useState<Message[]>([])

  const initializeRef = useRef(false)

  // const updateFirestoreMessages = async (message: Message) => {
  //   try {
  //     const chatRef = doc(db, "chats", sessionId)
  //     await updateDoc(chatRef, {
  //       messages: arrayUnion(message),
  //       updatedAt: new Date().toISOString()
  //     })
  //     // Invalidate the messages query to trigger a refetch
  //     queryClient.invalidateQueries({ queryKey: ['messages', sessionId] })
  //   } catch (error) {
  //     console.error("Error updating Firestore:", error)
  //     throw error
  //   }
  // }

  const handleSubmit = async () => {
    if (!value.trim() || chatState.isLoading) return;

    try {
      // 1. Create user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: value.trim(),
        timestamp: new Date().toISOString(),
      }

      // 2. Clear input immediately
      setValue("")
      handleAdjustHeight(true)

      // 3. Update Firestore with user message first
      // await updateFirestoreMessages(userMessage)

      // 4. Set loading state after user message is saved
      setChatState(prev => ({
        ...prev,
        isLoading: true,
      }))

      // 5. Get AI response
      const aiResponse = await aiService.generateResponse(userMessage.content)

      // 6. Create and save AI message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponse.trim(),
        timestamp: new Date().toISOString(),
      }

      // 7. Update Firestore with AI response
      // await updateFirestoreMessages(assistantMessage)

      // 8. Update loading state
      setChatState(prev => ({
        ...prev,
        isLoading: false,
      }))

    } catch (error) {
      console.error("Error:", error)
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to get AI response"
      }))
    }
  }

  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      // Cleanup any pending operations
      if (chatState.isLoading) {
        setChatState(prev => ({ ...prev, isLoading: false }))
      }
    }
  }, []) // Empty dependency array since we're using a ref

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const messagesEndRef = useRef<HTMLDivElement>(null!)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatState.messages, chatState.isLoading])

  return (
    <div className={cn(
      "relative flex flex-col transition-[left,right,width,margin-right] duration-200 ease-linear w-full items-center justify-center",

    )}>
      <ChatInput
      value={value}
      chatState={chatState}
      setChatState={setChatState}
      showSearch={showSearch}
      showResearch={showResearch}
      imagePreview={imagePreview}
      inputHeight={inputHeight}
      textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
      onSubmit={handleSubmit}
      onChange={setValue}
      onHeightChange={handleAdjustHeight}
      onImageChange={(file) =>
        file ? setImagePreview(URL.createObjectURL(file)) : setImagePreview(null)
      }
      onSearchToggle={() => setShowSearch(!showSearch)}
      onResearchToggle={() => setShowReSearch(!showResearch)}
      />
    </div>
  )
}
