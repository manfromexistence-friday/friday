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
    <div className="w-full h-full flex items-center justify-start flex-col relative">
      <AiInput />
      {/* <SiteHeader /> */}
      {/* <FeaturesSection1 /> */}
      {/* <FeaturesSection2 /> */}
    </div>
  )
}
