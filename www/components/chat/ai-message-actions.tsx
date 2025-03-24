import { Copy, ThumbsDown, ThumbsUp, Volume2, RotateCcw, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { MoreActions } from "@/components/chat/chat-more-options"

interface AiMessageProps {
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

export default function AiMessage({
  content,
  onLike,
  onDislike,
  reactions,
  className,
  onWordIndexUpdate
}: AiMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [playbackPosition, setPlaybackPosition] = useState(0)

  const storageKey = `speech_${content.slice(0, 20)}`

  useEffect(() => {
    const savedPosition = localStorage.getItem(storageKey)
    if (savedPosition) {
      setPlaybackPosition(parseInt(savedPosition, 10))
    }
  }, [storageKey])

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
    if (/[áéíóúñ¿¡]/.test(text)) return 'es-MX' // Spanish (Mexico)
    if (/[àâçéèêëîïôûùüÿœ]/.test(text)) return 'fr-FR' // French
    if (/[äöüß]/.test(text)) return 'de-DE' // German
    if (/[а-яА-Я]/.test(text)) return 'ru-RU' // Russian
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text) || /[\u4E00-\u9FFF]/.test(text)) return 'ja-JP' // Japanese (also catches some Chinese)
    if (/[\u4E00-\u9FFF]/.test(text) && !/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'zh-CN' // Chinese (Simplified)
    return 'en-US' // Default to English
  }

  const handleSpeech = () => {
    if (!window.speechSynthesis) {
      toast.error("Speech synthesis not supported in this browser")
      return
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    if (isPlaying) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
      const tokens = splitIntoTokens(getPlainTextFromMarkdown(content))
      let charIndex = 0
      for (let i = 0; i < tokens.length; i++) {
        if (/[a-zA-Z0-9']+/.test(tokens[i]) && currentWordIndex === i) {
          break
        }
        charIndex += tokens[i].length
      }
      setPlaybackPosition(charIndex)
      localStorage.setItem(storageKey, charIndex.toString())
      return
    }

    const plainText = getPlainTextFromMarkdown(content)
    const tokens = splitIntoTokens(plainText)
    const detectedLang = detectLanguage(plainText)

    const voices = window.speechSynthesis.getVoices()
    console.log('Available voices:', voices)

    if (!utterance || !window.speechSynthesis.paused) {
      const newUtterance = new SpeechSynthesisUtterance(plainText)
      newUtterance.lang = detectedLang

      const matchingVoice = voices.find(voice => voice.lang === detectedLang) || voices.find(voice => voice.lang.startsWith(detectedLang.split('-')[0]))
      if (matchingVoice) {
        newUtterance.voice = matchingVoice
        console.log(`Selected voice: ${matchingVoice.name} (${matchingVoice.lang})`)
      } else {
        console.warn(`No voice found for language: ${detectedLang}, using default`)
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
        setPlaybackPosition(0)
        localStorage.removeItem(storageKey)
      }
      setUtterance(newUtterance)
      if (playbackPosition > 0) {
        newUtterance.text = plainText.slice(playbackPosition)
        let cumulativeLength = 0
        let wordIndex = 0
        for (let i = 0; i < tokens.length; i++) {
          if (/[a-zA-Z0-9']+/.test(tokens[i])) {
            if (cumulativeLength >= playbackPosition) {
              setCurrentWordIndex(wordIndex)
              onWordIndexUpdate?.(wordIndex)
              break
            }
            wordIndex++
          }
          cumulativeLength += tokens[i].length
        }
      }
      window.speechSynthesis.speak(newUtterance)
    } else {
      window.speechSynthesis.resume()
    }
    setIsPlaying(true)
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
        onClick={handleCopy}
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <Copy className="size-3.5" />
      </button>

      <button
        onClick={handleSpeech}
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        {isPlaying ? <Play className="size-3.5" /> : <Volume2 className="size-3.5" />}
      </button>

      <button
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <RotateCcw className="size-3.5" />
      </button>

      <button
        onClick={onLike}
        className={cn(
          "hover:bg-muted flex items-center gap-1 rounded-full p-1.5 transition-colors",
          reactions?.likes && "text-primary"
        )}
      >
        <ThumbsUp className="size-3.5" />
        {reactions?.likes && reactions.likes > 0 && (
          <span className="text-xs tabular-nums">{reactions.likes}</span>
        )}
      </button>

      <button
        onClick={onDislike}
        className={cn(
          "hover:bg-muted flex items-center gap-1 rounded-full p-1.5 transition-colors",
          reactions?.dislikes && "text-destructive"
        )}
      >
        <ThumbsDown className="size-3.5" />
        {reactions?.dislikes && reactions.dislikes > 0 && (
          <span className="text-xs tabular-nums">{reactions.dislikes}</span>
        )}
      </button>

      <MoreActions content={content} />
    </motion.div>
  )
}