import * as React from "react"
import { Copy, Volume2, Edit, Download, Play, Pause, Loader } from 'lucide-react'
import { useState, useEffect, useRef } from "react"
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
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
  onPlayStateChange?: (isPlaying: boolean, audio: HTMLAudioElement | null) => void
}

type TTSCache = {
  [key: string]: {
    audio: HTMLAudioElement;
    url: string;
    timestamp: number;
  }
};

type PlaybackProgress = {
  currentTime: number; // Playback position in seconds
};

const ttsAudioCache: TTSCache = {};

function createContentHash(content: string): string {
  const trimmedContent = content.substring(0, 100);
  let hash = 0;
  for (let i = 0; i < trimmedContent.length; i++) {
    const char = trimmedContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'tts_' + Math.abs(hash).toString(16);
}

export default function UserMessage({
  content,
  onLike,
  onDislike,
  reactions,
  className,
  onWordIndexUpdate,
  onPlayStateChange
}: UserMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentHash = useRef<string>(createContentHash(content));
  const isMounted = useRef(true);

  // Load playback progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
    if (savedProgress && currentAudio) {
      const progress: PlaybackProgress = JSON.parse(savedProgress);
      currentAudio.currentTime = progress.currentTime;
    }
  }, [currentAudio]);

  // Save playback progress to localStorage when audio is playing
  useEffect(() => {
    if (currentAudio && isPlaying) {
      const saveProgress = () => {
        const progress: PlaybackProgress = {
          currentTime: currentAudio.currentTime,
        };
        localStorage.setItem(`tts_progress_${contentHash.current}`, JSON.stringify(progress));
      };

      // Save progress every second while playing
      const interval = setInterval(saveProgress, 1000);
      return () => clearInterval(interval);
    }
  }, [currentAudio, isPlaying]);

  // Cleanup effect to stop audio and release resources
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;

      if (currentAudio) {
        currentAudio.pause();
      }

      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentAudio]);

  // Separate effect to handle play state changes on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        setTimeout(() => onPlayStateChange?.(false, null), 0);
      }
    };
  }, [isPlaying, onPlayStateChange]);

  // Cache cleanup
  useEffect(() => {
    const now = Date.now();
    const CACHE_TTL = 30 * 60 * 1000;
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
    a.download = `friday-message-${new Date().toISOString()}.txt`;
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

  const fetchTTS = async (text: string): Promise<HTMLAudioElement | null> => {
    if (!isMounted.current) {
      console.log(`Component unmounted, aborting fetch`);
      return null;
    }
    console.log(`Fetching TTS for text: ${text.substring(0, 50)}...`);
    setIsLoading(true);
    const cacheKey = `${contentHash.current}_${text.length}`;
    if (ttsAudioCache[cacheKey]) {
      console.log(`Using cached TTS audio`);
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
        throw new Error(errorData.error || `Failed to fetch TTS audio`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);

      if (isMounted.current) {
        ttsAudioCache[cacheKey] = {
          audio: newAudio,
          url: audioUrl,
          timestamp: Date.now()
        };
        console.log(`TTS audio fetched and cached`);
      }

      return newAudio;
    } catch (error: unknown) {
      console.error(`Error fetching TTS:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to fetch TTS: ${errorMessage}`);
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        console.log(`Loading state reset`);
      }
    }
  };

  const formatToSingleLine = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const playAudio = (audio: HTMLAudioElement) => {
    if (!isMounted.current) {
      console.log('Component unmounted, aborting playAudio');
      return;
    }

    setCurrentAudio(audio);
    setIsCompleted(false);

    // Set the playback position if resuming
    const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
    if (savedProgress) {
      const progress: PlaybackProgress = JSON.parse(savedProgress);
      if (progress.currentTime > 0) {
        audio.currentTime = progress.currentTime;
        console.log(`Resuming at ${progress.currentTime} seconds`);
      }
    }

    // Monitor playback progress
    audio.ontimeupdate = () => {
      if (!audio.duration || !isMounted.current) return;
      
      const progressData: PlaybackProgress = {
        currentTime: audio.currentTime
      };
      localStorage.setItem(`tts_progress_${contentHash.current}`, JSON.stringify(progressData));
    };

    audio.onended = () => {
      if (!isMounted.current) return;
      
      setCurrentAudio(null);
      setIsPlaying(false);
      setIsCompleted(true);
      onPlayStateChange?.(false, null);
      localStorage.removeItem(`tts_progress_${contentHash.current}`);
      console.log('Audio playback completed');
    };

    audio.onerror = (e) => {
      console.error(`Audio error:`, e);
      setCurrentAudio(null);
      setIsPlaying(false);
      setIsCompleted(true);
      onPlayStateChange?.(false, null);
      toast.error("Audio playback error occurred");
    };

    try {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          onPlayStateChange?.(true, audio);
        })
        .catch(err => {
          console.error(`Playback failed:`, err);
          toast.error("Failed to play audio through speaker");
          setCurrentAudio(null);
        });
    } catch (error) {
      console.error('Speaker playback error:', error);
      setCurrentAudio(null);
    }
  };

  const handleSpeech = async () => {
    if (!isMounted.current) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      setCurrentAudio(null);
      setIsCompleted(false);
      onPlayStateChange?.(false, null);
      return;
    }

    if (isLoading) return;

    try {
      const plainText = getTextFromContainer();
      if (!plainText) throw new Error("No text content available");

      // Get full text without chunking
      const text = plainText;
      setIsCompleted(false);

      setIsLoading(true);
      const audio = await fetchTTS(text);
      if (!audio) throw new Error("Failed to fetch audio");

      playAudio(audio);
    } catch (error) {
      console.error('TTS error:', error);
      toast.error("Failed to initiate audio playback");
      setIsLoading(false);

      if (!window.speechSynthesis || !isMounted.current) return;

      const plainText = getTextFromContainer();
      if (!plainText) return;

      const text = formatToSingleLine(plainText);
      const detectedLang = detectLanguage(plainText);
      const voices = window.speechSynthesis.getVoices();
      const newUtterance = new SpeechSynthesisUtterance(text);
      newUtterance.lang = detectedLang;

      const matchingVoice = voices.find(voice => voice.lang === detectedLang) ||
        voices.find(voice => voice.lang.startsWith(detectedLang.split('-')[0]));
      if (matchingVoice) newUtterance.voice = matchingVoice;

      newUtterance.onend = () => {
        if (isMounted.current) {
          setIsPlaying(false);
          setIsCompleted(true);
          onPlayStateChange?.(false, null);
        }
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
        "bg-background/95 flex max-h-10 items-center gap-0.5 rounded-lg border p-1.5 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <button className="hover:bg-muted rounded-full p-1.5 transition-colors">
        <Edit className="size-3.5" />
      </button>
      <button onClick={handleCopy} className="hover:bg-muted rounded-full p-1.5 transition-colors">
        <Copy className="size-3.5" />
      </button>
      <button
        onClick={handleSpeech}
        className={cn(
          "hover:bg-muted flex size-6 items-center justify-center rounded-full transition-colors",
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="size-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-3.5" />
        ) : isCompleted ? (
          <Play className="size-3.5" /> // Show play icon to restart completed audio
        ) : (
          <Volume2 className="size-[17px]" /> // Show speaker icon for initial playback
        )}
      </button>
      <button onClick={handleDownload} className="hover:bg-muted rounded-full p-1.5 transition-colors">
        <Download className="size-3.5" />
      </button>
    </motion.div>
  );
}