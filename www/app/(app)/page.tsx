"use client"

import * as React from "react"
import AiInput from '@/components/ai-input'
import Tags from "@/components/tags"
import Friday from "@/components/friday/friday"

export default function Home() {
  return (
    <div className="flex h-[93vh] w-full flex-col items-center justify-center gap-4 py-4">
      <Friday orbSize={100} shapeSize={90} /> 
      <h1 className="bold w-full text-center font-sans text-3xl">Friday - Your ai friend.</h1>
      <AiInput />
      <Tags />
    </div>
  )
}
