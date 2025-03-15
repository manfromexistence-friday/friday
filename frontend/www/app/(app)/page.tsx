"use client"

import * as React from "react"
import { useAuth } from '@/contexts/auth-context'
import { LoginButton } from '@/components/auth/login-button'
import LoadingAnimation from '@/components/chat/loading-animation'
import AiInput from '@/components/chat/ai-input'

export default function ChatPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingAnimation />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoginButton />
      </div>
    )
  }

  return (
    <AiInput />
  )
}