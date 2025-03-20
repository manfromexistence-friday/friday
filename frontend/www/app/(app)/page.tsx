"use client"

import * as React from "react"
import AiInput from '@/components/ai-input'
import Tags from "@/components/tags"
import Friday from "@/components/friday/friday"

export default function Home() {
  return (
    <div className="w-full flex flex-col min-h-screen py-4 gap-4 items-center justify-center">
      <h1 className="bold text-3xl w-full font-sans text-center">Friday - Your ai friend.</h1>
      <AiInput />
      <Tags />
      {/* <Friday orbSize={100} shapeSize={90} /> */}
    </div>
  )
}
