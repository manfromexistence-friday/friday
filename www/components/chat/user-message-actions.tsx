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
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [playbackPosition, setPlaybackPosition] = useState(0) // Store char index for resuming

  // Unique key for this message in localStorage
  const storageKey = `speech_${content.slice(0, 20)}` // Use first 20 chars as a unique ID

  useEffect(() => {
    // Load saved playback position on mount
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

  const handleSpeech = () => {
    if (!window.speechSynthesis) {
      toast.error("Speech synthesis not supported in this browser")
      return
    }

    // Stop any ongoing speech globally
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    if (isPlaying) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
      // Save current position (approximate from currentWordIndex)
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

    if (!utterance || !window.speechSynthesis.paused) {
      const newUtterance = new SpeechSynthesisUtterance(plainText)
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
        localStorage.removeItem(storageKey) // Clear position when finished
      }
      setUtterance(newUtterance)
      // Start from saved position if exists
      if (playbackPosition > 0) {
        newUtterance.text = plainText.slice(playbackPosition)
        // Adjust initial word index based on playback position
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
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        {isPlaying ? <Play className="size-3.5" /> : <Volume2 className="size-3.5" />}
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