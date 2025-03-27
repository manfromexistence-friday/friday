import { Copy, ThumbsDown, ThumbsUp, Volume2, RotateCcw, Play, Pause, Loader } from 'lucide-react'
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
  onWordIndexUpdate?: (index: number) => void
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

// Global cache for TTS audio
const ttsAudioCache: TTSCache = {};

// Helper function to create a hash from text content
function createContentHash(content: string): string {
  const trimmedContent = content.substring(0, 100);
  let hash = 0;
  for (let i = 0; i < trimmedContent.length; i++) {
    const char = trimmedContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'tts_' + Math.abs(hash).toString(16);
}

// Helper function to split text into chunks at sentence boundaries
function splitTextIntoChunks(text: string, maxLength = 1000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';
  sentences.forEach(sentence => {
    if (currentChunk.length + sentence.length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  });
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioQueue, setAudioQueue] = useState<HTMLAudioElement[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentHash = useRef<string>(createContentHash(content));

  // Cleanup effect to stop audio and release resources
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
      audioQueue.forEach(audio => audio.pause());
      setAudioQueue([]);
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentAudio, audioQueue]);

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
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `friday-response-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTextFromContainer = (): string => {
    const parentElement = containerRef.current?.closest('.markdown-content');
    if (parentElement) {
      return (parentElement as HTMLElement).innerText || '';
    }
    return content
      .replace(/[#]+/g, '')
      .replace(/[*_-]{1,}/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/[\n\r]/g, ' ')
      .trim();
  };

  const detectLanguage = (text: string): string => {
    if (/[áéíóúñ¿¡]/.test(text)) return 'es-MX';
    if (/[àâçéèêëîïôûùüÿœ]/.test(text)) return 'fr-FR';
    if (/[äöüß]/.test(text)) return 'de-DE';
    if (/[а-яА-Я]/.test(text)) return 'ru-RU';
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text) || /[\u4E00-\u9FFF]/.test(text)) return 'ja-JP';
    if (/[\u4E00-\u9FFF]/.test(text) && !/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'zh-CN';
    return 'en-US';
  };

  const fetchTTS = async (text: string) => {
    setIsLoading(true);
    const cacheKey = `${contentHash.current}_${text.length}`; // Unique key per chunk
    if (ttsAudioCache[cacheKey]) {
      console.log('Using cached TTS audio for chunk');
      ttsAudioCache[cacheKey].timestamp = Date.now();
      setIsLoading(false);
      return ttsAudioCache[cacheKey].audio;
    }

    try {
      const response = await fetch('https://friday-backend.vercel.app/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        throw new Error(errorData.error || 'Failed to fetch TTS audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);

      ttsAudioCache[cacheKey] = {
        audio: newAudio,
        url: audioUrl,
        timestamp: Date.now()
      };

      return newAudio;
    } finally {
      setIsLoading(false);
    }
  };

  const formatToSingleLine = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const playNextAudio = () => {
    if (audioQueue.length > 0) {
      const nextAudio = audioQueue[0];
      setCurrentAudio(nextAudio);
      setAudioQueue(prev => prev.slice(1));
      nextAudio.onended = () => {
        setCurrentAudio(null);
        playNextAudio();
      };
      nextAudio.play();
      setIsPlaying(true);
      onPlayStateChange?.(true, nextAudio);
    } else {
      setIsPlaying(false);
      setCurrentAudio(null);
      onPlayStateChange?.(false, null);
    }
  };

  const handleSpeech = async () => {
    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false, currentAudio);
      return;
    }

    if (isLoading) return;

    try {
      if (currentAudio && audioQueue.length > 0) {
        // Resume playback if paused
        currentAudio.play();
        setIsPlaying(true);
        onPlayStateChange?.(true, currentAudio);
        return;
      }

      const plainText = getTextFromContainer();
      const text = formatToSingleLine(plainText);
      const chunks = splitTextIntoChunks(text, 1000);

      setIsLoading(true);
      const audioElements = await Promise.all(chunks.map(chunk => fetchTTS(chunk)));

      setAudioQueue(audioElements);
      if (audioElements.length > 0) {
        playNextAudio();
      }
    } catch (error) {
      console.error('Backend TTS error:', error);
      toast.error("Failed to generate speech from backend, using local synthesis");

      if (!window.speechSynthesis) {
        toast.error("Speech synthesis not supported in this browser");
        return;
      }

      const plainText = getTextFromContainer();
      const text = formatToSingleLine(plainText);
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
        onPlayStateChange?.(false, null);
      };

      window.speechSynthesis.speak(newUtterance);
      setIsPlaying(true);
      onPlayStateChange?.(true, null);
    }
  };

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
          "hover:bg-muted rounded-full transition-colors flex items-center justify-center h-6 w-6",
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="size-3.5 animate-spin" />
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
          "hover:bg-muted flex items-center gap-1 rounded-full p Smaller1.5 transition-colors",
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

      <MoreActions content={content} />
    </motion.div>
  );
}