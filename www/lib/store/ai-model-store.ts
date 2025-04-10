import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AIModelState {
  currentModel: string
  setModel: (model: string) => void
}

export const useAIModelStore = create<AIModelState>()(
  persist(
    (set, get) => ({
      currentModel: "gemini-2.0-flash",
      setModel: (model: string) => {
        if (!model) return; // Don't allow empty models
        const modelToSet = model || get().currentModel; // Use current model as fallback
        console.log('AI model store updating to:', modelToSet);
        set({ currentModel: modelToSet });
      },
    }),
    {
      name: 'friday-ai-model-storage',
      // Only store currentModel in localStorage
      partialize: (state) => ({ currentModel: state.currentModel }),
    }
  )
)
