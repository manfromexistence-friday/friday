"use client"

import { useEffect, useRef, useState } from "react"
import type { ChatState, Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { chatService } from '@/lib/services/chat-service'
import { aiService } from '@/lib/services/ai-service'
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { useMemo } from "react"

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

export default function AiInput() {
  const { categorySidebarState } = useCategorySidebar()
  const { subCategorySidebarState } = useSubCategorySidebar()

  const [value, setValue] = useState("")
  const [isMaxHeight, setIsMaxHeight] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })

  // Add new state to track input height
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT)

  // Update handleAdjustHeight to track current input height
  const handleAdjustHeight = useCallback(
    (reset?: boolean) => {
      adjustHeight(reset)
      const textarea = textareaRef.current
      if (textarea) {
        setIsMaxHeight(textarea.scrollHeight >= MAX_HEIGHT)
        setInputHeight(textarea.offsetHeight) // Track current height
      }
    },
    [adjustHeight]
  )

  const [showSearch, setShowSearch] = useState(false)
  const [showResearch, setShowReSearch] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add chat state management
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  })
  const [chatHistory, setChatHistory] = useState<Message[]>([])

  const initializeRef = useRef(false)

  const initializeChat = async () => {
    if (initializeRef.current || chatId) return

    try {
      initializeRef.current = true

      const newChatId = await chatService.createChat()
      console.log('Chat initialized with ID:', newChatId)
      setChatId(newChatId)

      const history = await chatService.getChatHistory(newChatId)
      setChatHistory(history)
      setChatState(prev => ({
        ...prev,
        messages: history
      }))
    } catch (error) {
      console.error('Error initializing:', error)
      initializeRef.current = false
    }
  }

  useEffect(() => {
    initializeChat()
    return () => {
      initializeRef.current = false
    }
  }, [])

  const handelClose = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input
    }
    setImagePreview(null) // Use null instead of empty string
  }

  const handelChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file: File | null = e.target.files ? e.target.files[0] : null
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Updated handleSubmit with proper error handling and state updates
  const handleSubmit = async () => {
    if (!value.trim() || !chatId || chatState.isLoading) return

    try {
      const userMessage: Message = {
        role: "user",
        content: value.trim(),
      }

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }))

      setValue("")
      handleAdjustHeight(true)

      await chatService.addMessage(chatId, userMessage)

      // Use the new AI service
      const aiResponse = await aiService.generateResponse(userMessage.content)

      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse.trim(),
      }

      await chatService.addMessage(chatId, assistantMessage)

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
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
      messages={chatState.messages}
      chatId={chatId}
      isLoading={chatState.isLoading}
      error={chatState.error}
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
function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T {
  return useMemo(() => callback, deps)
}

