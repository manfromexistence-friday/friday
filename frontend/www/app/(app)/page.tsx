"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import AiInput from '@/components/chat/ai-input'

type Params = {
  slug: string
}

export default function Home() {
  const params = useParams<Params>()
  const sessionId = params?.slug || ''

  return (
    <div className="w-full h-[200vh] flex items-center justify-center flex-col pr-64 overflow-hidden bg-pink-500">
      {/* <AiInput /> */}
      {/* <FeaturesSection1 /> */}
      {/* <FeaturesSection2 /> */}
      HI
    </div>
  )
}
