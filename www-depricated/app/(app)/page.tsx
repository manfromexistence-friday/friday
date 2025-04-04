"use client"

import * as React from "react"
import AiInput from '@/components/ai-input'
import Friday from "@/components/friday/friday"
import { useAuth } from "@/contexts/auth-context"
import PersonaSelector from "@/components/persona-selector"

export default function Home() {
  const { user } = useAuth()
  const userName = user?.displayName || "friend"
  
  // Using useState and useEffect to ensure client-side only rendering of time-based content
  const [greeting, setGreeting] = React.useState("")
  
  React.useEffect(() => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning")
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }
  }, [])

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-4 py-4">
      <Friday orbSize={100} shapeSize={90} /> 
      <h1 className="bold w-full text-center font-sans text-3xl">
        {greeting && `${greeting}, ${userName}.`}
      </h1>
      <AiInput />
      <div className="transition-all duration-500 ease-in-out w-full animate-content-height">
        <PersonaSelector />
      </div>
    </div>
  )
}