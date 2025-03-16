"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useAuth } from '@/contexts/auth-context'
import { LoginButton } from '@/components/auth/login-button'
import LoadingAnimation from '@/components/chat/loading-animation'
import AiInput from '@/components/chat/ai-input'

type Params = {
  slug: string
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const params = useParams<Params>()
  const sessionId = params?.slug || ''

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
    <AiInput sessionId={sessionId} />
  )
}
