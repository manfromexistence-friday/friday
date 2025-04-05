import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChatState } from '@/types/chat'
import { Textarea } from '@/components/ui/textarea'
import { AnimatedPlaceholder } from '@/components/chat/animated-placeholder'
import { InputActions } from '@/components/chat/input-actions'
import { ImagePreview } from '@/components/chat/image-preview'
// Import the Zustand store
import { useAIModelStore } from '@/lib/store/ai-model-store'
// Import toast hook
import { useToast } from '@/hooks/use-toast'

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
  // Import toast hook at the top of the component
  const { toast } = useToast();

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

  // Add state to track if we have an active command
  const [activeCommand, setActiveCommand] = React.useState<string | null>(null);
  // Add this state to track the real content without the prefix
  const [contentWithoutPrefix, setContentWithoutPrefix] = React.useState("");

  // Add useEffect to load the active command from localStorage on component mount
  React.useEffect(() => {
    // Retrieve saved command from localStorage
    const savedCommand = localStorage.getItem('activeCommand');
    if (savedCommand) {
      setActiveCommand(savedCommand);
      
      // If we have a saved command, we should prepend it to the current value
      const prefixes = {
        'image-gen': "Image ",
        'thinking-mode': "Thinking ",
        'search-mode': "Search ",
        'research-mode': "Research ",
        'canvas-mode': "Canvas "
      };
      
      const prefix = prefixes[savedCommand as keyof typeof prefixes];
      if (prefix && !value.startsWith(prefix)) {
        onChange(prefix + value);
      }
    }
  }, []);

  // Function to handle inserting special text
  const handleInsertText = (text: string, type: string) => {
    setActiveCommand(type);
    // Save the active command to localStorage
    localStorage.setItem('activeCommand', type);
    
    onChange(text + " "); // Add a space after the command text
    setContentWithoutPrefix(""); // Reset the content
    
    // Focus the textarea after inserting
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };
  
  // Special handler for keydown events in the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Enter key for submission
    if (e.key === 'Enter' && !e.shiftKey && !chatState.isLoading) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
      }
      return;
    }
    
    // Special handling for backspace when at command text
    if (e.key === 'Backspace' && activeCommand) {
      // Define command text for each mode
      const commandTexts = {
        'image-gen': "Image ",
        'thinking-mode': "Thinking ",
        'search-mode': "Search ",
        'research-mode': "Research ",
        'canvas-mode': "Canvas "
      };
      
      const commandText = commandTexts[activeCommand as keyof typeof commandTexts];
      
      // Check if cursor is right after the command text
      if (value === commandText || (value.startsWith(commandText) && 
          textareaRef.current?.selectionStart === commandText.length)) {
        e.preventDefault();
        
        // Get the default model
        const defaultModel = "gemini-2.0-flash";
        
        // Show toast notification about reverting
        toast({
          title: `${commandText.trim()} Mode Disabled`,
          description: `Reverted to default AI model`,
          variant: "default",
        });
        
        // Remove the entire command
        onChange("");
        setActiveCommand(null);
      }
    }
  };

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
              chatState.isLoading && 'opacity-50',
              activeCommand && 'invisible-first-word'
            )}
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              onChange(e.target.value);
              onHeightChange && onHeightChange();
              
              // Store content without prefix
              const prefixes = {
                'image-gen': "Image ",
                'thinking-mode': "Thinking ",
                'search-mode': "Search ",
                'research-mode': "Research ",
                'canvas-mode': "Canvas "
              };
              
              if (activeCommand) {
                const prefix = prefixes[activeCommand as keyof typeof prefixes];
                if (e.target.value.startsWith(prefix)) {
                  setContentWithoutPrefix(e.target.value.substring(prefix.length));
                } else {
                  setActiveCommand(null);
                  // Remove from localStorage when command is gone
                  localStorage.removeItem('activeCommand');
                  setContentWithoutPrefix("");
                }
              }
              
              // Handle command prefix checking for all command types
              if (activeCommand === 'image-gen' && !e.target.value.startsWith("Image")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              } else if (activeCommand === 'thinking-mode' && !e.target.value.startsWith("Thinking")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              } else if (activeCommand === 'search-mode' && !e.target.value.startsWith("Search")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              } else if (activeCommand === 'research-mode' && !e.target.value.startsWith("Research")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              } else if (activeCommand === 'canvas-mode' && !e.target.value.startsWith("Canvas")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              }
            }}
            style={activeCommand ? {
              // Fix the WebkitMask values to correctly hide command text
              WebkitMask: `linear-gradient(to right, transparent ${
                activeCommand === 'image-gen' ? '56px' : 
                activeCommand === 'thinking-mode' ? '65px' : 
                activeCommand === 'search-mode' ? '53px' : 
                activeCommand === 'research-mode' ? '65px' : 
                activeCommand === 'canvas-mode' ? '50px' : '0px'
              }, black ${
                activeCommand === 'image-gen' ? '55px' :
                activeCommand === 'thinking-mode' ? '85px' :
                activeCommand === 'search-mode' ? '65px' :
                activeCommand === 'research-mode' ? '85px' :
                activeCommand === 'canvas-mode' ? '70px' : '0px'
              })`
            } : {}}
          />
          
          {/* Keep the positioning consistent for all indicators */}
          {activeCommand === 'image-gen' && value.startsWith("Image") && (
            <div 
              className="absolute left-2 top-[10.5px] pointer-events-none"
              style={{
                zIndex: 10,
                whiteSpace: 'pre'
              }}
            >
              <span className="text-blue-500 font-medium">Image</span>
              <span className="opacity-0">
                {value.substring(7)}
              </span>
            </div>
          )}
          
          {activeCommand === 'thinking-mode' && value.startsWith("Thinking") && (
            <div 
              className="absolute left-2 top-[10.5px] pointer-events-none"
              style={{
                zIndex: 10,
                whiteSpace: 'pre'
              }}
            >
              <span className="text-purple-500 font-medium">Thinking</span>
              <span className="opacity-0">
                {value.substring(0)}
              </span>
            </div>
          )}
          
          {activeCommand === 'search-mode' && value.startsWith("Search") && (
            <div 
              className="absolute left-2 top-[10.5px] pointer-events-none"
              style={{
                zIndex: 10,
                whiteSpace: 'pre'
              }}
            >
              <span className="text-green-500 font-medium">Search</span>
              <span className="opacity-0">
                {value.substring(7)}
              </span>
            </div>
          )}
          
          {activeCommand === 'research-mode' && value.startsWith("Research") && (
            <div 
              className="absolute left-2 top-[10.5px] pointer-events-none"
              style={{
                zIndex: 10,
                whiteSpace: 'pre'
              }}
            >
              <span className="text-amber-500 font-medium">Research</span>
              <span className="opacity-0">
                {value.substring(10)}
              </span>
            </div>
          )}
          
          {activeCommand === 'canvas-mode' && value.startsWith("Canvas") && (
            <div 
              className="absolute left-2 top-[10.5px] pointer-events-none"
              style={{
                zIndex: 10,
                whiteSpace: 'pre'
              }}
            >
              <span className="text-cyan-500 font-medium">Canvas</span>
              <span className="opacity-0">
                {value.substring(7)}
              </span>
            </div>
          )}
          
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
          onInsertText={handleInsertText}
        />
      </div>
    </div>
  )
}