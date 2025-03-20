"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useAuth } from '@/contexts/auth-context'
import LoadingAnimation from '@/components/chat/loading-animation'
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useEffect, useRef, useState, useCallback } from "react"
import { useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { aiService } from '@/lib/services/ai-service'
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { updateDoc, arrayUnion } from 'firebase/firestore'
import { useQueryClient } from "@tanstack/react-query"
import type { Message } from "@/types/chat"
import { cn } from "@/lib/utils"

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

// First, update the ChatState interface if not already defined
interface ChatState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
}

type Params = {
    slug: string
}

export default function ChatPage() {
    const { user } = useAuth()
    const params = useParams<Params>() ?? { slug: '' }
    const [isValidating, setIsValidating] = useState(true)
    const [sessionId, setSessionId] = useState<string>("")
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
    const [selectedAI, setSelectedAI] = useState("gemini-2.0-flash") // Set default model

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
            await updateFirestoreMessages(userMessage)

            // 4. Set loading state after user message is saved
            setChatState(prev => ({
                ...prev,
                isLoading: true,
            }))

            // 5. Set the AI model before generating response
            aiService.setModel(selectedAI)

            // 6. Get AI response
            const aiResponse = await aiService.generateResponse(userMessage.content)

            // 7. Create and save AI message
            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: aiResponse,
                timestamp: new Date().toISOString(),
            }

            // 8. Update Firestore with AI response
            await updateFirestoreMessages(assistantMessage)

            // 9. Update chat state
            setChatState(prev => ({
                ...prev,
                isLoading: false,
            }))

        } catch (error) {
            console.error("Error:", error)
            setChatState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to get AI response"
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


    useEffect(() => {
        const validateAndCreateSession = async () => {
            if (!user || !params.slug) return

            const chatRef = doc(db, "chats", params.slug as string)
            const chatDoc = await getDoc(chatRef)

            if (!chatDoc.exists()) {
                // Create new chat session if it doesn't exist
                await setDoc(chatRef, {
                    sessionId: params.slug,
                    creatorUid: user.uid,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    views: 0,
                    reactions: {
                        likes: 0,
                        dislikes: 0
                    },
                    isStarred: false,
                    isDeleted: false,
                    title: "New Chat", // Will be updated from backend
                    messages: [], // Will be populated from backend
                })
            }

            setSessionId(params.slug as string)
            setIsValidating(false)
        }

        validateAndCreateSession()
    }, [user, params.slug])

    useEffect(() => {
        // Get and clear the stored prompt and AI model
        const initialPrompt = sessionStorage.getItem('initialPrompt')
        const storedAI = sessionStorage.getItem('selectedAI')

        if (initialPrompt) {
            setValue(initialPrompt)
            sessionStorage.removeItem('initialPrompt')

            // Focus the textarea
            if (textareaRef.current) {
                textareaRef.current.focus()
                // Move cursor to end of text
                const len = initialPrompt.length
                textareaRef.current.setSelectionRange(len, len)
            }
        }

        if (storedAI) {
            // Set the AI model
            aiService.setModel(storedAI)
            sessionStorage.removeItem('selectedAI')
        }
    }, [textareaRef])

    useEffect(() => {
        const shouldAutoSubmit = sessionStorage.getItem('autoSubmit')
        const initialPrompt = sessionStorage.getItem('initialPrompt')
        
        if (shouldAutoSubmit === 'true' && initialPrompt) {
          // Clear the auto-submit flag
          sessionStorage.removeItem('autoSubmit')
          
          // Set the initial value
          setValue(initialPrompt)
          
          // Submit after a short delay to ensure components are mounted
          const timeoutId = setTimeout(() => {
            handleSubmit()
          }, 100)
    
          return () => clearTimeout(timeoutId)
        }
      }, [])

    if (!user) {
        return (
            <LoadingAnimation />
        )
    }

    return (
        <div className={cn(
            "relative flex h-[94vh] w-full flex-col transition-[left,right,width,margin-right] duration-200 ease-linear",
        )}>
            {chatState.error && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-destructive/90 p-2 text-center text-sm text-white">
                    {chatState.error}
                </div>
            )}
            <MessageList
                chatId={sessionId}
                messagesEndRef={messagesEndRef}
                isThinking={chatState.isLoading}
            />
            <ChatInput
                className="absolute bottom-14 left-1/2 z-[1000] -translate-x-1/2 md:bottom-2"
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
                onAIChange={(model) => {
                    setSelectedAI(model)
                    aiService.setModel(model)
                }}
            />
        </div>
    )
}