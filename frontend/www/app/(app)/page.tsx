"use client"

import * as React from "react"
import { useAuth } from '@/contexts/auth-context'
import { LoginButton } from '@/components/auth/login-button'
import LoadingAnimation from '@/components/chat/loading-animation'

export default function ChatPage() {
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
    <div className="flex size-full items-center justify-center">
      <h1>Friday</h1>
    </div>
  )
}
