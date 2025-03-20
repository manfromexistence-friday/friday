"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from 'lucide-react'
import { cn } from "@/lib/utils"

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

export default function AICapabilitySelector() {
  const [selected, setSelected] = useState<string[]>([])

  const toggleCapability = (capability: string) => {
    setSelected((prev) =>
      prev.includes(capability) ? prev.filter((c) => c !== capability) : [...prev, capability]
    )
  }

  return (
      <div className="max-w-[570px] px-4 md:px-6">
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
                onClick={() => toggleCapability(capability)}
                layout
                initial={false}
                transition={{
                  ...transitionProps,
                  backgroundColor: { duration: 0.1 },
                }}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-full border hover:text-primary hover:bg-secondary",
                  "whitespace-nowrap overflow-hidden",
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
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={transitionProps}
                        className="absolute right-0"
                      >
                        <div className="w-4 h-4 rounded-full bg-background flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" strokeWidth={1.5} />
                        </div>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
  )
}