"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useAuth } from '@/contexts/auth-context'
import LoadingAnimation from '@/components/chat/loading-animation'
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore"
import { useEffect, useRef, useState, useCallback } from "react"
import { useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { aiService } from '@/lib/services/ai-service'
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { useQueryClient } from "@tanstack/react-query"
import type { Message } from "@/types/chat"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

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
    const queryClient = useQueryClient()
    const { categorySidebarState } = useCategorySidebar()
    const { subCategorySidebarState } = useSubCategorySidebar()

    const [value, setValue] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement)
    const [selectedAI, setSelectedAI] = useState("gemini-2.0-flash")
    const [sessionId, setSessionId] = useState<string>(params.slug)
    const [initialResponseGenerated, setInitialResponseGenerated] = useState(false)

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: MIN_HEIGHT,
        maxHeight: MAX_HEIGHT,
    })

    const [inputHeight, setInputHeight] = useState(MIN_HEIGHT)
    const [showSearch, setShowSearch] = useState(false)
    const [showResearch, setShowReSearch] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Add chat state management - with a single source of truth
    const [chatState, setChatState] = useState<ChatState>({
        messages: [],
        isLoading: false,
        error: null,
    })

    // Set up Firestore listener for real-time updates
    useEffect(() => {
        if (!sessionId) return;
        
        console.log("Setting up Firestore listener for chat:", sessionId);
        
        const chatRef = doc(db, "chats", sessionId);
        const unsubscribe = onSnapshot(
            chatRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    console.log("Received chat data update:", data);
                    
                    // Update chat state with messages from Firestore
                    // BUT preserve the isLoading state - don't automatically set it to false
                    if (data?.messages) {
                        setChatState(prev => ({
                            ...prev,
                            messages: data.messages
                            // Don't update isLoading here! Let the AI response handlers control this
                        }));
                    }
                    
                    // Load initial AI model
                    if (data?.model && !selectedAI) {
                        setSelectedAI(data.model);
                        aiService.setModel(data.model);
                    }
                }
            },
            (error) => {
                console.error("Error listening to chat updates:", error);
                setChatState(prev => ({
                    ...prev,
                    error: "Failed to receive message updates",
                    isLoading: false  // Only set to false on error
                }));
                toast.error("Failed to receive message updates");
            }
        );
        
        return () => unsubscribe();
    }, [sessionId, selectedAI]);

    // Generate AI response for initial message when page loads
    useEffect(() => {
        const shouldGenerateResponse = sessionStorage.getItem('autoSubmit') === 'true';
        const storedModel = sessionStorage.getItem('selectedAI');
        
        if (shouldGenerateResponse && sessionId && chatState.messages.length > 0 && 
            !initialResponseGenerated && !chatState.isLoading) {
            
            const generateInitialResponse = async () => {
                try {
                    console.log("Generating initial AI response - setting thinking state");
                    // Set loading state
                    setChatState(prev => ({
                        ...prev,
                        isLoading: true  // This controls the thinking state
                    }));
                    
                    // Clear sessionStorage flags immediately
                    sessionStorage.removeItem('autoSubmit');
                    sessionStorage.removeItem('initialPrompt');
                    setInitialResponseGenerated(true);
                    
                    // Get the last user message
                    const lastMessage = chatState.messages[chatState.messages.length - 1];
                    if (lastMessage.role !== 'user') {
                        setChatState(prev => ({...prev, isLoading: false}));
                        return;
                    }
                    
                    // Set the AI model
                    if (storedModel) {
                        setSelectedAI(storedModel);
                        aiService.setModel(storedModel);
                    }
                    
                    // Generate AI response
                    const aiResponse = await aiService.generateResponse(lastMessage.content);
                    
                    // Add AI response to Firestore
                    const assistantMessage: Message = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: aiResponse,
                        timestamp: new Date().toISOString(),
                    };
                    
                    const chatRef = doc(db, "chats", sessionId);
                    await updateDoc(chatRef, {
                        messages: arrayUnion(assistantMessage),
                        updatedAt: new Date().toISOString()
                    });
                    
                    // Make sure to set isLoading to false when done
                    setChatState(prev => ({
                        ...prev,
                        isLoading: false
                    }));
                    
                } catch (error) {
                    console.error("Error generating initial response:", error);
                    setChatState(prev => ({
                        ...prev,
                        isLoading: false,
                        error: "Failed to generate AI response"
                    }));
                    toast.error("Failed to generate initial AI response");
                }
            };
            
            generateInitialResponse();
        }
    }, [sessionId, chatState.messages, initialResponseGenerated, chatState.isLoading]);

    // Handle normal submissions
    const handleSubmit = async () => {
        if (!value.trim() || !sessionId || chatState.isLoading) return;

        try {
            // Set loading state
            setChatState(prev => ({
                ...prev,
                isLoading: true,
                error: null
            }));
            
            // Create user message
            const userMessage: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: value.trim(),
                timestamp: new Date().toISOString(),
            };

            // Add user message to Firestore
            const chatRef = doc(db, "chats", sessionId);
            await updateDoc(chatRef, {
                messages: arrayUnion(userMessage),
                updatedAt: new Date().toISOString()
            });

            // Clear input
            setValue("");
            if (textareaRef.current) {
                textareaRef.current.style.height = `${MIN_HEIGHT}px`;
            }

            // Generate AI response
            aiService.setModel(selectedAI);
            
            // Enforce a minimum thinking time (at least 1 second)
            const startTime = Date.now();
            
            // Generate the response
            const aiResponse = await aiService.generateResponse(userMessage.content);
            
            // Calculate elapsed time and add delay if necessary to show "thinking" for at least 1 second
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
            }

            // Add AI response to Firestore
            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: aiResponse,
                timestamp: new Date().toISOString(),
            };

            await updateDoc(chatRef, {
                messages: arrayUnion(assistantMessage),
                updatedAt: new Date().toISOString()
            });
            
            // Now set isLoading to false
            setChatState(prev => ({
                ...prev,
                isLoading: false
            }));

        } catch (error) {
            console.error("Error:", error);
            setChatState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to get AI response"
            }));
            toast.error("Failed to get AI response");
        }
    };

    // Handle height adjustment for textarea
    const handleAdjustHeight = useCallback((reset = false) => {
        if (!textareaRef.current) return;
        
        if (reset) {
            textareaRef.current.style.height = `${MIN_HEIGHT}px`;
            return;
        }
        
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${Math.min(scrollHeight, MAX_HEIGHT)}px`;
    }, [textareaRef]);

    if (!user) {
        return <LoadingAnimation />;
    }

    return (
        <div className={cn(
            "relative flex min-h-full w-full flex-col transition-all duration-200 ease-linear",
        )}>
            {chatState.error && (
                <div className="bg-destructive/90 absolute inset-x-0 top-0 z-50 p-2 text-center text-sm">
                    {chatState.error}
                </div>
            )}
            <MessageList
                chatId={sessionId}
                messages={chatState.messages}
                messagesEndRef={messagesEndRef}
                isThinking={chatState.isLoading}
            />
            <ChatInput
                className="absolute bottom-14 left-1/2 z-50 -translate-x-1/2 md:bottom-2"
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
                    setSelectedAI(model);
                    aiService.setModel(model);
                }}
            />
        </div>
    );
}