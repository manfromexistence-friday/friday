"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import AiInput from '@/components/ai-input'
import CuisineSelector from "@/components/tags"

type Params = {
  slug: string
}

export default function Home() {
  const params = useParams<Params>()
  const sessionId = params?.slug || ''

  return (
    <div className="w-full flex flex-col min-h-screen py-4 gap-4">
      <h1 className="bold text-3xl w-full font-sans text-center">Friday - Your ai friend.</h1>
      <AiInput />
      <CuisineSelector />
      {/* <FeaturesSection1 /> */}
      {/* <FeaturesSection2 /> */}
      {/* Hello */}
    </div>
  )
}
