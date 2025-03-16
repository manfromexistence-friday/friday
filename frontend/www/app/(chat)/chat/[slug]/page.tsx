"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from '@/contexts/auth-context'
import { LoginButton } from '@/components/auth/login-button'
import { Loader } from "lucide-react"
type Params = {
    slug: string
}
import LoadingAnimation from '@/components/chat/loading-animation'
import AiInput from '@/components/chat/ai-input'
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"
export default function ChatPage() {
    const { user, loading } = useAuth()
    const params = useParams<Params>() ?? { slug: '' }
    const [isValidating, setIsValidating] = useState(true)
    const [sessionId, setSessionId] = useState<string>("")

    useEffect(() => {
        const validateAndCreateSession = async () => {
            if (!user || !params.slug) return

            const chatRef = doc(db, "chats", params.slug as string)
            const chatDoc = await getDoc(chatRef)

            if (!chatDoc.exists()) {
                // Create new chat session if it doesn't exist
                await setDoc(chatRef, {
                    sessionId: params.slug,
                    creatorUID: user.uid,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    views: 0,
                    isArchived: false,
                    isDeleted: false,
                    title: "New Chat", // Will be updated from backend
                    messages: [], // Will be populated from backend
                })
            }

            setSessionId(params.slug as string)
            setIsValidating(false)
        }

        validateAndCreateSession()
    }, [user, params.slug])

    // if (loading || isValidating) {
    //     return <LoadingAnimation />
    // }

    if (!user) {
        return (
            // <div className="flex items-center justify-center min-h-screen">
            //     <LoginButton />
            // </div>
            //     <div className="flex items-center justify-center p-4 text-muted-foreground">
            //     <Loader className="h-4 w-4 animate-spin mr-2" />
            //     <span className="text-sm">Loading...</span>
            //   </div>
            <LoadingAnimation />
        )
    }

    return (
        <AiInput sessionId={sessionId} />
    )
}