"use client"

import * as React from "react"
import { useAuth } from '@/contexts/auth-context'
import { LoginButton } from '@/components/auth/login-button'
import LoadingAnimation from '@/components/chat/loading-animation'
import { useState, useEffect } from "react"
import { Orb, oceanDepthsPreset, multiColorPreset } from "@/components/friday"

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorHovering, setCursorHovering] = useState(false)
  const [activeButton, setActiveButton] = useState<string | null>(null)

  // Track mouse position for glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Magnetic button effect
  const magneticEffect = (e: React.MouseEvent<HTMLButtonElement>, buttonId: string) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()

    // Calculate center of button
    const buttonX = rect.left + rect.width / 2
    const buttonY = rect.top + rect.height / 2

    // Calculate distance from mouse to center
    const distanceX = e.clientX - buttonX
    const distanceY = e.clientY - buttonY

    // Move button slightly toward cursor (magnetic effect)
    button.style.transform = `translate(${distanceX / 10}px, ${distanceY / 10}px) translateY(-2px)`

    setActiveButton(buttonId)
  }

  // Reset button position
  const resetMagneticEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(0)"
    setActiveButton(null)
  }

  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingAnimation />
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoginButton />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      Friday
      <Orb baseOrbSize={30} baseShapeSize={25} {...multiColorPreset} />
    </div>
  )
}


// export default function ChatPage() {
//   const { user, loading } = useAuth()

//   if (loading) {
//     return <LoadingAnimation />
//   }

//   if (!user) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <LoginButton />
//       </div>
//     )
//   }

//   return (
//     <div className="flex size-full items-center justify-center">
//       <h1>Friday</h1>
//     </div>
//   )
// }
