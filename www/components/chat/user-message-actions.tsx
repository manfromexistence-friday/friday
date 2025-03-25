import { Copy, Volume2, Edit, Download, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"

interface UserMessageProps {
  content: string
  onLike?: () => void
  onDislike?: () => void
  reactions?: {
    likes: number
    dislikes: number
  }
  className?: string
  // Keeping this prop for future text highlighting implementation
  onWordIndexUpdate?: (index: number) => void
}

export default function UserMessage({
  content,
  onLike,
  onDislike,
  reactions,
  className,
  onWordIndexUpdate
}: UserMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cleanup effect to stop audio and release resources
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
        URL.revokeObjectURL(audio.src)
        setAudio(null)
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [audio])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("Copied to clipboard")
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `friday-response-${new Date().toISOString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTextFromContainer = (): string => {
    // Get text from parent container that contains the rendered markdown
    // This gives us clean text without markdown syntax
    const parentElement = containerRef.current?.closest('.markdown-content')
    if (parentElement) {
      return (parentElement as HTMLElement).innerText || ''
    }
    
    // Fallback to cleaning markdown manually if we can't get innerText
    return content
      .replace(/[#]+/g, '')
      .replace(/[*_-]{1,}/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/[\n\r]/g, ' ')
      .trim()
  }

  const detectLanguage = (text: string): string => {
    if (/[áéíóúñ¿¡]/.test(text)) return 'es-MX'
    if (/[àâçéèêëîïôûùüÿœ]/.test(text)) return 'fr-FR'
    if (/[äöüß]/.test(text)) return 'de-DE'
    if (/[а-яА-Я]/.test(text)) return 'ru-RU'
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text) || /[\u4E00-\u9FFF]/.test(text)) return 'ja-JP'
    if (/[\u4E00-\u9FFF]/.test(text) && !/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'zh-CN'
    return 'en-US'
  }

  const fetchTTS = async (text: string) => {
    setIsLoading(true)
    try {
      console.log('Calling TTS API with text:', text.substring(0, 50) + '...');
      
      const response = await fetch('https://friday-backend.vercel.app/tts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ text }),
      })

      console.log('TTS API response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to fetch TTS audio';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If parsing JSON fails, try getting text
          errorMessage = await response.text() || errorMessage;
        }
        console.error('TTS API error:', errorMessage);
        throw new Error(errorMessage);
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      return audio
    } finally {
      setIsLoading(false)
    }
  }

  function formatToSingleLine(text: string): string {
    if (!text) return '';
    
    // Replace all newlines with spaces and remove extra whitespace
    return text
      .replace(/[\n\r]+/g, ' ')  // Replace newlines and carriage returns with spaces
      .replace(/\s+/g, ' ')      // Replace multiple spaces with a single space
      .trim();                   // Remove leading and trailing whitespace
  }

  const handleSpeech = async () => {
    if (isPlaying) {
      if (audio) {
        audio.pause()
        setAudio(null)
      } else if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
      setIsPlaying(false)
      return
    }

    if (isLoading) return;

    // Get clean text from the rendered content
    const plainText = getTextFromContainer();
    
    try {
      const newAudio = await fetchTTS(formatToSingleLine(plainText))
      setAudio(newAudio)
      newAudio.onended = () => {
        setIsPlaying(false)
        setAudio(null)
      }
      newAudio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Backend TTS error:', error)
      toast.error("Failed to generate speech from backend, using local synthesis")

      // Fallback to web speech API
      if (!window.speechSynthesis) {
        toast.error("Speech synthesis not supported in this browser")
        return
      }

      const detectedLang = detectLanguage(plainText)
      const voices = window.speechSynthesis.getVoices()
      const newUtterance = new SpeechSynthesisUtterance(plainText)
      newUtterance.lang = detectedLang

      const matchingVoice = voices.find(voice => voice.lang === detectedLang) || 
                           voices.find(voice => voice.lang.startsWith(detectedLang.split('-')[0]))
      if (matchingVoice) {
        newUtterance.voice = matchingVoice
      }

      // Text highlighting has been removed but could be re-implemented as follows:
      // 1. Split text into tokens using splitIntoTokens()
      // 2. Add onboundary event to track current word
      // 3. Calculate word index from character position
      // 4. Update state and call onWordIndexUpdate with current word index

      newUtterance.onend = () => {
        setIsPlaying(false)
      }
      
      window.speechSynthesis.speak(newUtterance)
      setIsPlaying(true)
    }
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "bg-background/95 flex max-h-10 items-center gap-0.5 rounded-lg border p-1.5 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <button
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <Edit className="size-3.5" />
      </button>

      <button
        onClick={handleCopy}
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <Copy className="size-3.5" />
      </button>

      <button
        onClick={handleSpeech}
        className={cn(
          "hover:bg-muted rounded-full p-1.5 transition-colors",
          isLoading && "animate-pulse opacity-50"
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="size-3.5">...</span>
        ) : isPlaying ? (
          <Play className="size-3.5" />
        ) : (
          <Volume2 className="size-3.5" />
        )}
      </button>

      <button
        onClick={handleDownload}
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <Download className="size-3.5" />
      </button>
    </motion.div>
  )
}