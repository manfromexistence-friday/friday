"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingAnimation from "@/components/chat/loading-animation";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState, useCallback } from "react";
import { useCategorySidebar } from "@/components/sidebar/category-sidebar";
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar";
import { aiService } from "@/lib/services/ai-service";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Sanitizes an object for Firestore storage by:
 * 1. Removing undefined/null values
 * 2. Converting complex objects to simple objects
 * 3. Ensuring all nested properties are valid Firestore types
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined && item !== null)
      .map(item => sanitizeForFirestore(item));
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      const sanitizedValue = sanitizeForFirestore(value);
      if (
        sanitizedValue === null ||
        typeof sanitizedValue === 'string' ||
        typeof sanitizedValue === 'number' ||
        typeof sanitizedValue === 'boolean' ||
        Array.isArray(sanitizedValue) ||
        (typeof sanitizedValue === 'object' && sanitizedValue !== null)
      ) {
        sanitized[key] = sanitizedValue;
      } else {
        console.warn(`Invalid value type for key ${key}: ${typeof sanitizedValue}. Skipping.`);
      }
    }
    return sanitized;
  }

  console.error(`Unsupported type: ${typeof obj}. Skipping.`);
  return null;
}

/**
 * Validates a message object to ensure it conforms to Firestore requirements
 */
function validateMessage(message: Message): boolean {
  if (typeof message.id !== 'string' || message.id.length === 0) return false;
  if (message.role !== 'user' && message.role !== 'assistant') return false;
  if (typeof message.content !== 'string') return false;
  if (typeof message.timestamp !== 'string') return false;
  if (message.images) {
    if (!Array.isArray(message.images)) return false;
    for (const img of message.images) {
      if (typeof img.url !== 'string' || typeof img.mime_type !== 'string') return false;
    }
  }
  if (message.reasoning) {
    if (typeof message.reasoning !== 'object' || message.reasoning === null) return false;
    if (typeof message.reasoning.thinking !== 'string' || typeof message.reasoning.answer !== 'string') return false;
  }
  return true;
}

// Define expected AI response type
interface AIResponse {
  images?: { image: string; mime_type: string }[];
  [key: string]: any;
}

const MIN_HEIGHT = 48;
const MAX_HEIGHT = 164;

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

type Params = {
  slug: string;
};

