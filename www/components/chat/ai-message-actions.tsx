import * as React from "react";
import { Copy, ThumbsDown, ThumbsUp, Volume2, RotateCcw, Play, Pause, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { MoreActions } from "@/components/chat/chat-more-options";

interface AiMessageProps {
  content: string;
  onLike?: () => void;
  onDislike?: () => void;
  reactions?: {
    likes: number;
    dislikes: number;
  };
  className?: string;
  onWordIndexUpdate?: (index: number) => void;
  onPlayStateChange?: (isPlaying: boolean, audio: HTMLAudioElement | null) => void;
}

type TTSCache = {
  [key: string]: {
    audio: HTMLAudioElement;
    url: string;
    timestamp: number;
  };
};

type PlaybackProgress = {
  chunkIndex: number;
  currentTime: number;
};

const ttsAudioCache: TTSCache = {};

function createContentHash(content: string): string {
  const trimmedContent = content?.substring(0, 100) || '';
  let hash = 0;
  for (let i = 0; i < trimmedContent.length; i++) {
    const char = trimmedContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'tts_' + Math.abs(hash).toString(16);
}

function splitTextIntoChunks(text: string, maxLength = 500): string[] {
  if (!text || typeof text !== 'string') return [];
  return [text]; // Keeping it as a single chunk per your original adjustment
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [audioQueue, setAudioQueue] = useState<HTMLAudioElement[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [fetchedChunks, setFetchedChunks] = useState<(HTMLAudioElement | null)[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentHash = useRef<string>(createContentHash(content));
  const isMounted = useRef(true);
  const hasFetchedNext = useRef(false);

  const getTextFromContainer = useCallback((): string => {
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
  }, [content]);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
    if (savedProgress) {
      const progress: PlaybackProgress = JSON.parse(savedProgress);
      const plainText = getTextFromContainer();
      const text = formatToSingleLine(plainText);
      const textChunks = text.length > 500 ? splitTextIntoChunks(text, 500) : [text];
      if (progress.chunkIndex >= textChunks.length) {
        localStorage.removeItem(`tts_progress_${contentHash.current}`);
        setCurrentChunkIndex(0);
      } else {
        setCurrentChunkIndex(progress.chunkIndex);
      }
    }
  }, [content, getTextFromContainer]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (currentAudio) currentAudio.pause();
      audioQueue.forEach(audio => audio.pause());
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audioQueue, currentAudio]);

  useEffect(() => {
    return () => {
      if (isPlaying) {
        setTimeout(() => onPlayStateChange?.(false, null), 0);
      }
    };
  }, [isPlaying, onPlayStateChange]);

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
    a.download = `friday-response-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const detectLanguage = (text: string): string => {
    if (!text) return 'en-US';
    if (/[áéíóúñ¿¡]/.test(text)) return 'es-MX';
    if (/[àâçéèêëîïôûùüÿœ]/.test(text)) return 'fr-FR';
    if (/[äöüß]/.test(text)) return 'de-DE';
    if (/[а-яА-Я]/.test(text)) return 'ru-RU';
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text) || /[\u4E00-\u9FFF]/.test(text)) return 'ja-JP';
    if (/[\u4E00-\u9FFF]/.test(text) && !/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'zh-CN';
    return 'en-US';
  };

  const fetchTTS = async (text: string, chunkIndex: number): Promise<HTMLAudioElement | null> => {
    if (!isMounted.current || !text || typeof text !== 'string') return null;
    
    const cacheKey = `${contentHash.current}_${chunkIndex}_${text.length}`;
    if (ttsAudioCache[cacheKey]) {
      ttsAudioCache[cacheKey].timestamp = Date.now();
      return ttsAudioCache[cacheKey].audio;
    }

    try {
      setIsLoading(true);
      const response = await fetch('https://friday-backend.vercel.app/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
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
      }

      return newAudio;
    } catch (error) {
      console.error(`Error fetching TTS for chunk ${chunkIndex}:`, error);
      toast.error(`Failed to fetch audio for chunk ${chunkIndex}`);
      return null;
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const formatToSingleLine = (text: string): string => {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const playNextAudio = (initialAudio?: HTMLAudioElement) => {
    if (!isMounted.current) {
      console.log('Component unmounted, aborting playNextAudio');
      return;
    }

    const audioToPlay = initialAudio || audioQueue[0];
    if (!audioToPlay) {
      setIsPlaying(false);
      setCurrentAudio(null);
      setIsCompleted(true);
      onPlayStateChange?.(false, null);
      setIsLoading(false);
      localStorage.removeItem(`tts_progress_${contentHash.current}`);
      console.log('Audio queue empty, playback completed');
      return;
    }

    if (!initialAudio) {
      setAudioQueue(prev => prev.slice(1));
    }

    setCurrentAudio(audioToPlay);
    setCurrentChunkIndex(prev => initialAudio ? prev : prev + 1);
    setIsCompleted(false);

    hasFetchedNext.current = false;

    const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
    if (savedProgress) {
      const progress: PlaybackProgress = JSON.parse(savedProgress);
      if (progress.chunkIndex === currentChunkIndex && progress.currentTime > 0) {
        audioToPlay.currentTime = progress.currentTime;
      }
    }

    audioToPlay.ontimeupdate = () => {
      if (!audioToPlay.duration || !isMounted.current) return;
      
      const progress = audioToPlay.currentTime / audioToPlay.duration;
      if (progress >= 0.5 && !hasFetchedNext.current && currentChunkIndex + 1 < chunks.length) {
        hasFetchedNext.current = true;
        fetchNextChunk(currentChunkIndex + 1);
      }

      const progressData: PlaybackProgress = {
        chunkIndex: currentChunkIndex,
        currentTime: audioToPlay.currentTime
      };
      localStorage.setItem(`tts_progress_${contentHash.current}`, JSON.stringify(progressData));
    };

    audioToPlay.onended = () => {
      if (!isMounted.current) return;
      
      const progressData: PlaybackProgress = {
        chunkIndex: currentChunkIndex + 1,
        currentTime: 0
      };
      localStorage.setItem(`tts_progress_${contentHash.current}`, JSON.stringify(progressData));
      
      setCurrentAudio(null);
      
      if (audioQueue.length > 0) {
        playNextAudio();
      } else if (currentChunkIndex + 1 < chunks.length) {
        console.log(`Chunk ended but next chunk not in queue. Fetching chunk ${currentChunkIndex + 1}`);
        fetchNextChunk(currentChunkIndex + 1).then(() => {
          if (audioQueue.length > 0) {
            playNextAudio();
          } else {
            setIsPlaying(false);
            setIsCompleted(true);
            onPlayStateChange?.(false, null);
          }
        });
      } else {
        setIsPlaying(false);
        setIsCompleted(true);
        onPlayStateChange?.(false, null);
        localStorage.removeItem(`tts_progress_${contentHash.current}`);
        console.log('All audio playback completed');
      }
    };

    audioToPlay.onerror = (e) => {
      console.error(`Audio error in chunk ${currentChunkIndex}:`, e);
      setCurrentAudio(null);
      setIsPlaying(false);
      setIsCompleted(true);
      onPlayStateChange?.(false, null);
      toast.error("Audio playback error occurred");
    };

    try {
      audioToPlay.play()
        .then(() => {
          setIsPlaying(true);
          onPlayStateChange?.(true, audioToPlay);
        })
        .catch(err => {
          console.error(`Playback failed for chunk ${currentChunkIndex}:`, err);
          toast.error("Failed to play audio through speaker");
          setCurrentAudio(null);
          playNextAudio();
        });
    } catch (error) {
      console.error('Speaker playback error:', error);
      setCurrentAudio(null);
      playNextAudio();
    }
  };

  const fetchNextChunk = async (chunkIndex: number) => {
    if (chunkIndex >= chunks.length || fetchedChunks[chunkIndex]) {
      return;
    }

    try {
      setIsLoading(true);
      const audio = await fetchTTS(chunks[chunkIndex], chunkIndex);
      
      if (!audio || !isMounted.current) return;

      setFetchedChunks(prev => {
        const newFetched = [...prev];
        newFetched[chunkIndex] = audio;
        return newFetched;
      });

      setAudioQueue(prev => [...prev, audio]);
      console.log(`Added chunk ${chunkIndex} to queue (Queue length: ${audioQueue.length + 1})`);
    } catch (error) {
      console.error(`Failed to fetch chunk ${chunkIndex}:`, error);
      toast.error("Failed to load next audio segment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeech = async () => {
    if (!isMounted.current) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      setCurrentAudio(null);
      setAudioQueue([]); // Clear queue when stopping
      setIsCompleted(false);
      onPlayStateChange?.(false, null);
      return;
    }

    if (isLoading) return;

    try {
      const plainText = getTextFromContainer();
      if (!plainText) throw new Error("No text content available");

      const text = formatToSingleLine(plainText);
      const textChunks = [text]; // Single chunk
      setChunks(textChunks);
      setFetchedChunks(new Array(textChunks.length).fill(null));
      setIsCompleted(false);
      setCurrentChunkIndex(0); // Reset chunk index on new playback

      setIsLoading(true);
      const audio = await fetchTTS(textChunks[0], 0);
      if (!audio) throw new Error("Failed to fetch initial audio");

      setFetchedChunks(prev => {
        const newFetched = [...prev];
        newFetched[0] = audio;
        return newFetched;
      });

      playNextAudio(audio);
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

  const handleRegenerate = () => {
    console.log("Regenerate response");
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "bg-background/95 flex max-h-10 items-center gap-0.5 rounded-lg p-1.5 px-0 backdrop-blur-sm",
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
          "hover:bg-muted flex size-6 items-center justify-center rounded-full transition-colors",
          isLoading && "cursor-not-allowed opacity-50"
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="size-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Volume2 className="size-[17px]" /> // Always show Volume2 when not playing
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
        onClick={handleRegenerate}
        className="hover:bg-muted rounded-full p-1.5 transition-colors"
      >
        <RotateCcw className="size-3.5" />
      </button>

      <MoreActions content={content} />
    </motion.div>
  );
}