import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChatState } from '@/types/chat'
import { Textarea } from '@/components/ui/textarea'
import { AnimatedPlaceholder } from '@/components/chat/animated-placeholder'
import { InputActions } from '@/components/chat/input-actions'
import { ImagePreview } from '@/components/chat/image-preview'
// Import the Zustand store
import { useAIModelStore } from '@/lib/store/ai-model-store'

export interface ChatInputProps {
  className?: string
  value: string
  chatState: ChatState
  setChatState?: React.Dispatch<React.SetStateAction<ChatState>>
  showSearch?: boolean
  showResearch?: boolean
  showThinking?: boolean
  imagePreview?: string | null
  inputHeight?: number
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onSubmit: () => void
  onChange: (value: string) => void
  onHeightChange?: (reset?: boolean) => void
  onImageChange?: (file: File | null) => void
  onSearchToggle?: () => void
  onResearchToggle?: () => void
  onThinkingToggle?: () => void
  // Remove these props since we're using Zustand
  // selectedAI?: string
  // onAIChange?: (model: string) => void
  onUrlAnalysis?: (urls: string[], prompt: string, type?: string) => void
  onImageGeneration?: (response: { text: string; image: string; model_used: string; file_path: string }) => void
}

interface ImagePreviewProps {
  imagePreview: string
  inputHeight: number
  onRemove: () => void
}

export function ChatInput({
  className,
  value,
  chatState,
  showSearch,
  showResearch,
  showThinking,
  imagePreview,
  inputHeight,
  textareaRef,
  onSubmit,
  onChange,
  onHeightChange,
  onImageChange,
  onSearchToggle,
  onResearchToggle,
  onThinkingToggle,
  // Remove selectedAI and onAIChange from props
  // selectedAI,
  // onAIChange,
  onUrlAnalysis,
  onImageGeneration,
}: ChatInputProps) {
  // Use the Zustand store directly
  const { currentModel } = useAIModelStore();

  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false)
  const [initialHeight, setInitialHeight] = React.useState(0)
  const [isMobileDevice, setIsMobileDevice] = React.useState(false)
  
  // Detect if device is mobile on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // Multiple checks for mobile detection
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const isMobileByUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrowScreen = window.innerWidth <= 768;
      
      // Consider a device mobile if it matches at least two conditions
      const mobileDetected = [isMobileByUA, isTouchScreen, isNarrowScreen].filter(Boolean).length >= 2;
      
      setIsMobileDevice(mobileDetected);
      console.log("Device detected as:", mobileDetected ? "mobile" : "desktop");
    }
  }, []);
  
  // Detect mobile keyboard
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setInitialHeight(window.innerHeight)
      
      const handleResize = () => {
        // If window height reduced significantly (by at least 25%), assume keyboard is open
        const heightDifference = initialHeight - window.innerHeight
        const heightChangePercentage = (heightDifference / initialHeight) * 100
        
        // Only trigger keyboard visibility on significant height changes (likely mobile keyboards)
        if (heightChangePercentage > 25) {
          setIsKeyboardVisible(true)
        } else {
          setIsKeyboardVisible(false)
        }
      }
      
      // Focus/blur detection for additional reliability
      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement
        if (target.id === 'ai-input') {
          // Only set keyboard visible for mobile devices
          if (isMobileDevice) {
            setTimeout(() => setIsKeyboardVisible(true), 100)
          }
        }
      }
      
      const handleBlur = () => {
        setTimeout(() => setIsKeyboardVisible(false), 100)
      }

      window.addEventListener('resize', handleResize)
      document.addEventListener('focusin', handleFocus)
      document.addEventListener('focusout', handleBlur)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        document.removeEventListener('focusin', handleFocus)
        document.removeEventListener('focusout', handleBlur)
      }
    }
  }, [initialHeight, isMobileDevice])
  
  // Dynamically apply positioning classes based on keyboard visibility AND device type
  const positioningClasses = React.useMemo(() => {
    // Only apply fixed positioning if both: mobile device AND keyboard visible
    return isMobileDevice && isKeyboardVisible 
      ? "fixed bottom-2" // Position at bottom when mobile keyboard is visible
      : "" // Default positioning for desktop/PC inputs
  }, [isKeyboardVisible, isMobileDevice])

  return (
    <div className={cn('w-[95%] rounded-2xl border shadow-xl xl:w-1/2', positioningClasses, className)}>
      {imagePreview && (
        <ImagePreview
          imagePreview={imagePreview}
          inputHeight={inputHeight || 0}
          onRemove={() => onImageChange && onImageChange(null)}
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
              'w-full resize-none rounded-2xl rounded-b-none border-none px-4 py-3 leading-[1.2] focus-visible:ring-0',
              chatState.isLoading && 'opacity-50'
            )}
            ref={textareaRef}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey && !chatState.isLoading) {
                e.preventDefault()
                if (value.trim()) {
                  onSubmit()
                }
              }
            }}
            onChange={(e) => {
              onChange(e.target.value)
              onHeightChange && onHeightChange()
            }}
          />
          {!value && (
            <div className="absolute left-4 top-3">
              <AnimatedPlaceholder showResearch={!!showResearch} showSearch={!!showSearch} showThinking={!!showThinking} />
            </div>
          )}
        </div>
        <InputActions
          isLoading={chatState.isLoading}
          showSearch={showSearch || false}
          showThinking={showThinking || false}
          showResearch={showResearch || false}
          value={value}
          // Use Zustand state directly
          selectedAI={currentModel}
          imagePreview={imagePreview || null}
          onSubmit={onSubmit}
          onSearchToggle={onSearchToggle || (() => {})}
          onResearchToggle={onResearchToggle || (() => {})}
          onThinkingToggle={onThinkingToggle || (() => {})}
          onImageUpload={(file: File | null) => onImageChange && onImageChange(file)}
          // onAIChange will be handled by InputActions directly via Zustand
          onUrlAnalysis={onUrlAnalysis}
          // onImageGeneration={onImageGeneration}
        />
      </div>
    </div>
  )
}