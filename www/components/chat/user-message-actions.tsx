import { Copy, Volume2, Edit, Download, Play, Pause } from 'lucide-react'
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

// Define a type for the LocalStorage TTS item
type TTSCacheItem = {
  url: string;
  contentHash: string;
  timestamp: number;
}

// Create a unique content hash for caching
// Helper function that safely creates a hash from any text content
function createContentHash(content: string): string {
  // First, make sure we're working with a reasonable length
  const trimmedContent = content.substring(0, 100);
  
  // Convert to a safe string using a simple hash function
  let hash = 0;
  for (let i = 0; i < trimmedContent.length; i++) {
    const char = trimmedContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Return as a positive hex string
  return 'tts_' + Math.abs(hash).toString(16);
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
  const [contentHash, setContentHash] = useState<string>('')
  const [currentTime, setCurrentTime] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate content hash on mount
  useEffect(() => {
    const hash = createContentHash(content)
    setContentHash(hash)
    
    // Try to load from cache on initial render
    const cachedItem = loadFromCache(hash)
    if (cachedItem) {
      const newAudio = new Audio(cachedItem.url)
      setAudio(newAudio)
      
      // Set up event listeners
      setupAudioListeners(newAudio)
    }
  }, [content])

  // Set up audio event listeners
  const setupAudioListeners = (audioElement: HTMLAudioElement) => {
    audioElement.onended = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    
    // Track current playback position
    audioElement.ontimeupdate = () => {
      setCurrentTime(audioElement.currentTime)
    }
  }

  // Save audio to cache
  const saveToCache = (hash: string, audioUrl: string) => {
    try {
      // First, clean old cache items
      cleanupOldCacheItems()
      
      // Then save the new item
      const cacheItem: TTSCacheItem = {
        url: audioUrl,
        contentHash: hash,
        timestamp: Date.now()
      }
      
      localStorage.setItem(`tts_cache_${hash}`, JSON.stringify(cacheItem))
      
      // Also maintain an index of all cached items
      const cachedItems = JSON.parse(localStorage.getItem('tts_cache_items') || '[]')
      if (!cachedItems.includes(hash)) {
        cachedItems.push(hash)
        localStorage.setItem('tts_cache_items', JSON.stringify(cachedItems))
      }
      
      console.log('Saved TTS audio to cache:', hash)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  // Load audio from cache
  const loadFromCache = (hash: string): TTSCacheItem | null => {
    try {
      const cachedItemJson = localStorage.getItem(`tts_cache_${hash}`)
      if (!cachedItemJson) return null
      
      const cachedItem: TTSCacheItem = JSON.parse(cachedItemJson)
      
      // Check if the cache item is not too old (24 hours)
      const MAX_CACHE_AGE = 24 * 60 * 60 * 1000 // 24 hours
      if (Date.now() - cachedItem.timestamp > MAX_CACHE_AGE) {
        // Remove old item
        localStorage.removeItem(`tts_cache_${hash}`)
        return null
      }
      
      console.log('Found cached TTS audio:', hash)
      return cachedItem
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return null
    }
  }

  // Clean up old cache items
  const cleanupOldCacheItems = () => {
    try {
      const cachedItems = JSON.parse(localStorage.getItem('tts_cache_items') || '[]')
      const MAX_CACHE_AGE = 24 * 60 * 60 * 1000 // 24 hours
      const MAX_CACHE_ITEMS = 20 // Maximum number of cached items
      
      // Remove old items
      const itemsToKeep: string[] = []
      
      for (const hash of cachedItems) {
        const cachedItemJson = localStorage.getItem(`tts_cache_${hash}`)
        if (!cachedItemJson) continue
        
        const cachedItem: TTSCacheItem = JSON.parse(cachedItemJson)
        
        if (Date.now() - cachedItem.timestamp > MAX_CACHE_AGE) {
          // Remove old item
          localStorage.removeItem(`tts_cache_${hash}`)
        } else {
          itemsToKeep.push(hash)
        }
      }
      
      // If we still have too many items, remove the oldest ones
      if (itemsToKeep.length > MAX_CACHE_ITEMS) {
        // Sort by timestamp (oldest first)
        const sortedItems = itemsToKeep.map(hash => {
          const item = JSON.parse(localStorage.getItem(`tts_cache_${hash}`) || '{}')
          return { hash, timestamp: item.timestamp || 0 }
        }).sort((a, b) => a.timestamp - b.timestamp)
        
        // Remove oldest items
        const itemsToRemove = sortedItems.slice(0, sortedItems.length - MAX_CACHE_ITEMS)
        for (const item of itemsToRemove) {
          localStorage.removeItem(`tts_cache_${item.hash}`)
          itemsToKeep.splice(itemsToKeep.indexOf(item.hash), 1)
        }
      }
      
      // Update the index
      localStorage.setItem('tts_cache_items', JSON.stringify(itemsToKeep))
    } catch (error) {
      console.error('Error cleaning cache:', error)
    }
  }

  // Cleanup effect to stop audio and release resources
  useEffect(() => {
    return () => {
      if (audio) {
        // Store current time before unmounting
        if (isPlaying) {
          localStorage.setItem(`tts_position_${contentHash}`, audio.currentTime.toString())
        }
        
        audio.pause()
        setIsPlaying(false)
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [audio, isPlaying, contentHash])

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

  function formatToSingleLine(text: string): string {
    if (!text) return '';
    
    // Replace all newlines with spaces and remove extra whitespace
    return text
      .replace(/[\n\r]+/g, ' ')  // Replace newlines and carriage returns with spaces
      .replace(/\s+/g, ' ')      // Replace multiple spaces with a single space
      .trim();                   // Remove leading and trailing whitespace
  }

  const fetchTTS = async (text: string) => {
    setIsLoading(true)
    try {
      // Check if we have a cached version
      const cachedItem = loadFromCache(contentHash)
      if (cachedItem) {
        console.log('Using cached TTS audio');
        const cachedAudio = new Audio(cachedItem.url);
        
        // Set up audio listeners
        setupAudioListeners(cachedAudio);
        
        // Try to restore previous playback position
        try {
          const savedPosition = localStorage.getItem(`tts_position_${contentHash}`);
          if (savedPosition) {
            cachedAudio.currentTime = parseFloat(savedPosition);
          }
        } catch (e) {
          console.error('Error setting playback position:', e);
        }
        
        return cachedAudio;
      }
      
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
      const newAudio = new Audio(audioUrl)
      
      // Save to cache
      saveToCache(contentHash, audioUrl)
      
      // Set up audio listeners
      setupAudioListeners(newAudio)
      
      return newAudio
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpeech = async () => {
    // If already playing, just pause
    if (isPlaying && audio) {
      // Save current position for later resuming
      localStorage.setItem(`tts_position_${contentHash}`, audio.currentTime.toString())
      audio.pause()
      setIsPlaying(false)
      return
    }
    
    // If we have an audio element but it's paused, just resume
    if (audio && !isPlaying) {
      // Try to restore previous position
      try {
        const savedPosition = localStorage.getItem(`tts_position_${contentHash}`)
        if (savedPosition) {
          audio.currentTime = parseFloat(savedPosition)
        }
      } catch (e) {
        console.error('Error setting playback position:', e)
      }
      
      audio.play()
      setIsPlaying(true)
      return
    }

    if (isLoading) return;

    // Get clean text from the rendered content
    const plainText = getTextFromContainer();
    const formattedText = formatToSingleLine(plainText);
    
    try {
      const newAudio = await fetchTTS(formattedText)
      setAudio(newAudio)
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

      const detectedLang = detectLanguage(formattedText)
      const voices = window.speechSynthesis.getVoices()
      const newUtterance = new SpeechSynthesisUtterance(formattedText)
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
          <Pause className="size-3.5" />
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