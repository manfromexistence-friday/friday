import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Sparkles, Play, Pause, Volume2, ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { User as FirebaseUser } from 'firebase/auth';
import React, { useState, useEffect, useRef, memo } from 'react';
import AiMessage from '@/components/chat/ai-message-actions';
import UserMessage from '@/components/chat/user-message-actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MarkdownPreview } from './markdown-preview';
import AnimatedGradientText from '@/components/ui/animated-gradient-text';
import ImageGen from '@/components/image';
import { ReasoningPreview } from './reasoning-preview';

interface ChatMessageProps {
  message: Message;
  chatId: string | null;
  index: number;
  className?: string;
  isFadingOut?: boolean;
  onTransitionEnd?: () => void;
  selectedAI?: string;
}

export const ChatMessage = memo(
  ({
    message,
    chatId,
    index,
    className,
    isFadingOut,
    onTransitionEnd,
    selectedAI = '',
  }: ChatMessageProps) => {
    const { user } = useAuth();
    const isAssistant = message.role === 'assistant';
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const contentHash = useRef<string>('');

    const userImage = (user as FirebaseUser)?.photoURL;
    const userName = (user as FirebaseUser)?.displayName;
    const userEmail = (user as FirebaseUser)?.email;
    const fallbackInitial = userName?.[0] || userEmail?.[0]?.toUpperCase() || 'U';

    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const isImageGenerationMessage =
      message.model_used === 'gemini-2.0-flash-exp-image-generation' ||
      (message.image_urls && message.image_urls.length > 0);

    const isReasoningMessage =
      message.model_used === 'gemini-2.5-pro-exp-03-25' ||
      message.model_used === 'gemini-2.0-flash-thinking-exp-01-21';

    const handleWordIndexUpdate = (index: number) => {
      setCurrentWordIndex(index);
    };

    const handlePlayStateChange = (playing: boolean, audioElement: HTMLAudioElement | null = null) => {
      setIsPlaying(playing);
      if (audioElement) {
        setAudio(audioElement);
        audioRef.current = audioElement;

        if (playing) {
          setIsPopoverOpen(false);
          if (audioElement) {
            audioElement.ontimeupdate = () => {
              if (audioElement.duration) {
                setProgress(audioElement.currentTime / audioElement.duration);
              }
            };
            audioElement.onended = () => {
              setIsPlaying(false);
              setProgress(0);
            };
          }
        }
      }
    };

    const handlePlayPauseClick = () => {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    };

    useEffect(() => {
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }, []);

    return (
      <div className={cn('flex w-full', isAssistant ? 'justify-start' : 'justify-end', className)}>
        {!isAssistant && (
          <div className="flex w-full flex-row items-start justify-end gap-2">
            <div className="hover:bg-primary-foreground hover:text-primary relative flex items-center justify-center rounded-xl rounded-tr-none border p-2 font-mono text-sm">
              <MarkdownPreview content={message.content} currentWordIndex={currentWordIndex} />
            </div>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger>
                <Avatar className="size-9">
                  <AvatarImage src={userImage ?? undefined} alt={userName || userEmail || 'User'} />
                  <AvatarFallback>{fallbackInitial}</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent align="end" className="size-min w-min border-none p-0 shadow-none">
                <UserMessage
                  content={message.content}
                  reactions={message.reactions}
                  onWordIndexUpdate={handleWordIndexUpdate}
                  onPlayStateChange={handlePlayStateChange}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
        {isAssistant && (
          <div className="flex w-full flex-col items-start">
            <div
              className={cn(
                'hover:text-primary relative flex w-full items-center px-2 font-mono text-sm',
                { 'fade-out': isFadingOut }
              )}
              onTransitionEnd={onTransitionEnd}
            >
              {message.content === 'thinking' ? (
                <div className="thinking-content">
                  <AnimatedGradientText text="AI is thinking..." />
                </div>
              ) : isImageGenerationMessage ? (
                <div className="min-w-full">
                  <ImageGen message={message} />
                </div>
              ) : isReasoningMessage ?
                (
                  <ReasoningPreview content={message.content} currentWordIndex={currentWordIndex} />
                )
                : (
                  // <MarkdownPreview content={message.content} currentWordIndex={currentWordIndex} />
                  <ReasoningPreview content={message.content} currentWordIndex={currentWordIndex} />

                )}
            </div>
            <AiMessage
              content={message.content}
              reactions={message.reactions}
              onWordIndexUpdate={handleWordIndexUpdate}
              onPlayStateChange={handlePlayStateChange}
            />
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: re-render only if meaningful props change
    return (
      prevProps.message === nextProps.message &&
      prevProps.chatId === nextProps.chatId &&
      prevProps.index === nextProps.index &&
      prevProps.isFadingOut === nextProps.isFadingOut &&
      prevProps.selectedAI === nextProps.selectedAI
    );
  }
);

// Add display name to resolve the ESLint error
ChatMessage.displayName = 'ChatMessage';
