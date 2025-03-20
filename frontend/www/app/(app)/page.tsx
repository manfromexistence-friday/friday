"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import AiInput from '@/components/ai-input'

type Params = {
  slug: string
}

export default function Home() {
  const params = useParams<Params>()
  const sessionId = params?.slug || ''

  return (
    <div className="w-full flex flex-col min-h-screen py-4">
      <AiInput />

      {/* <FeaturesSection1 /> */}
      {/* <FeaturesSection2 /> */}
      {/* Hello */}
    </div>
  )
}
