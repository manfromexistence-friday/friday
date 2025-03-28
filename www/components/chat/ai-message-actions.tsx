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

type TTSCache = {
  [key: string]: {
    audio: HTMLAudioElement;
    url: string;
    timestamp: number;
  }
};

type PlaybackProgress = {
  chunkIndex: number;
  currentTime: number; // Playback position in seconds
};

const ttsAudioCache: TTSCache = {};

function createContentHash(content: string): string {
  const trimmedContent = content?.substring(0, 100) || '';
  let hash = 0;
  for (let i = 0; i < trimmedContent.length; i++) {
    const char = trimmedContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'tts_' + Math.abs(hash).toString(16);
}

function splitTextIntoChunks(text: string, maxLength = 500): string[] {
  if (!text || typeof text !== 'string') return [];
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
  const [chunks, setChunks] = useState<string[]>([]);
  const [fetchedChunks, setFetchedChunks] = useState<(HTMLAudioElement | null)[]>([]); // Track fetched audio for each chunk
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0); // Track the current chunk being played
  const containerRef = useRef<HTMLDivElement>(null);
  const contentHash = useRef<string>(createContentHash(content));
  const isMounted = useRef(true);
  const isFetching = useRef(false); // To prevent multiple fetch operations
  const hasFetchedNext = useRef(false); // To prevent fetching the next chunk multiple times

  // Log the content prop for debugging
  useEffect(() => {
    console.log('AiMessage content:', content);
  }, [content]);

  // Load playback progress from localStorage on mount and validate it
  useEffect(() => {
    const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
    if (savedProgress) {
      const progress: PlaybackProgress = JSON.parse(savedProgress);
      // Validate chunkIndex against the current content
      const plainText = getTextFromContainer();
      const text = formatToSingleLine(plainText);
      const textChunks = text.length > 500 ? splitTextIntoChunks(text, 500) : [text];
      if (progress.chunkIndex >= textChunks.length) {
        // If the saved chunkIndex is out of bounds, reset it
        localStorage.removeItem(`tts_progress_${contentHash.current}`);
        setCurrentChunkIndex(0);
      } else {
        setCurrentChunkIndex(progress.chunkIndex);
      }
    }
  }, [content]); // Re-run if content changes

  // Save playback progress to localStorage whenever currentChunkIndex or currentAudio's currentTime changes
  useEffect(() => {
    if (currentAudio && isPlaying) {
      const saveProgress = () => {
        const progress: PlaybackProgress = {
          chunkIndex: currentChunkIndex,
          currentTime: currentAudio.currentTime,
        };
        localStorage.setItem(`tts_progress_${contentHash.current}`, JSON.stringify(progress));
      };

      // Save progress every second while playing
      const interval = setInterval(saveProgress, 1000);
      return () => clearInterval(interval);
    }
  }, [currentAudio, isPlaying, currentChunkIndex]);

  // Cleanup effect to stop audio and release resources
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;

      if (currentAudio) {
        currentAudio.pause();
      }

      audioQueue.forEach(audio => audio.pause());

      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []); // Empty dependency array means this only runs on mount/unmount

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
    a.download = `friday-response-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTextFromContainer = (): string => {
    const parentElement = containerRef.current?.closest('.markdown-content');
    if (parentElement) {
      const text = (parentElement as HTMLElement).innerText || '';
      console.log('Text from container:', text);
      return text;
    }
    const cleanedContent = content
      .replace(/[#]+/g, '')
      .replace(/[*_-]{1,}/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/[\n\r]/g, ' ')
      .trim();
    console.log('Cleaned content:', cleanedContent);
    return cleanedContent;
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
    if (!isMounted.current) {
      console.log(`Component unmounted, aborting fetch for chunk ${chunkIndex}`);
      return null;
    }
    if (!text || typeof text !== 'string') {
      console.error(`Invalid text for chunk ${chunkIndex}: ${text}`);
      toast.error(`Invalid text for TTS in chunk ${chunkIndex}`);
      return null;
    }
    console.log(`Fetching TTS for chunk ${chunkIndex}: ${text.substring(0, 50)}...`);
    setIsLoading(true);
    const cacheKey = `${contentHash.current}_${chunkIndex}_${text.length}`;
    if (ttsAudioCache[cacheKey]) {
      console.log(`Using cached TTS audio for chunk ${chunkIndex}`);
      ttsAudioCache[cacheKey].timestamp = Date.now();
      setIsLoading(false);
      return ttsAudioCache[cacheKey].audio;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout after 8 seconds

      const response = await fetch('https://friday-backend.vercel.app/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        throw new Error(errorData.error || `Failed to fetch TTS audio for chunk ${chunkIndex}`);
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
        console.log(`TTS audio fetched and cached for chunk ${chunkIndex}`);
      }

      return newAudio;
    } catch (error: unknown) {
      console.error(`Error fetching TTS for chunk ${chunkIndex}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to fetch TTS for chunk ${chunkIndex}: ${errorMessage}`);
      return null;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        console.log(`Loading state reset for chunk ${chunkIndex}`);
      }
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

    // Use the initialAudio if provided (for the first chunk), otherwise use the queue
    const audioToPlay = initialAudio || audioQueue[0];
    if (!audioToPlay) {
      setIsPlaying(false);
      setCurrentAudio(null);
      onPlayStateChange?.(false, null);
      setIsLoading(false);
      console.log('Audio queue empty, playback stopped');
      return;
    }

    // If using the queue, remove the first item
    if (!initialAudio) {
      setAudioQueue(prev => prev.slice(1));
    }

    setCurrentAudio(audioToPlay);
    setCurrentChunkIndex(prev => prev + 1);

    // Reset the hasFetchedNext flag for the new chunk
    hasFetchedNext.current = false;

    // Set the playback position if resuming
    const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
    if (savedProgress) {
      const progress: PlaybackProgress = JSON.parse(savedProgress);
      if (progress.chunkIndex === currentChunkIndex && progress.currentTime > 0) {
        audioToPlay.currentTime = progress.currentTime;
        console.log(`Resuming chunk ${currentChunkIndex} at ${progress.currentTime} seconds`);
      }
    }

    // Monitor playback progress to fetch the next chunk at 50%
    audioToPlay.ontimeupdate = () => {
      if (!audioToPlay.duration || !isFetching.current) return;
      const progress = (audioToPlay.currentTime / audioToPlay.duration) * 100;
      if (progress >= 50 && !hasFetchedNext.current && currentChunkIndex + 1 < chunks.length) {
        hasFetchedNext.current = true;
        console.log(`50% of chunk ${currentChunkIndex} played, fetching next chunk`);
        fetchNextChunk(currentChunkIndex + 1);
      }
    };

    audioToPlay.onended = () => {
      if (isMounted.current) {
        setCurrentAudio(null);
        // Clear the currentTime in localStorage when the chunk ends
        const progress: PlaybackProgress = {
          chunkIndex: currentChunkIndex + 1,
          currentTime: 0,
        };
        localStorage.setItem(`tts_progress_${contentHash.current}`, JSON.stringify(progress));
        console.log(`Chunk ${currentChunkIndex} ended, moving to next chunk`);
        playNextAudio();
      }
    };

    audioToPlay.onerror = () => {
      console.error(`Error playing audio chunk ${currentChunkIndex}`);
      setCurrentAudio(null);
      playNextAudio(); // Continue with the next chunk
    };

    console.log(`Playing chunk ${currentChunkIndex}`);
    audioToPlay.play().catch(err => {
      console.error(`Playback error for chunk ${currentChunkIndex}:`, err);
      toast.error(`Failed to play audio for chunk ${currentChunkIndex}: ${err.message}`);
      setCurrentAudio(null);
      playNextAudio(); // Continue with the next chunk on error
    });

    setIsPlaying(true);
    onPlayStateChange?.(true, audioToPlay);
  };

  const fetchNextChunk = async (chunkIndex: number) => {
    if (chunkIndex >= chunks.length || fetchedChunks[chunkIndex]) {
      console.log(`Chunk ${chunkIndex} already fetched or out of bounds`);
      return;
    }

    setIsLoading(true);
    const audio = await fetchTTS(chunks[chunkIndex], chunkIndex);
    setFetchedChunks(prev => {
      const newFetched = [...prev];
      newFetched[chunkIndex] = audio;
      return newFetched;
    });

    if (audio && isFetching.current) {
      setAudioQueue(prev => [...prev, audio]);
      console.log(`Chunk ${chunkIndex} added to audio queue`);
    }
    setIsLoading(false);
  };

  const handleSpeech = async () => {
    if (!isMounted.current) {
      console.log('Component unmounted, aborting handleSpeech');
      return;
    }

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false, currentAudio);
      isFetching.current = false; // Stop any ongoing fetching
      setAudioQueue([]); // Clear the queue
      hasFetchedNext.current = false; // Reset fetch flag
      console.log('Paused playback');
      return;
    }

    if (isLoading || isFetching.current) {
      console.log('Already loading or fetching, aborting handleSpeech');
      return;
    }

    try {
      if (currentAudio && audioQueue.length > 0) {
        // Resume playback if paused
        currentAudio.play();
        setIsPlaying(true);
        onPlayStateChange?.(true, currentAudio);
        console.log('Resumed playback');
        return;
      }

      // Get and validate the text
      const plainText = getTextFromContainer();
      if (!plainText) {
        throw new Error("No text content available to process");
      }
      const text = formatToSingleLine(plainText);
      if (!text) {
        throw new Error("Formatted text is empty");
      }

      // Decide whether to chunk the text
      let textChunks: string[];
      if (text.length > 500) {
        // For large texts, split into chunks
        textChunks = splitTextIntoChunks(text, 500);
        if (textChunks.length === 0) {
          throw new Error("No valid text chunks to process");
        }
      } else {
        // For small texts, use the entire text as a single chunk
        textChunks = [text];
      }

      setChunks(textChunks);
      setFetchedChunks(new Array(textChunks.length).fill(null)); // Initialize fetched chunks array
      console.log(`Text processed into ${textChunks.length} chunks`);

      // Determine the starting chunk index
      let startIndex = 0;
      const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
      if (savedProgress) {
        const progress: PlaybackProgress = JSON.parse(savedProgress);
        startIndex = Math.min(progress.chunkIndex, textChunks.length - 1); // Ensure startIndex is within bounds
        setCurrentChunkIndex(startIndex);
        console.log(`Starting from saved chunk index ${startIndex}`);
      }

      // Fetch the starting chunk
      isFetching.current = true;
      setIsLoading(true);
      const audio = await fetchTTS(textChunks[startIndex], startIndex);
      if (!audio) {
        throw new Error(`Failed to fetch audio for chunk ${startIndex}`);
      }

      setFetchedChunks(prev => {
        const newFetched = [...prev];
        newFetched[startIndex] = audio;
        return newFetched;
      });

      // Pass the audio directly to playNextAudio to avoid race condition
      playNextAudio(audio);
    } catch (error) {
      console.error('Backend TTS error:', error);
      toast.error("Failed to generate speech from backend, using local synthesis");

      if (!window.speechSynthesis || !isMounted.current) {
        toast.error("Speech synthesis not supported or component unmounted");
        setIsLoading(false);
        return;
      }

      const plainText = getTextFromContainer();
      if (!plainText) {
        toast.error("No text content available for speech synthesis");
        setIsLoading(false);
        return;
      }
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
        if (isMounted.current) {
          setIsPlaying(false);
          onPlayStateChange?.(false, null);
        }
      };

      window.speechSynthesis.speak(newUtterance);
      setIsPlaying(true);
      onPlayStateChange?.(true, null);
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    console.log("Regenerate response");
    // You might want to call an external function passed as a prop
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