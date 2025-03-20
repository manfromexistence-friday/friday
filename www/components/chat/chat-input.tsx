import * as React from "react"
import { cn } from "@/lib/utils"
import { ChatState } from "@/types/chat"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedPlaceholder } from "@/components/chat/animated-placeholder"
import { InputActions } from "@/components/chat/input-actions"
import { ImagePreview } from "@/components/chat/image-preview"

interface ChatInputProps {
  className?: string
  value: string
  chatState: ChatState
  showSearch: boolean
  showResearch: boolean
  imagePreview: string | null
  inputHeight: number
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onSubmit: () => void
  onChange: (value: string) => void
  onHeightChange: () => void
  onImageChange: (file: File | null) => void
  onSearchToggle: () => void
  onResearchToggle: () => void
  setChatState: (state: React.SetStateAction<ChatState>) => void // Add this
  selectedAI: string
  onAIChange: (model: string) => void
}

export function ChatInput({
  className,
  value,
  chatState,
  showSearch,
  showResearch,
  imagePreview,
  inputHeight,
  textareaRef,
  onSubmit,
  onChange,
  onHeightChange,
  onImageChange,
  onSearchToggle,
  onResearchToggle,
  selectedAI,
  onAIChange
}: ChatInputProps) {
  return (
    <div className={cn("w-[95%] rounded-2xl border shadow-xl lg:w-1/2", className)}>
      {imagePreview && (
        <ImagePreview
          imagePreview={imagePreview}
          inputHeight={inputHeight}
          onRemove={() => onImageChange(null)}
        />
      )}
        <div className="bg-primary-foreground relative flex flex-col rounded-2xl">
          <div className="relative">
            <Textarea
              id="ai-input"
              value={value}
              placeholder=""
              disabled={chatState.isLoading}
              className={cn(
                "w-full resize-none rounded-2xl rounded-b-none border-b px-4 py-3 leading-[1.2] focus-visible:ring-0",
                chatState.isLoading && "opacity-50"
              )}
              ref={textareaRef}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey && !chatState.isLoading) {
                  e.preventDefault()
                  if (value.trim()) {
                    onSubmit()
                  }
                }
              }}
              onChange={(e) => {
                onChange(e.target.value)
                onHeightChange()
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
          <InputActions
            isLoading={chatState.isLoading}
            showSearch={showSearch}
            showResearch={showResearch}
            value={value}
            selectedAI={selectedAI}
            imagePreview={imagePreview}
            onSubmit={onSubmit}
            onSearchToggle={onSearchToggle}
            onResearchToggle={onResearchToggle}
            onImageUpload={(file: File | null) => onImageChange(file)}
            onAIChange={onAIChange}
          />
        </div>
    </div>
  )
}