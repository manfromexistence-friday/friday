import { Copy, Volume2, Edit, Download, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as React from "react"
import { useState, useEffect } from "react"
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
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)

  // Cleanup effect to stop audio and release resources
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
        URL.revokeObjectURL(audio.src)
        setAudio(null)
      }
      if (window.speechSynthesis.speaking) {
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

  const getPlainTextFromMarkdown = (markdown: string) => {
    return markdown
      .replace(/[#]+/g, '')
      .replace(/[*_-]{1,}/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/[\n\r]/g, ' ')
      .trim()
  }

  const splitIntoTokens = (text: string) => {
    return text.match(/[a-zA-Z0-9']+|[^\s\w']+|\s+/g) || []
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
      const plainText = getPlainTextFromMarkdown(text) // Strip Markdown for TTS
      const response = await fetch('https://friday-backend.vercel.app/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plainText }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch TTS audio')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      return audio
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpeech = async () => {
    if (isPlaying) {
      if (audio) {
        audio.pause()
        setAudio(null)
      } else if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
      setIsPlaying(false)
      setCurrentWordIndex(-1)
      onWordIndexUpdate?.(-1)
      return
    }

    if (isLoading) return;

    try {
      const newAudio = await fetchTTS(content) // Pass content, stripped internally
      setAudio(newAudio)
      newAudio.onended = () => {
        setIsPlaying(false)
        setAudio(null)
        setCurrentWordIndex(-1)
        onWordIndexUpdate?.(-1)
      }
      newAudio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Backend TTS error:', error)
      toast.error("Failed to generate speech from backend, using local synthesis")

      if (!window.speechSynthesis) {
        toast.error("Speech synthesis not supported in this browser")
        return
      }

      const plainText = getPlainTextFromMarkdown(content)
      const tokens = splitIntoTokens(plainText)
      const detectedLang = detectLanguage(plainText)

      const voices = window.speechSynthesis.getVoices()
      const newUtterance = new SpeechSynthesisUtterance(plainText)
      newUtterance.lang = detectedLang

      const matchingVoice = voices.find(voice => voice.lang === detectedLang) || voices.find(voice => voice.lang.startsWith(detectedLang.split('-')[0]))
      if (matchingVoice) {
        newUtterance.voice = matchingVoice
      }

      newUtterance.onboundary = (event) => {
        if (event.name === 'word') {
          let cumulativeLength = 0
          let wordIndex = 0
          for (let i = 0; i < tokens.length; i++) {
            if (/[a-zA-Z0-9']+/.test(tokens[i])) {
              if (cumulativeLength <= event.charIndex && event.charIndex < cumulativeLength + tokens[i].length) {
                setCurrentWordIndex(wordIndex)
                onWordIndexUpdate?.(wordIndex)
                break
              }
              wordIndex++
            }
            cumulativeLength += tokens[i].length
          }
        }
      }
      newUtterance.onend = () => {
        setIsPlaying(false)
        setCurrentWordIndex(-1)
        onWordIndexUpdate?.(-1)
      }
      setUtterance(newUtterance)
      window.speechSynthesis.speak(newUtterance)
      setIsPlaying(true)
    }
  }

  return (
    <motion.div
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