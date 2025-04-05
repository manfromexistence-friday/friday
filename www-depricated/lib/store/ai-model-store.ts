import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AIModelState {
  currentModel: string
  setModel: (model: string) => void
}

export const useAIModelStore = create<AIModelState>()(
  persist(
    (set) => ({
      currentModel: "gemini-2.0-flash", // Changed from image generation to flash
      setModel: (model: string) => {
        const modelToSet = model || "gemini-2.0-flash" // Updated fallback as well
        console.log('AI model set to:', modelToSet)
        set({ currentModel: modelToSet })
      },
    }),
    {
      name: 'friday-ai-model-storage',
    }
  )
)