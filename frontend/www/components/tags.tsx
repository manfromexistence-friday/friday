"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

const aiCapabilities = [
  "Images",
  "Chat",
  "Code",
  "Summary",
  "Translate",
]

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
}

export default function Tags() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  const handleTagClick = async (capability: string) => {
    const chatId = uuidv4()
    
    // Map capabilities to predefined prompts
    const prompts: Record<string, string> = {
      "Images": "Generate an image of ",
      "Chat": "Let's have a conversation about ",
      "Code": "Write code for ",
      "Summary": "Summarize this: ",
      "Translate": "Translate this to English: "
    }

    // Store the prompt in sessionStorage for the chat page to access
    sessionStorage.setItem('initialPrompt', prompts[capability])
    
    // Navigate to new chat with the generated ID
    router.push(`/chat/${chatId}`)
  }

  return (
    <div className="max-w-[570px] mx-auto px-4">
      <motion.div
        className="flex flex-wrap gap-2 overflow-visible"
        layout
        transition={transitionProps}
      >
        {aiCapabilities.map((capability) => {
          const isSelected = selected.includes(capability)
          return (
            <motion.button
              key={capability}
              onClick={() => handleTagClick(capability)}
              layout
              initial={false}
              transition={{
                ...transitionProps,
                backgroundColor: { duration: 0.1 },
              }}
              className={cn(
                "inline-flex items-center px-4 py-2 rounded-full border hover:text-primary hover:bg-secondary",
                "whitespace-nowrap overflow-hidden cursor-pointer",
                isSelected
                  ? "bg-primary-foreground text-primary"
                  : "text-muted-foreground"
              )}
            >
              <motion.div
                className="relative flex items-center"
                animate={{
                  width: isSelected ? "auto" : "100%",
                  paddingRight: isSelected ? "1.5rem" : "0",
                }}
                transition={{
                  ease: [0.175, 0.885, 0.32, 1.275],
                  duration: 0.3,
                }}
              >
                <span>{capability}</span>
              </motion.div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}