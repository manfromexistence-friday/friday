import { Copy, ThumbsDown, ThumbsUp, Volume2, RotateCcw, Play, Pause } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as React from "react"
import { useState, useEffect, useRef } from "react"
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
  // Keeping this prop for future text highlighting implementation
  onWordIndexUpdate?: (index: number) => void
  // Add a new prop to communicate play state changes
  onPlayStateChange?: (isPlaying: boolean, audio: HTMLAudioElement | null) => void
}

// Define a type for caching TTS audio
type TTSCache = {
  [key: string]: {
    audio: HTMLAudioElement;
    url: string;
    timestamp: number;
  }
};

// Create a global cache for TTS audio
const ttsAudioCache: TTSCache = {};

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

export default function AiMessage({
  content,
  onLike,
  onDislike,
  reactions,
  className,
  onWordIndexUpdate,
  onPlayStateChange
}: AiMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Store content hash to use as cache key
  const contentHash = useRef<string>(createContentHash(content))

  // Cleanup effect to stop audio and release resources
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
        // Don't revoke the URL as we're caching it
        setAudio(null)
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [audio])

  // Cleanup old cache entries
  useEffect(() => {
    const now = Date.now();
    const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    
    Object.keys(ttsAudioCache).forEach(key => {
      if (now - ttsAudioCache[key].timestamp > CACHE_TTL) {
        URL.revokeObjectURL(ttsAudioCache[key].url);
        delete ttsAudioCache[key];
      }
    });
  }, []);

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
    
    // Check if we have this audio in cache
    const cacheKey = contentHash.current;
    if (ttsAudioCache[cacheKey]) {
      console.log('Using cached TTS audio');
      // Update the timestamp to keep this entry fresh
      ttsAudioCache[cacheKey].timestamp = Date.now();
      return ttsAudioCache[cacheKey].audio;
    }
    
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
      const newAudio = new Audio(audioUrl)
      
      // Set up audio listeners
      newAudio.onended = () => {
        setIsPlaying(false);
      };
      
      // Cache the audio for future use
      ttsAudioCache[cacheKey] = {
        audio: newAudio,
        url: audioUrl,
        timestamp: Date.now()
      };
      
      return newAudio;
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
    if (isPlaying && audio) {
      // If playing, pause 
      audio.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false, audio); // Notify parent component
      return;
    }

    if (isLoading) return;

    try {
      let audioElement = audio;
      
      // If we have audio but it's paused, just resume playback
      if (audioElement) {
        audioElement.play();
        setIsPlaying(true);
        onPlayStateChange?.(true, audioElement); // Notify parent component
        return;
      }
      
      // Get clean text from the rendered content
      const plainText = getTextFromContainer();
      const text = `${formatToSingleLine(plainText)}`;
      
      // Otherwise, get/fetch audio and play it
      audioElement = await fetchTTS(text);
      setAudio(audioElement);
      
      audioElement.onended = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false, null); // Notify parent when audio ends
        // Don't set audio to null so we can replay from the beginning
      };
      
      audioElement.play();
      setIsPlaying(true);
      onPlayStateChange?.(true, audioElement); // Notify parent component
    } catch (error) {
      console.error('Backend TTS error:', error)
      toast.error("Failed to generate speech from backend, using local synthesis")

      // Fallback to web speech API
      if (!window.speechSynthesis) {
        toast.error("Speech synthesis not supported in this browser")
        return
      }

      const plainText = getTextFromContainer();
      const text = `${formatToSingleLine(plainText)}`;
      const detectedLang = detectLanguage(plainText);
      const voices = window.speechSynthesis.getVoices();
      const newUtterance = new SpeechSynthesisUtterance(text);
      newUtterance.lang = detectedLang;

      const matchingVoice = voices.find(voice => voice.lang === detectedLang) ||
        voices.find(voice => voice.lang.startsWith(detectedLang.split('-')[0]));
      if (matchingVoice) {
        newUtterance.voice = matchingVoice;
      }

      newUtterance.onend = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false, null); // Notify parent when speech ends
      };

      window.speechSynthesis.speak(newUtterance);
      setIsPlaying(true);
      onPlayStateChange?.(true, null); // Notify parent (pass null for Web Speech API)
    }
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "bg-background/95 flex max-h-10 items-center gap-0.5 rounded-lg p-1.5 shadow-lg backdrop-blur-sm",
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

      <button
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <RotateCcw className="size-3.5" />
      </button>

      <MoreActions content={content} /> {/* Markdown content displayed here */}
    </motion.div>
  )
}