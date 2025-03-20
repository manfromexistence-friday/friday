"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea'
import { ChatInput } from '@/components/chat/chat-input'
import { useQueryClient } from "@tanstack/react-query"
import type { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

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
  const router = useRouter()
  const [selectedAI, setSelectedAI] = useState("gemini-2.0-flash")

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

  const handleSubmit = async () => {
    if (!value.trim() || chatState.isLoading) return;

    try {
      const chatId = uuidv4()
      const trimmedValue = value.trim()
      
      // Create initial message
      const initialMessage = {
        id: uuidv4(),
        content: trimmedValue,
        role: 'user',
        createdAt: new Date().toISOString()
      }

      // Create initial chat data
      const chatData = {
        id: chatId,
        title: trimmedValue.slice(0, 50) + (trimmedValue.length > 50 ? '...' : ''),
        messages: [initialMessage],
        model: selectedAI,
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Store chat data in Firestore
      await setDoc(doc(db, "chats", chatId), chatData)

      // Store the input value and selected AI model in sessionStorage
      sessionStorage.setItem('initialPrompt', trimmedValue)
      sessionStorage.setItem('selectedAI', selectedAI)
      sessionStorage.setItem('chatId', chatId)
      sessionStorage.setItem('autoSubmit', 'true')

      // Navigate to the new chat page
      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error("Error:", error)
      setChatState(prev => ({
        ...prev,
        error: "Failed to create chat"
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
  }, [chatState.isLoading]) // Empty dependency array since we're using a ref

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
      "relative flex w-full flex-col items-center justify-center transition-[left,right,width,margin-right] duration-200 ease-linear",
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
      selectedAI={selectedAI}
      onAIChange={setSelectedAI}
      />
    </div>
  )
}