export default function ChatPage() {
  const { user } = useAuth();
  const params = useParams<Params>() ?? { slug: "" };
  const [isValidating, setIsValidating] = useState(true);
  const queryClient = useQueryClient();
  const { categorySidebarState } = useCategorySidebar();
  const { subCategorySidebarState } = useSubCategorySidebar();

  const [value, setValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const [selectedAI, setSelectedAI] = useState(aiService.currentModel);
  const [sessionId, setSessionId] = useState<string>(params.slug);
  const [initialResponseGenerated, setInitialResponseGenerated] = useState(false);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  });

  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);
  const [showSearch, setShowSearch] = useState(false);
  const [showResearch, setShowReSearch] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

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

          if (data?.messages) {
            setChatState((prev) => ({
              ...prev,
              messages: data.messages,
            }));
          }

          if (data?.model && !selectedAI) {
            setSelectedAI(data.model);
            aiService.setModel(data.model);
          }
        }
      },
      (error) => {
        console.error("Error listening to chat updates:", error);
        setChatState((prev) => ({
          ...prev,
          error: "Failed to receive message updates",
          isLoading: false,
        }));
        toast.error("Failed to receive message updates");
      }
    );

    return () => unsubscribe();
  }, [sessionId, selectedAI]);

  useEffect(() => {
    const shouldGenerateResponse = sessionStorage.getItem("autoSubmit") === "true";
    const storedModel = sessionStorage.getItem("selectedAI");

    if (
      shouldGenerateResponse &&
      sessionId &&
      chatState.messages.length > 0 &&
      !initialResponseGenerated &&
      !chatState.isLoading
    ) {
      const generateInitialResponse = async () => {
        try {
          setChatState((prev) => ({ ...prev, isLoading: true }));
          sessionStorage.removeItem("autoSubmit");
          sessionStorage.removeItem("initialPrompt");
          setInitialResponseGenerated(true);

          const lastMessage = chatState.messages[chatState.messages.length - 1];
          if (lastMessage.role !== "user") {
            setChatState((prev) => ({ ...prev, isLoading: false }));
            return;
          }

          if (storedModel) {
            setSelectedAI(storedModel);
            aiService.setModel(storedModel);
          }

          const aiResponse = await aiService.generateResponse(lastMessage.content);
          console.log("Raw aiResponse (initial):", aiResponse);

          const assistantMessageBase = {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: typeof aiResponse === "string" ? aiResponse : "",
            timestamp: new Date().toISOString(),
          };

          const assistantMessage: Message = {
            ...assistantMessageBase,
            ...(typeof aiResponse !== "string" && Array.isArray(aiResponse.images) && aiResponse.images.length > 0
              ? {
                  images: aiResponse.images
                    .filter((img) => img && typeof img.image === "string" && typeof img.mime_type === "string")
                    .map((img) => ({ url: img.image, mime_type: img.mime_type })),
                }
              : {}),
            ...(typeof aiResponse === "string" && lastMessage.content.includes("reasoning")
              ? { reasoning: { thinking: "Processing...", answer: aiResponse } }
              : {}),
          };

          const sanitizedMessage = sanitizeForFirestore(assistantMessage);
          if (!validateMessage(sanitizedMessage)) {
            throw new Error("Invalid assistant message structure");
          }

          const chatRef = doc(db, "chats", sessionId);
          console.log("Saving initial response:", { messages: arrayUnion(sanitizedMessage), updatedAt: Timestamp.fromDate(new Date()) });
          await updateDoc(chatRef, {
            messages: arrayUnion(sanitizedMessage),
            updatedAt: Timestamp.fromDate(new Date()),
          });

          setChatState((prev) => ({ ...prev, isLoading: false }));
        } catch (error) {
          console.error("Error generating initial response:", error);
          setChatState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Failed to generate AI response",
          }));
          toast.error("Failed to generate initial AI response");
        }
      };

      generateInitialResponse();
    }
  }, [sessionId, chatState.messages, initialResponseGenerated, chatState.isLoading]);

  const handleSubmit = async () => {
    if (!value.trim() || !sessionId || chatState.isLoading) return;

    try {
      setChatState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: value.trim(),
        timestamp: new Date().toISOString(),
      };

      const sanitizedUserMessage = sanitizeForFirestore(userMessage);
      if (!validateMessage(sanitizedUserMessage)) {
        throw new Error("Invalid user message structure");
      }

      const chatRef = doc(db, "chats", sessionId);
      console.log("Saving user message:", { messages: arrayUnion(sanitizedUserMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedUserMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
      }

      aiService.setModel(selectedAI);
      const startTime = Date.now();
      const aiResponse: string | AIResponse = await aiService.generateResponse(userMessage.content);
      console.log("Raw aiResponse (handleSubmit):", aiResponse);

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - elapsedTime));
      }

      const assistantMessageBase = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: typeof aiResponse === "string" ? aiResponse : "",
        timestamp: new Date().toISOString(),
      };

      let images: Array<{ url: string; mime_type: string }> = [];
      if (typeof aiResponse !== "string" && Array.isArray(aiResponse.images)) {
        images = aiResponse.images
          .filter(img => img && typeof img.image === "string" && typeof img.mime_type === "string")
          .map(img => ({
            url: img.image,
            mime_type: img.mime_type
          }));
      }

      let reasoning = null;
      if (typeof aiResponse === "string" && selectedAI.includes("reasoning")) {
        reasoning = {
          thinking: "Processing...",
          answer: aiResponse
        };
      }

      const assistantMessage: Message = {
        ...assistantMessageBase,
        ...(images.length > 0 ? { images } : {}),
        ...(reasoning ? { reasoning } : {}),
      };

      const sanitizedAssistantMessage = sanitizeForFirestore(assistantMessage);
      if (!validateMessage(sanitizedAssistantMessage)) {
        throw new Error("Invalid assistant message structure");
      }

      console.log("Saving assistant message:", { messages: arrayUnion(sanitizedAssistantMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedAssistantMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setChatState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to get AI response",
      }));
      toast.error("Failed to get AI response");
    }
  };

  const handleImageGeneration = async (response: {
    text_responses: string[];
    images: { image: string; mime_type: string }[];
    model_used: string;
  }) => {
    if (!sessionId || chatState.isLoading) return;

    try {
      setChatState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: `Generate an image: ${value.trim()}`,
        timestamp: new Date().toISOString(),
      };

      const sanitizedUserMessage = sanitizeForFirestore(userMessage);
      if (!validateMessage(sanitizedUserMessage)) {
        throw new Error("Invalid user message structure for image generation");
      }

      const chatRef = doc(db, "chats", sessionId);
      console.log("Saving user message for image generation:", { messages: arrayUnion(sanitizedUserMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedUserMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
      }

      const validImages = response.images
        .filter((img) => img && typeof img.image === "string" && typeof img.mime_type === "string")
        .map((img) => ({
          url: img.image,
          mime_type: img.mime_type,
        }));

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.text_responses.join("\n\n"),
        ...(validImages.length > 0 ? { images: validImages } : {}),
        timestamp: new Date().toISOString(),
      };

      const sanitizedMessage = sanitizeForFirestore(assistantMessage);
      if (!validateMessage(sanitizedMessage)) {
        throw new Error("Invalid assistant message structure for image generation");
      }

      console.log("Saving image generation message:", { messages: arrayUnion(sanitizedMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setChatState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error("Error in image generation:", error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to process image generation",
      }));
      toast.error("Failed to process image generation");
    }
  };

  const handleURLAnalysis = async (
    urls: string[],
    prompt: string,
    type: string = "url_analysis"
  ): Promise<void> => {
    try {
      setChatState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: `Analyze this: ${urls.join(", ")} ${prompt ? `\n\n${prompt}` : ""}`,
        timestamp: new Date().toISOString(),
      };

      const sanitizedUserMessage = sanitizeForFirestore(userMessage);
      if (!validateMessage(sanitizedUserMessage)) {
        throw new Error("Invalid user message structure for URL analysis");
      }

      const chatRef = doc(db, "chats", sessionId);
      console.log("Saving user message for URL analysis:", { messages: arrayUnion(sanitizedUserMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedUserMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
      }

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/analyze_media_from_url`;
      const payload = { urls, prompt };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const responseData = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseData.response || responseData.text || "Analysis complete.",
        timestamp: new Date().toISOString(),
      };

      const sanitizedMessage = sanitizeForFirestore(assistantMessage);
      if (!validateMessage(sanitizedMessage)) {
        throw new Error("Invalid assistant message structure for URL analysis");
      }

      console.log("Saving URL analysis message:", { messages: arrayUnion(sanitizedMessage), updatedAt: Timestamp.fromDate(new Date()) });
      await updateDoc(chatRef, {
        messages: arrayUnion(sanitizedMessage),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setChatState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error("Error in URL analysis:", error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to analyze URL content",
      }));
      toast.error("Failed to analyze content");
    }
  };

  const handleAdjustHeight = useCallback(
    (reset = false) => {
      if (!textareaRef.current) return;

      if (reset) {
        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
        return;
      }

      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, MAX_HEIGHT)}px`;
    },
    [textareaRef]
  );

  if (!user) {
    return <LoadingAnimation />;
  }

  return (
    <div
      className={cn(
        "relative flex min-h-full w-full flex-col transition-all duration-200 ease-linear"
      )}
    >
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
        selectedAI={selectedAI}
      />
      <ChatInput
        className="absolute bottom-14 left-1/2 z-50 -translate-x-1/2 md:bottom-2"
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
          aiService.setModel(model);
        }}
        onUrlAnalysis={handleURLAnalysis}
      />
    </div>
  );
}