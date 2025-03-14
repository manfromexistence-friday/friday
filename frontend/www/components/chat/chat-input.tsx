import { cn } from "@/lib/utils"
import { ChatState } from "@/types/chat"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedPlaceholder } from "@/components/chat/animated-placeholder"
import { InputActions } from "@/components/chat/input-actions"
import { ImagePreview } from "@/components/chat/image-preview"

interface ChatInputProps {
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
}

export function ChatInput({
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
  onResearchToggle
}: ChatInputProps) {
  return (
    <div className="absolute bottom-2 left-1/2 z-20 w-1/2 translate-x-[-50%] rounded-2xl bg-transparent">
      {imagePreview && (
        <ImagePreview
          imagePreview={imagePreview}
          inputHeight={inputHeight}
          onRemove={() => onImageChange(null)}
        />
      )}
      <div className="w-full">
        <div className="bg-primary-foreground relative flex flex-col rounded-2xl border">
          <div className="relative">
            <Textarea
              id="ai-input"
              value={value}
              placeholder=""
              className={cn(
                "w-full resize-none rounded-2xl rounded-b-none border-none px-4 py-3 leading-[1.2] focus-visible:ring-0",
                chatState.isLoading && "opacity-50"
              )}
              ref={textareaRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSubmit()
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
            onSubmit={onSubmit}
            onSearchToggle={onSearchToggle}
            onResearchToggle={onResearchToggle}
            onImageUpload={(file: File) => onImageChange(file)}
          />
        </div>
      </div>
    </div>
  )
}