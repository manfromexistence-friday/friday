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
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
// Add these Firebase imports
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

// First, update the ChatState interface if not already defined
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

export default function AiInput() {
  const queryClient = useQueryClient()
  const { categorySidebarState } = useCategorySidebar()
  const { subCategorySidebarState } = useSubCategorySidebar()
  const router = useRouter()
  const [selectedAI, setSelectedAI] = useState("gemini-2.0-flash")
  const { user } = useAuth()

  const [value, setValue] = useState("")
  const [isMaxHeight, setIsMaxHeight] = useState(false)
  // Add login state
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Add login handler - similar to site-header.tsx
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast.success("Successfully logged in")
      
      // If we had stored a pending message, we could retrieve it here
      // const pendingMessage = sessionStorage.getItem('pendingMessage')
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error('Failed to log in. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

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
  }, [textareaRef])

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

    // Check if user is authenticated
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to chat with Friday AI",
        action: {
          label: isLoggingIn ? "Signing in..." : "Sign In",
          onClick: handleLogin,
        },
        duration: 5000, // Show for 5 seconds
      });
      return;
    }

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
        updatedAt: new Date().toISOString(),
        creatorUid: user.uid // Add user ID to the chat data
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
      toast.error("Failed to create chat", {
        description: "Please try again later"
      });
    }
  }

  // Rest of the component remains the same...

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