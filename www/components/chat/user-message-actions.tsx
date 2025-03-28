import { Copy, Volume2, Edit, Download, Play, Pause, Loader } from 'lucide-react'
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
  const trimmedContent = content.substring(0, 100);
  let hash = 0;
  for (let i = 0; i < trimmedContent.length; i++) {
    const char = trimmedContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'tts_' + Math.abs(hash).toString(16);
}

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
  const [isCompleted, setIsCompleted] = useState(false); // Add isCompleted state
  const [audioQueue, setAudioQueue] = useState<HTMLAudioElement[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [fetchedChunks, setFetchedChunks] = useState<(HTMLAudioElement | null)[]>([]); // Track fetched audio for each chunk
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0); // Track the current chunk being played
  const containerRef = useRef<HTMLDivElement>(null);
  const contentHash = useRef<string>(createContentHash(content));
  const isMounted = useRef(true);
  const hasFetchedNext = useRef(false); // To prevent fetching the next chunk multiple times

  // Load playback progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
    if (savedProgress) {
      const progress: PlaybackProgress = JSON.parse(savedProgress);
      setCurrentChunkIndex(progress.chunkIndex);
    }
  }, []);

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

  const fetchTTS = async (text: string, chunkIndex: number): Promise<HTMLAudioElement | null> => {
    if (!isMounted.current) {
      console.log(`Component unmounted, aborting fetch for chunk ${chunkIndex}`);
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
    if (!text) return '';
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
      setIsCompleted(true); // Mark as completed when no more audio
      onPlayStateChange?.(false, null);
      setIsLoading(false);
      localStorage.removeItem(`tts_progress_${contentHash.current}`); // Clear progress
      console.log('Audio queue empty, playback completed');
      return;
    }

    if (!initialAudio) {
      setAudioQueue(prev => prev.slice(1));
    }

    setCurrentAudio(audioToPlay);
    setCurrentChunkIndex(prev => initialAudio ? prev : prev + 1);
    setIsCompleted(false); // Reset completion state when playing new audio

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
      if (!audioToPlay.duration || !isMounted.current) return;
      
      const progress = audioToPlay.currentTime / audioToPlay.duration;
      if (progress >= 0.5 && !hasFetchedNext.current && currentChunkIndex + 1 < chunks.length) {
        hasFetchedNext.current = true;
        console.log(`50% of chunk ${currentChunkIndex} played, fetching next chunk`);
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
      
      // Record that this chunk has completed
      const progressData: PlaybackProgress = {
        chunkIndex: currentChunkIndex + 1,
        currentTime: 0
      };
      localStorage.setItem(`tts_progress_${contentHash.current}`, JSON.stringify(progressData));
      
      setCurrentAudio(null);
      
      // Check if we have more audio in the queue
      if (audioQueue.length > 0) {
        // We have more audio queued up, play the next one
        playNextAudio();
      } else if (currentChunkIndex + 1 < chunks.length) {
        // We don't have the next chunk in queue yet, but it exists - try to fetch it
        console.log(`Chunk ended but next chunk not in queue. Fetching chunk ${currentChunkIndex + 1}`);
        fetchNextChunk(currentChunkIndex + 1).then(() => {
          // After fetching, check if we have audio in queue now and play it
          if (audioQueue.length > 0) {
            playNextAudio();
          } else {
            // If fetch didn't add to queue for some reason, mark as completed
            setIsPlaying(false);
            setIsCompleted(true);
            onPlayStateChange?.(false, null);
          }
        });
      } else {
        // No more chunks, we're done
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
      console.log(`Chunk ${chunkIndex} already fetched or out of bounds`);
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

      // Add to the queue regardless of isPlaying state when called from onended
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
      setAudioQueue([]);
      setCurrentAudio(null);
      setIsCompleted(false); // Reset completion when stopping
      onPlayStateChange?.(false, null);
      return;
    }

    if (isLoading) return;

    try {
      const plainText = getTextFromContainer();
      if (!plainText) throw new Error("No text content available");

      const text = formatToSingleLine(plainText);
      const textChunks = text.length > 1000 ? splitTextIntoChunks(text, 1000) : [text];
      setChunks(textChunks);
      setFetchedChunks(new Array(textChunks.length).fill(null));
      setIsCompleted(false); // Reset completion when starting new playback

      let startIndex = 0;
      const savedProgress = localStorage.getItem(`tts_progress_${contentHash.current}`);
      if (savedProgress) {
        const progress: PlaybackProgress = JSON.parse(savedProgress);
        startIndex = Math.min(progress.chunkIndex, textChunks.length - 1);
        setCurrentChunkIndex(startIndex);
      }

      setIsLoading(true);
      const audio = await fetchTTS(textChunks[startIndex], startIndex);
      if (!audio) throw new Error("Failed to fetch initial audio");

      setFetchedChunks(prev => {
        const newFetched = [...prev];
        newFetched[startIndex] = audio;
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
          setIsCompleted(true); // Set completion for browser synthesis
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
          "hover:bg-muted rounded-full transition-colors flex items-center justify-center h-6 w-6",
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="size-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-3.5" />
        ) : isCompleted ? (
          <Volume2 className="size-3.5" /> // Show speaker icon when completed
        ) : (
          <Play className="size-3.5" /> // Show play icon when not completed
        )}
      </button>
      <button onClick={handleDownload} className="hover:bg-muted rounded-full p-1.5 transition-colors">
        <Download className="size-3.5" />
      </button>
    </motion.div>
  );
}