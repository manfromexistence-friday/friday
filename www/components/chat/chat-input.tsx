import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChatState } from '@/types/chat'
import { Textarea } from '@/components/ui/textarea'
import { InputActions } from '@/components/chat/input-actions'
import { ImagePreview } from '@/components/chat/image-preview'
import { useAIModelStore } from '@/lib/store/ai-model-store'
import { useToast } from '@/hooks/use-toast'
import { motion, useAnimationControls } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Create a motion version of Textarea
const MotionTextarea = motion.create(Textarea);

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
  
  // Add state for message history navigation
  const [historyMessages, setHistoryMessages] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [tempValue, setTempValue] = React.useState("");
  
  // Extract user messages from chatState for history navigation
  React.useEffect(() => {
    if (chatState?.messages?.length > 0) {
      // Get all user messages
      const userMessages = chatState.messages
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content);
      
      // Only update if messages have changed
      if (JSON.stringify(userMessages) !== JSON.stringify(historyMessages)) {
        setHistoryMessages(userMessages);
      }
    }
  }, [chatState.messages, historyMessages]);
  
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
        'image-gen': "Image",
        'thinking-mode': "Thinking",
        'search-mode': "Search",
        'research-mode': "Research",
        'canvas-mode': "Canvas"
      };
      
      const prefix = prefixes[savedCommand as keyof typeof prefixes];
      if (prefix && !value.startsWith(prefix)) {
        onChange(`${prefix}: ${value}`);
      }
    }
  }, [onChange, value]);

  // Add this effect to monitor changes to value
  React.useEffect(() => {
    // If value is empty but we have an active command, restore the prefix
    if (value === "" && activeCommand) {
      const prefixes = {
        'image-gen': "Image",
        'thinking-mode': "Thinking",
        'search-mode': "Search",
        'research-mode': "Research",
        'canvas-mode': "Canvas"
      };
      
      const prefix = prefixes[activeCommand as keyof typeof prefixes];
      if (prefix) {
        // Small delay to ensure we don't interfere with other state updates
        setTimeout(() => {
          onChange(`${prefix}: `);
        }, 50);
      }
    }
  }, [value, activeCommand, onChange]);

  // Function to handle inserting special text
  const handleInsertText = (text: string, type: string) => {
    // If the text is empty, clear the input and reset the active command
    if (!text) {
      setActiveCommand(null);
      localStorage.removeItem('activeCommand');
      onChange("");
      return;
    }
    
    // Otherwise, set the active command and insert the text
    setActiveCommand(type);
    localStorage.setItem('activeCommand', type);
    
    // Add colon and space only if the text doesn't already end with a colon
    const newText = text.endsWith(':') ? text + " " : text;
    onChange(newText);
    
    // Focus the textarea after inserting and position cursor after the prefix
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
        
        // Position cursor after the prefix + colon + space
        const cursorPosition = newText.length;
        textareaRef.current.selectionStart = cursorPosition;
        textareaRef.current.selectionEnd = cursorPosition;
      }, 0);
    }
  };
  
  // Function to navigate message history
  const navigateHistory = (direction: 'up' | 'down'): void => {
    if (historyMessages.length === 0) return;
    
    // Store the current value before navigating if we're at the initial position
    if (historyIndex === -1 && direction === 'up') {
      setTempValue(value);
    }
    
    if (direction === 'up') {
      // Move up in history (older messages)
      if (historyIndex < historyMessages.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        onChange(historyMessages[historyMessages.length - 1 - newIndex]);
      }
    } else {
      // Move down in history (newer messages)
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        onChange(historyMessages[historyMessages.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        // Return to the original input before history navigation
        setHistoryIndex(-1);
        onChange(tempValue);
      }
    }
  };
  
  // Special handler for keydown events in the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.currentTarget.selectionStart || 0;
    const isAtStart = cursorPosition === 0;
    const isAtEnd = cursorPosition === value.length;
    
    // Handle up arrow key for history navigation when cursor is at the start
    if (e.key === 'ArrowUp' && isAtStart && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      navigateHistory('up');
      return;
    }
    
    // Handle down arrow key for history navigation when cursor is at the end
    if (e.key === 'ArrowDown' && isAtEnd && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      navigateHistory('down');
      return;
    }
    
    // Handle Enter key for submission
    if (e.key === 'Enter' && !e.shiftKey && !chatState.isLoading) {
      e.preventDefault();
      if (value.trim()) {
        // Store the current command before submission
        const currentCommand = activeCommand;
        
        // Reset message history navigation
        setHistoryIndex(-1);
        
        // If we have an active command, extract the content without the prefix
        if (activeCommand) {
          const prefixes = {
            'image-gen': "Image: ",
            'thinking-mode': "Thinking: ",
            'search-mode': "Search: ",
            'research-mode': "Research: ",
            'canvas-mode': "Canvas: "
          };
          
          const prefix = prefixes[activeCommand as keyof typeof prefixes];
          if (prefix && value.startsWith(prefix)) {
            // Extract content without prefix
            const contentWithoutPrefix = value.substring(prefix.length);
            
            // Temporarily modify the value to remove prefix
            const originalValue = value;
            onChange(contentWithoutPrefix);
            
            // Use setTimeout to ensure the state update happens before submission
            setTimeout(() => {
              // Submit without the prefix
              onSubmit();
              
              // Restore the original value with prefix immediately after
              setTimeout(() => {
                onChange(originalValue);
              }, 0);
            }, 0);
          } else {
            onSubmit();
          }
        } else {
          onSubmit();
        }
        
        // Keep current command active
        if (currentCommand) {
          localStorage.setItem('activeCommand', currentCommand);
        }
        return;
      }
    }
    
    // Special handling for backspace when at or within command text
    if (e.key === 'Backspace' && activeCommand) {
      const commandTexts = {
        'image-gen': "Image: ",
        'thinking-mode': "Thinking: ",
        'search-mode': "Search: ",
        'research-mode': "Research: ",
        'canvas-mode': "Canvas: ",
      };
      const commandText = commandTexts[activeCommand as keyof typeof commandTexts];
      const cursorPosition = textareaRef.current?.selectionStart ?? 0;

      // If the cursor is anywhere within (or exactly at the end of) the command prefix
      if (value.startsWith(commandText) && cursorPosition <= commandText.length) {
        e.preventDefault();
        toast({
          title: `${commandText.trim()} Mode Disabled`,
          description: `Reverted to default AI model`,
          variant: "default",
        });
        onChange("");
        setActiveCommand(null);
        localStorage.removeItem('activeCommand');
      }
    }
  };

  // Add a state to track textarea height
  const [textareaHeight, setTextareaHeight] = React.useState<number>(0);
  const controls = useAnimationControls();
  const minHeight = 60; // Define min height as a constant

  // Create an effect to handle textarea height adjustments
  React.useEffect(() => {
    if (textareaRef.current) {
      // First reset the height to ensure we get the correct scrollHeight
      textareaRef.current.style.height = `${minHeight}px`;
      
      // Get the scroll height of the textarea content
      const scrollHeight = textareaRef.current.scrollHeight;
      
      // Calculate target height (using min height if content is minimal)
      const targetHeight = value.length < 20 ? minHeight : Math.min(scrollHeight, 300);
      
      // Always update to ensure shrinking works correctly
      setTextareaHeight(targetHeight);
      
      // Animate to the new height
      controls.start({
        height: targetHeight,
        transition: { duration: 0.15 }
      });
      
      // Apply the height directly to ensure consistency
      textareaRef.current.style.height = `${targetHeight}px`;
    }
  }, [value, controls, minHeight, textareaRef]); // Add minHeight to dependency array

  // Add this effect to update indicator position on scroll
  React.useEffect(() => {
    if (textareaRef.current && activeCommand) {
      const textarea = textareaRef.current;
      
      // Function to force indicator to update position
      const handleScroll = () => {
        // Force a re-render to update the indicator position
        setTextareaHeight(prev => prev); // This is a trick to force re-render
      };
      
      textarea.addEventListener('scroll', handleScroll);
      return () => {
        textarea.removeEventListener('scroll', handleScroll);
      };
    }
  }, [activeCommand, textareaRef]);

  // Add state for scroll button visibility
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  
  // Add scroll to bottom function
  const scrollToBottom = React.useCallback(() => {
    // Find the message container and scroll it to the bottom
    const messageContainer = document.querySelector('.message-list-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight + 2000;
      setShowScrollButton(false);
    }
  }, []);
  
  // Add an effect to check if we need to show the scroll button
  React.useEffect(() => {
    const handleScroll = () => {
      const messageContainer = document.querySelector('.message-list-container');
      if (messageContainer) {
        const { scrollTop, scrollHeight, clientHeight } = messageContainer;
        const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!nearBottom);
      }
    };
    
    const messageContainer = document.querySelector('.message-list-container');
    if (messageContainer) {
      messageContainer.addEventListener('scroll', handleScroll);
      return () => messageContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className={cn('relative z-10 w-[95%] rounded-2xl border shadow-md xl:w-1/2 dark:shadow-none', positioningClasses, className)}>
      {/* Add the scroll-to-bottom button with absolute positioning and top-5 */}
      <Button
        onClick={scrollToBottom}
        className={cn(
          "absolute -top-12 left-1/2 size-12 -translate-x-1/2 rounded-full p-0 shadow-lg transition-all duration-300",
          showScrollButton ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
        )}
        size="icon"
        variant="outline"
      >
        <ChevronDown className="size-7" />
      </Button>
      
      {imagePreview && (
        <ImagePreview
          imagePreview={imagePreview}
          inputHeight={inputHeight || 0}
          onRemove={() => onImageChange && onImageChange(null)}
        />
      )}
      <div className="darK:bg-primary-foreground relative flex flex-col rounded-2xl">
        <div className="relative">
          <MotionTextarea
            id="ai-input"
            value={value}
            placeholder="Ask me anything..."
            disabled={chatState.isLoading}
            className={cn(
              'w-full resize-none rounded-2xl rounded-b-none border-none !py-3 px-4 leading-normal tracking-wider focus-visible:ring-0',
              chatState.isLoading && 'opacity-50',
              activeCommand && 'first-line-visible text-opacity-0' // Updated class
            )}
            ref={textareaRef}
            animate={controls}
            initial={{ height: minHeight }}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              onChange(e.target.value);
              onHeightChange && onHeightChange();
              
              // Store content without prefix
              const prefixes = {
                'image-gen': "Image: ",
                'thinking-mode': "Thinking: ",
                'search-mode': "Search: ",
                'research-mode': "Research: ",
                'canvas-mode': "Canvas: "
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
                  
                  // Call the appropriate toggle functions when command is removed
                  if (activeCommand === 'research-mode' && onResearchToggle) {
                    onResearchToggle();
                  } else if (activeCommand === 'thinking-mode' && onThinkingToggle) {
                    onThinkingToggle();
                  } else if (activeCommand === 'search-mode' && onSearchToggle) {
                    onSearchToggle();
                  }
                }
              }
              
              // Handle command prefix checking for all command types
              if (activeCommand === 'image-gen' && !e.target.value.startsWith("Image: ")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              } else if (activeCommand === 'thinking-mode' && !e.target.value.startsWith("Thinking: ")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              } else if (activeCommand === 'search-mode' && !e.target.value.startsWith("Search: ")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              } else if (activeCommand === 'research-mode' && !e.target.value.startsWith("Research: ")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              } else if (activeCommand === 'canvas-mode' && !e.target.value.startsWith("Canvas: ")) {
                setActiveCommand(null);
                localStorage.removeItem('activeCommand');
              }
              
              // Reset history navigation index when manually typing
              setHistoryIndex(-1);
            }}
            style={{
              minHeight: `${minHeight}px`,
              maxHeight: '300px',
              overflowY: 'auto',
              lineHeight: '1.5',
            }}
          />
        </div>
        <InputActions
          isLoading={chatState.isLoading}
          showSearch={showSearch || false}
          showThinking={showThinking || false}
          showResearch={showResearch || false}
          value={value}
          selectedAI={currentModel}
          imagePreview={imagePreview || null}
          onSubmit={onSubmit}
          onSearchToggle={onSearchToggle || (() => {})}
          onResearchToggle={onResearchToggle || (() => {})}
          onThinkingToggle={onThinkingToggle || (() => {})}
          onImageUpload={(file: File | null) => onImageChange && onImageChange(file)}
          onUrlAnalysis={onUrlAnalysis}
          onInsertText={handleInsertText}
        />
      </div>
    </div>
  )
}

