"use client"

import * as React from "react"
import AiInput from '@/components/ai-input'
import Tags from "@/components/tags"
import Friday from "@/components/friday/friday"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import StandaloneReasoning from "@/components/reasoning"
import StandaloneImageGen from "@/components/image-gen"

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
    <div className="flex h-[100svh] w-full flex-col items-center justify-center gap-4 py-4">
      <Friday orbSize={100} shapeSize={90} /> 
      <h1 className="bold w-full text-center font-sans text-3xl">
        {greeting && `${greeting}, ${userName}.`}
      </h1>
      <AiInput />
      <Tags />
      <StandaloneImageGen content="Generate a story about a white baby goat going on an adventure in a farm in a 3d cartoon animation style. For each scene, generate an image." />
    </div>
  )
}
