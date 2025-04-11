"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useAIModelStore } from "@/lib/store/ai-model-store"

interface SearchRecommendation {
  id: string
  query: string
}

interface SearchRecommendationsProps {
  userInput?: string
}

export default function SearchRecommendations({ userInput = "" }: SearchRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SearchRecommendation[]>([])
  const router = useRouter()
  const { user } = useAuth()
  const { currentModel } = useAIModelStore()

  useEffect(() => {
    // Generate recommendations based on input
    if (userInput) {
      const processedInput = userInput.trim().toLowerCase()
      
      const simulatedRecommendations = [
        { id: "1", query: `${processedInput} definition` },
        { id: "2", query: `${processedInput} examples` },
        { id: "3", query: `${processedInput} tutorial` },
        { id: "4", query: `how to use ${processedInput}` },
        { id: "5", query: `best ${processedInput} alternatives` },
      ]
      setRecommendations(simulatedRecommendations)
    } else {
      // Default recommendations if no input
      setRecommendations([
        { id: "1", query: "Latest technology news" },
        { id: "2", query: "Current global events" },
        { id: "3", query: "AI advancements" },
        { id: "4", query: "Programming tutorials" },
        { id: "5", query: "Web development tips" },
      ])
    }
  }, [userInput])

  const handleRecommendationClick = async (query: string) => {
    if (!user) {
      toast.error("Please sign in to start a chat")
      return
    }

    try {
      const chatId = uuidv4()
      
      // Create initial message
      const initialMessage = {
        id: uuidv4(),
        content: query,
        role: 'user',
        timestamp: new Date().toISOString()
      }

      // Create initial chat data
      const chatData = {
        id: chatId,
        title: query.slice(0, 50) + (query.length > 50 ? '...' : ''),
        messages: [initialMessage],
        model: currentModel,
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creatorUid: user.uid,
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

      // Store session data for auto-submission
      sessionStorage.setItem('initialPrompt', query)
      sessionStorage.setItem('selectedAI', currentModel)
      sessionStorage.setItem('chatId', chatId)
      sessionStorage.setItem('autoSubmit', 'true')

      // Navigate to chat page
      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error("Error creating chat:", error)
      toast.error("Failed to create chat")
    }
  }

  return (
    <div className="mx-auto flex max-w-[50%] flex-col items-center gap-2 p-2">
      <div className="w-full text-sm">
        <div className="mb-2 flex items-center justify-center">
          <Search className="mr-2 size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Search recommendations</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          {recommendations.map((rec) => (
            <button
              key={rec.id}
              onClick={() => handleRecommendationClick(rec.query)}
              className="bg-background hover:bg-secondary/80 border-border group flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
            >
              <Search className="size-4 text-blue-500 transition-transform group-hover:scale-110" />
              <span className="text-muted-foreground group-hover:text-foreground">
                {rec.query}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
