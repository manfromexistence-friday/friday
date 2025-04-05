"use client"

import * as React from 'react'
import { useAIModelStore } from '@/lib/store/ai-model-store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const AI_MODELS = [
  { value: "gemini-2.0-flash-exp-image-generation", label: "Gemini Flash w/ Images" },
  { value: "gemini-2.5-pro-exp-03-25", label: "Gemini Pro w/ Thinking" },
  { value: "gemini-2.0-flash-thinking-exp-01-21", label: "Gemini Flash w/ Thinking" },
  // Add more models as needed
]

export function ModelSelector() {
  const { currentModel, setModel } = useAIModelStore()

  return (
    <Select value={currentModel} onValueChange={setModel}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select AI model" />
      </SelectTrigger>
      <SelectContent>
        {AI_MODELS.map((model) => (
          <SelectItem key={model.value} value={model.value}>
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}