"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useCallback, useRef } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { CircleDotDashed, Globe, Paperclip, Plus, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const AnimatedPlaceholder = ({
  showSearch,
  showResearch,
}: {
  showSearch: boolean
  showResearch: boolean
}) => (
  <AnimatePresence mode="wait">
    <motion.p
      key={showSearch ? "search" : "ask"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.1 }}
      className="text-muted-foreground pointer-events-none absolute w-[150px] text-sm"
    >
      {showSearch
        ? "Search the web..."
        : showResearch
        ? "Show Thinking..."
        : "Ask Friday..."}
    </motion.p>
  </AnimatePresence>
)

export default function AiInput() {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })
  const [showSearch, setShowSearch] = useState(false)
  const [showResearch, setShowReSearch] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handelClose = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input
    }
    setImagePreview(null) // Use null instead of empty string
  }

  // Removed empty interface FileChangeEvent as it is equivalent to React.ChangeEvent<HTMLInputElement>

  const handelChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file: File | null = e.target.files ? e.target.files[0] : null
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = () => {
    setValue("")
    adjustHeight(true)
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])
  return (
    <div className="fixed bottom-0 w-full py-4">
      <div className="relative mx-auto w-full max-w-xl rounded-[22px] p-1">
        <div className="bg-primary-foreground relative flex flex-col rounded-2xl border">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          >
            <div className="relative">
              <Textarea
                id="ai-input"
                value={value}
                placeholder=""
                className="w-full resize-none rounded-2xl rounded-b-none border-none px-4 py-3 leading-[1.2] focus-visible:ring-0 "
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                onChange={(e) => {
                  setValue(e.target.value)
                  adjustHeight()
                }}
              />
              {!value && (
                <div className="absolute left-4 top-3">
                  <AnimatedPlaceholder
                    showResearch={showResearch}
                    showSearch={showSearch}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="h-12 rounded-b-xl">
            <div className="absolute bottom-3 left-3 flex items-center gap-1">
              <label
                className={cn(
                  "relative cursor-pointer rounded-full p-2",
                  imagePreview
                    ? "bg-background text-primary border"
                    : "text-muted-foreground"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handelChange}
                  className="hidden"
                />
                <Paperclip
                  className={cn(
                    "text-muted-foreground hover:text-primary h-4 w-4 transition-colors",
                    imagePreview && "text-primary"
                  )}
                />
                {imagePreview && (
                  <div className="absolute bottom-[105px] left-0 h-[50px] w-[50px]">
                    <Image
                      className="rounded-lg object-cover"
                      src={imagePreview || "/picture1.jpeg"}
                      height={500}
                      width={500}
                      alt="additional image"
                    />
                    <button
                      onClick={handelClose}
                      className="shadow-3xl absolute -left-2 -top-2 rotate-45 rounded-lg"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  </div>
                )}
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(!showSearch)
                }}
                className={cn(
                  "flex h-8 items-center gap-1 rounded-full border px-2 py-0.5 transition-all",
                  showSearch
                    ? "bg-background text-muted-foreground hover:text-primary border"
                    : "border-transparent"
                )}
              >
                <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 180 : 0,
                      scale: showSearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showSearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Globe
                      className={cn(
                        "text-muted-foreground hover:text-primary h-4 w-4",
                        showSearch ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReSearch(!showResearch)
                }}
                className={cn(
                  "flex h-8 items-center gap-2 rounded-full border px-1.5 py-1 transition-all",
                  showResearch
                    ? "bg-background text-muted-foreground hover:text-primary border"
                    : "border-transparent"
                )}
              >
                <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: showResearch ? 180 : 0,
                      scale: showResearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showResearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <CircleDotDashed
                      className={cn(
                        "text-muted-foreground hover:text-primary h-4 w-4",
                        showResearch ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showResearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
                    >
                      Research
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute bottom-3 right-3">
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "text-muted-foreground hover:text-primary rounded-full p-2 transition-colors",
                  value ? " text-primary" : " text-muted-foreground    "
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
