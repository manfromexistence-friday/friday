"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { chatService } from '@/lib/services/chat-service'
import { aiService } from '@/lib/services/ai-service'
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { useMemo } from "react"
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useQueryClient } from "@tanstack/react-query"

// First, update the ChatState interface if not already defined
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

// First, add the prop interface
interface AiInputProps {
  sessionId: string;
}

export default function AiInput({ sessionId }: AiInputProps) {
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

  const updateFirestoreMessages = async (message: Message) => {
    try {
      const chatRef = doc(db, "chats", sessionId)
      await updateDoc(chatRef, {
        messages: arrayUnion(message),
        updatedAt: new Date().toISOString()
      })
      // Invalidate the messages query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['messages', sessionId] })
    } catch (error) {
      console.error("Error updating Firestore:", error)
      throw error
    }
  }

  const handleSubmit = async () => {
    if (!value.trim() || chatState.isLoading) return

    try {
      const userMessage: Message = {
        role: "user",
        content: value.trim(),
      }

      // Update local state
      setChatState(prev => ({
        ...prev,
        messages: Array.isArray(prev.messages) ? [...prev.messages, userMessage] : [userMessage],
        isLoading: true,
        error: null,
      }))

      setValue("")
      handleAdjustHeight(true)

      // Update Firestore with user message
      await updateFirestoreMessages(userMessage)

      // Get AI response with sessionId
      const aiResponse = await aiService.generateResponse(userMessage.content)

      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse.trim(),
      }

      // Update Firestore with assistant message
      await updateFirestoreMessages(assistantMessage)

      // Update local state with assistant message
      setChatState(prev => ({
        ...prev,
        messages: Array.isArray(prev.messages) ? [...prev.messages, assistantMessage] : [assistantMessage],
        isLoading: false,
      }))

    } catch (error) {
      console.error("Error in chat interaction:", error)
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: "Sorry, I couldn't respond right now. Please try again."
      }))
    }
  }

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
      "relative flex h-full flex-col transition-[left,right,width,margin-right] duration-200 ease-linear",
      subCategorySidebarState === "expanded"
      ? "mr-64"
      : categorySidebarState === "expanded"
        ? "mr-64"
        : ""
    )}>
      <MessageList
      chatId={sessionId}
      messagesEndRef={messagesEndRef}
      />
      <ChatInput
      value={value}
      chatState={chatState}
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

