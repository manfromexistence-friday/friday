"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ImageIcon, MessagesSquare, Code2, FileText, Languages } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'

const aiCapabilities = [
  {
    id: "Images",
    icon: ImageIcon,
    prompt: "Generate an image of "
  },
  {
    id: "Chat",
    icon: MessagesSquare,
    prompt: "Let's have a conversation about "
  },
  {
    id: "Code",
    icon: Code2,
    prompt: "Write code for "
  },
  {
    id: "Summary",
    icon: FileText,
    prompt: "Summarize this: "
  },
  {
    id: "Translate",
    icon: Languages,
    prompt: "Translate this to English: "
  }
] as const

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
    
    // Find the capability object
    const selectedCapability = aiCapabilities.find(c => c.id === capability)
    if (!selectedCapability) return
    
    // Store the prompt in sessionStorage
    sessionStorage.setItem('initialPrompt', selectedCapability.prompt)
    
    // Navigate to new chat
    router.push(`/chat/${chatId}`)
  }

  return (
    <div className="mx-auto max-w-max px-4">
      <motion.div
        className="flex flex-wrap gap-2 overflow-visible"
        layout
        transition={transitionProps}
      >
        {aiCapabilities.map((capability) => {
          const isSelected = selected.includes(capability.id)
          const Icon = capability.icon
          
          return (
            <motion.button
              key={capability.id}
              onClick={() => handleTagClick(capability.id)}
              layout
              initial={false}
              transition={{
                ...transitionProps,
                backgroundColor: { duration: 0.1 },
              }}
              className={cn(
                "hover:text-primary hover:bg-secondary inline-flex items-center gap-2 rounded-full border px-4 py-2",
                "cursor-pointer overflow-hidden whitespace-nowrap",
                isSelected
                  ? "bg-primary-foreground text-primary"
                  : "text-muted-foreground"
              )}
            >
              <motion.div
                className="relative flex items-center gap-2"
                animate={{
                  width: isSelected ? "auto" : "100%",
                  paddingRight: isSelected ? "1.5rem" : "0",
                }}
                transition={{
                  ease: [0.175, 0.885, 0.32, 1.275],
                  duration: 0.3,
                }}
              >
                <Icon className="size-4" />
                <span>{capability.id}</span>
              </motion.div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}