import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Sparkles, Play, Pause, Volume2, ImageIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { User as FirebaseUser } from 'firebase/auth'
import React, { useState, useEffect, useRef } from 'react'
import AiMessage from '@/components/chat/ai-message-actions'
import UserMessage from '@/components/chat/user-message-actions'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MarkdownPreview } from './markdown-preview'
import AnimatedGradientText from '@/components/ui/animated-gradient-text'
// import ImageGenerationDisplay from '@/components/image-display' // Import the new component
import ImageGen from '@/components/image-gen'

interface ChatMessageProps {
  message: Message
  chatId: string | null
  index: number
  className?: string
  isFadingOut?: boolean
  onTransitionEnd?: () => void
  selectedAI?: string // New prop to track the selected AI model
}

export function ChatMessage({
  message,
  chatId,
  index,
  className,
  isFadingOut,
  onTransitionEnd,
  selectedAI = "" // Default to empty string
}: ChatMessageProps) {
  const { user } = useAuth()
  const isAssistant = message.role === 'assistant'
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0 to 1 for progress
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const contentHash = useRef<string>('')

  const userImage = (user as FirebaseUser)?.photoURL
  const userName = (user as FirebaseUser)?.displayName
  const userEmail = (user as FirebaseUser)?.email
  const fallbackInitial = userName?.[0] || userEmail?.[0]?.toUpperCase() || 'U'


  // Add state to receive currentWordIndex from child components
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)

  // Check if we're using the image generation model
  const isImageGenerationModel = selectedAI === "gemini-2.0-flash-exp-image-generation";

  // alert(selectedAI)

  // Check if this is an image generation message specifically
  const isImageGenerationContent = message.content === "image_generation" ||
    (message.content.includes("image") && message.content.includes("generate"));

  // Callback to update currentWordIndex from UserMessage or AiMessage
  const handleWordIndexUpdate = (index: number) => {
    setCurrentWordIndex(index)
  }

  // Callback to update play state and audio reference from child components
  const handlePlayStateChange = (playing: boolean, audioElement: HTMLAudioElement | null = null) => {
    setIsPlaying(playing)
    if (audioElement) {
      setAudio(audioElement)
      audioRef.current = audioElement

      // Close popover when starting to play
      if (playing) {
        setIsPopoverOpen(false)

        // Set up progress tracking
        if (audioElement) {
          audioElement.ontimeupdate = () => {
            if (audioElement.duration) {
              setProgress(audioElement.currentTime / audioElement.duration)
            }
          }

          audioElement.onended = () => {
            setIsPlaying(false)
            setProgress(0)
          }
        }
      }
    }
  }

  // Handle play/pause from the circular progress button
  const handlePlayPauseClick = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // const imageGenPrompt = !isAssistant && message.content;
  // alert(isAssistant)

  return (
    <div className={cn('flex w-full', isAssistant ? 'justify-start' : 'justify-end', className)}>
      {!isAssistant && (
        <div className="flex w-full flex-row items-start justify-end gap-2">
          <div className="hover:bg-primary-foreground hover:text-primary relative flex items-center justify-center rounded-xl rounded-tr-none border p-2 font-mono text-sm">
            <MarkdownPreview content={message.content} currentWordIndex={currentWordIndex} />
          </div>

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger>
              <Avatar className="size-9">
                <AvatarImage src={userImage ?? undefined} alt={userName || userEmail || 'User'} />
                <AvatarFallback>{fallbackInitial}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent align="end" className="size-min w-min border-none p-0 shadow-none">
              <UserMessage
                content={message.content}
                reactions={message.reactions}
                onWordIndexUpdate={handleWordIndexUpdate}
                onPlayStateChange={handlePlayStateChange}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
      {isAssistant && (
        <div className="flex w-full flex-col items-start">
          <div
            className={cn(
              "hover:text-primary relative flex w-full items-center px-2 font-mono text-sm",
              { "fade-out": isFadingOut }
            )}
            onTransitionEnd={onTransitionEnd}
          >
            {message.content === 'thinking' ? (
              <div className="thinking-content">
                <AnimatedGradientText text="AI is thinking..." />
              </div>
            ) : isImageGenerationModel ? (
              <div className="flex gap-2 flex-col items-start">
                {/* <span className="text-primary font-medium flex flex-row gap-2 items-center">
                  <ImageIcon className="text-primary h-4 w-4" />
                  Image generation model is active
                </span> */}
                <ImageGen
                  message={message}
                />
              </div>
            )
              :
              (
                <MarkdownPreview content={message.content} currentWordIndex={currentWordIndex} />
              )
            }
          </div>
          <AiMessage
            content={message.content}
            reactions={message.reactions}
            onWordIndexUpdate={handleWordIndexUpdate}
            onPlayStateChange={handlePlayStateChange}
          />
        </div>
      )}
    </div>
  )
}