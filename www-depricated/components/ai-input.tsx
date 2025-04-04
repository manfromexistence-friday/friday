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
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { aiService } from "@/lib/services/ai-service"

// Update the ChatState interface to match the one in chat-input.tsx
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
  const [selectedAI, setSelectedAI] = useState(aiService.currentModel)
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
      setInputHeight(MIN_HEIGHT)
      return
    }

    const scrollHeight = textareaRef.current.scrollHeight
    const newHeight = Math.min(scrollHeight, MAX_HEIGHT)
    textareaRef.current.style.height = `${newHeight}px`
    setInputHeight(newHeight)
  }, [textareaRef])

  const [showSearch, setShowSearch] = useState(false)
  const [showResearch, setShowReSearch] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Add chat state management
  const [chatState, setChatState] = useState<ChatState>({
    messages: [], // Ensure this is always an array
    isLoading: false,
    error: null,
  })

  // Add URL analysis handler
  const handleUrlAnalysis = (urls: string[], prompt: string) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to analyze URLs",
        action: {
          label: isLoggingIn ? "Signing in..." : "Sign In",
          onClick: handleLogin,
        },
        duration: 5000,
      });
      return;
    }

    // Combine URLs and prompt
    const fullPrompt = `${prompt}: ${urls.join(', ')}`;
    setValue(fullPrompt);

    // Auto-submit if desired
    // handleSubmit();
  }

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
        timestamp: new Date().toISOString()
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
        creatorUid: user.uid, // Add user ID to the chat data
        reactions: {
          likes: {},
          dislikes: {}
        },
        participants: [user.uid],
        views: 0,
        uniqueViewers: [],
        isPinned: false
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
        showThinking={showThinking}
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
        onThinkingToggle={() => setShowThinking(!showThinking)}
        selectedAI={selectedAI}
        onAIChange={(model) => {
          setSelectedAI(model);
          // Also update the aiService model if it's imported and available
          if (typeof window !== 'undefined') {
            // Dynamically import if needed to avoid SSR issues
            import('@/lib/services/ai-service').then(({ aiService }) => {
              aiService.setModel(model);
            });
          }
        }}
      />
    </div>
  )
}
