"use client"

import { useState } from "react"
import { FileText, Heart, SmilePlus, User, FileCheck, X, Brain, Search, Tag, Zap, BarChart2, Code } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAIModelStore } from "@/lib/store/ai-model-store"
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

export default function PersonaSelector() {
  const [view, setView] = useState<"personas" | "suggestions">("personas")
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { currentModel } = useAIModelStore()

  const personas = [
    { id: "latest-news", label: "Latest News", icon: FileText, color: "text-blue-500" },
    { id: "companion", label: "Companion", icon: Heart, color: "text-pink-500" },
    { id: "comedian", label: "Unhinged Comedian", icon: SmilePlus, color: "text-yellow-500" },
    { id: "friend", label: "Loyal Friend", icon: User, color: "text-purple-500" },
    { id: "homework", label: "Homework Helper", icon: FileCheck, color: "text-green-500" },
  ]

  const secondaryPersonas = [
    { id: "not-doctor", label: "Not a Doctor", icon: X, color: "text-red-500" },
    { id: "not-therapist", label: "Not a Therapist", icon: Brain, color: "text-amber-500" },
  ]

  const suggestions = [
    { id: "research", label: "Research", icon: Search, color: "text-sky-500" },
    { id: "create-images", label: "Create images", icon: Tag, color: "text-emerald-500" },
    { id: "how-to", label: "How to", icon: Zap, color: "text-orange-500" },
    { id: "analyze", label: "Analyze", icon: BarChart2, color: "text-violet-500" },
    { id: "code", label: "Code", icon: Code, color: "text-cyan-500" },
  ]

  // Generate prompt based on persona
  const getPromptForPersona = (personaId: string) => {
    switch (personaId) {
      case "latest-news":
        return "What are the latest news updates today? Give me a summary of the most important events."
      case "companion":
        return "Hi, I'm looking for a friendly chat. How are you today? Can you be my companion for a while?"
      case "comedian":
        return "Tell me an unhinged and hilarious joke that will make me laugh out loud. Don't hold back!"
      case "friend":
        return "Hey friend, I could use some advice or just someone to talk to today. Can you be a loyal friend for me?"
      case "homework":
        return "I need help with my homework. Can you assist me with some difficult problems I'm facing?"
      case "not-doctor":
        return "I have a general health question, but I understand you're not a doctor and can't provide medical advice. With that in mind, can you help me understand some general health concepts?"
      case "not-therapist":
        return "I'm feeling down today. Can you provide some general support while recognizing you're not a therapist? Maybe some motivational words or advice?"
      default:
        return "Hi, I'd like to chat with you based on your personality as a helpful assistant."
    }
  }

  // Generate prompt based on suggestion
  const getPromptForSuggestion = (suggestionId: string) => {
    switch (suggestionId) {
      case "research":
        return "I need to research about the history of artificial intelligence. Can you help me gather information?"
      case "create-images":
        return "Image: Create an image of a futuristic city with flying cars and neon lights."
      case "how-to":
        return "How to bake a chocolate cake from scratch with simple ingredients?"
      case "analyze":
        return "Analyze this text for sentiment and key themes: 'The company announced record profits this quarter, but employees are concerned about potential layoffs.'"
      case "code":
        return "Write a code example for a simple React component that displays a counter with increment and decrement buttons."
      default:
        return "I'd like to chat about something interesting."
    }
  }

  // Handle login
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast.success("Successfully logged in")
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error('Failed to log in. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Create new chat with prompt
  const createNewChat = async (prompt: string) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to chat with Friday AI",
        action: {
          label: isLoggingIn ? "Signing in..." : "Sign In",
          onClick: handleLogin,
        },
        duration: 5000,
      });
      return;
    }

    try {
      const chatId = uuidv4()
      const trimmedPrompt = prompt.trim()

      // Create initial message
      const initialMessage = {
        id: uuidv4(),
        content: trimmedPrompt,
        role: 'user',
        timestamp: new Date().toISOString()
      }

      // Create initial chat data
      const chatData = {
        id: chatId,
        title: trimmedPrompt.slice(0, 50) + (trimmedPrompt.length > 50 ? '...' : ''),
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
      sessionStorage.setItem('initialPrompt', trimmedPrompt)
      sessionStorage.setItem('selectedAI', currentModel)
      sessionStorage.setItem('chatId', chatId)
      sessionStorage.setItem('autoSubmit', 'true')

      // Navigate to chat page
      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to create chat", {
        description: "Please try again later"
      });
    }
  }

  // Modified handlers to create chat
  const handlePersonaClick = (id: string) => {
    const prompt = getPromptForPersona(id)
    setSelectedPersona(id)
    createNewChat(prompt)
  }

  const handleTagToggle = (id: string) => {
    const prompt = getPromptForSuggestion(id)
    setSelectedTags((prev) => [...prev, id])
    createNewChat(prompt)
  }

  const toggleView = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setView((prev) => (prev === "personas" ? "suggestions" : "personas"))
      setIsAnimating(false)
    }, 300)
  }

  return (
    <div className="mx-auto flex max-w-[50%] flex-col items-center gap-2 p-2 transition-all duration-500 ease-in-out">
      <div 
        className={`w-full text-sm transition-all duration-300 ease-in-out ${
          isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {view === "personas" ? (
          <>
            <div className="flex flex-wrap justify-center gap-2">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaClick(persona.id)}
                  className={`border-border hover:border- group flex items-center gap-2 rounded-full border px-4 py-2 ${persona.color.split('-')[1]}-400 hover:bg-${persona.color.split('-')[1]}-50 dark:hover:bg-${persona.color.split('-')[1]}-900/20 transition-all duration-300 ${
                    selectedPersona === persona.id 
                      ? `bg-${persona.color.split('-')[1]}-100 dark:bg-${persona.color.split('-')[1]}-800/30 shadow- shadow-md${persona.color.split('-')[1]}-200/20 scale-105` 
                      : "bg-background hover:scale-103 hover:-translate-y-0.5"
                  }`}
                >
                  <persona.icon className={`size-4 ${persona.color} transition-transform group-hover:scale-110`} />
                  <span className={selectedPersona === persona.id ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}>
                    {persona.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {secondaryPersonas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaClick(persona.id)}
                  className={`border-border hover:border- group flex items-center gap-2 rounded-full border px-4 py-2 ${persona.color.split('-')[1]}-400 hover:bg-${persona.color.split('-')[1]}-50 dark:hover:bg-${persona.color.split('-')[1]}-900/20 transition-all duration-300 ${
                    selectedPersona === persona.id 
                      ? `bg-${persona.color.split('-')[1]}-100 dark:bg-${persona.color.split('-')[1]}-800/30 shadow- shadow-md${persona.color.split('-')[1]}-200/20 scale-105` 
                      : "bg-background hover:scale-103 hover:-translate-y-0.5"
                  }`}
                >
                  <persona.icon className={`size-4 ${persona.color} transition-transform group-hover:scale-110`} />
                  <span className={selectedPersona === persona.id ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}>
                    {persona.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleTagToggle(suggestion.id)}
                className={`group flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-300 ${
                  selectedTags.includes(suggestion.id)
                    ? `border-${suggestion.color.split('-')[1]}-500 bg-${suggestion.color.split('-')[1]}-50 dark:bg-${suggestion.color.split('-')[1]}-900/20 shadow- shadow-md${suggestion.color.split('-')[1]}-200/10 scale-105`
                    : `border-border bg-background hover:scale-103 hover:bg- hover:-translate-y-0.5${suggestion.color.split('-')[1]}-50 dark:hover:bg-${suggestion.color.split('-')[1]}-900/10 hover:border-${suggestion.color.split('-')[1]}-400`
                }`}
              >
                <suggestion.icon
                  className={`size-4 ${selectedTags.includes(suggestion.id) ? suggestion.color : suggestion.color + " opacity-70 group-hover:opacity-100"} transition-transform group-hover:scale-110`}
                />
                <span
                  className={`transition-all ${selectedTags.includes(suggestion.id) ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}
                >
                  {suggestion.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={toggleView}
        className="text-muted-foreground hover:text-foreground mt-4 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:underline"
        disabled={isAnimating}
      >
        Switch to {view === "personas" ? "Suggestions" : "Personas"}
      </button>
    </div>
  )
}
