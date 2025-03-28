'use client'

import * as React from 'react'
import { Globe, Paperclip, ArrowUp, CircleDotDashed, Lightbulb, ImageIcon, ChevronDown, Check, YoutubeIcon, FolderCogIcon, Upload, Link2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover'
import { Button } from 'components/ui/button'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from 'components/ui/command'
import { ScrollArea } from 'components/ui/scroll-area'
import { aiService } from '@/lib/services/ai-service'
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'components/ui/dropdown-menu'
import { Input } from 'components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from 'components/ui/dialog'

interface AIModel {
  value: string;
  label: string;
  hasSearch?: boolean;
  hasThinking?: boolean;
  hasImageGen?: boolean;
}

const ais: AIModel[] = [
  {
    value: "gemini-2.5-pro-exp-03-25",
    label: "Gemini 2.5 Pro (Experimental)",
    hasSearch: true,
    hasThinking: true,
    hasImageGen: false
  },
  {
    value: "gemini-2.0-flash-thinking-exp-01-21",
    label: "Gemini 2.0 Flash Thinking",
    hasSearch: false,
    hasThinking: true,
    hasImageGen: false
  },
  {
    value: "gemini-2.0-flash-exp-image-generation",
    label: "Gemini 2.0 Flash Image Gen",
    hasSearch: false,
    hasThinking: false,
    hasImageGen: true
  },
  {
    value: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    hasSearch: true,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "gemini-2.0-flash-lite",
    label: "Gemini 2.0 Flash Lite",
    hasSearch: false,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "learnlm-1.5-pro-experimental",
    label: "LearnLM 1.5 Pro",
    hasSearch: false,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    hasSearch: true,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
    hasSearch: true,
    hasThinking: false,
    hasImageGen: false
  },
  {
    value: "gemini-1.5-flash-8b",
    label: "Gemini 1.5 Flash 8B",
    hasSearch: false,
    hasThinking: false,
    hasImageGen: false
  }
];

interface InputActionsProps {
  isLoading: boolean
  showSearch: boolean
  showResearch: boolean
  showThinking: boolean
  value: string
  selectedAI: string
  imagePreview: string | null
  onSubmit: () => void
  onSearchToggle: () => void
  onResearchToggle: () => void
  onThinkingToggle: () => void
  onImageUpload: (file: File | null) => void
  onAIChange: (aiModel: string) => void
  onUrlAnalysis?: (urls: string[], prompt: string, type?: string) => void
  onImageGeneration?: (response: { text: string; image: string; model_used: string; file_path: string }) => void // New prop to handle image generation response
}

export function InputActions({
  isLoading,
  showSearch,
  showResearch,
  showThinking,
  value,
  selectedAI,
  imagePreview,
  onSubmit,
  onSearchToggle,
  onResearchToggle,
  onThinkingToggle,
  onImageUpload,
  onAIChange,
  onUrlAnalysis,
  onImageGeneration, // Add the new prop
}: InputActionsProps) {
  const [aiOpen, setAiOpen] = React.useState(false)
  const [youtubeUrl, setYoutubeUrl] = React.useState('')
  const [youtubeDialogOpen, setYoutubeDialogOpen] = React.useState(false)
  const [mediaUrl, setMediaUrl] = React.useState('')
  const [mediaDialogOpen, setMediaDialogOpen] = React.useState(false)
  const { toast } = useToast()

  const handleGoogleDriveSelect = () => {
    toast({
      title: "Google Drive integration will be available soon",
      description: "This feature is currently in development",
      variant: "default",
    })
  }

  const handleYoutubeUrlSubmit = () => {
    if (youtubeUrl) {
      if (onUrlAnalysis) {
        onUrlAnalysis([youtubeUrl], "Analyze this YouTube video")
        toast({
          title: "YouTube URL submitted for analysis",
          description: youtubeUrl,
        })
      }
      setYoutubeUrl('')
      setYoutubeDialogOpen(false)
    } else {
      toast({
        title: "Please enter a valid YouTube URL",
        variant: "destructive",
      })
    }
  }

  const handleMediaUrlSubmit = () => {
    if (mediaUrl) {
      if (onUrlAnalysis) {
        onUrlAnalysis([mediaUrl], "Analyze this media")
        toast({
          title: "Media URL submitted for analysis",
          description: mediaUrl,
        })
      }
      setMediaUrl('')
      setMediaDialogOpen(false)
    } else {
      toast({
        title: "Please enter a valid URL",
        variant: "destructive",
      })
    }
  }

  const handleImageGeneration = async () => {
    const selectedModel = ais.find((ai) => ai.value === selectedAI);
    if (!selectedModel?.hasImageGen) {
      toast({
        title: "Image generation not available",
        description: "Please switch to an AI model that supports image generation",
        variant: "destructive",
      });
      return;
    }

    if (!value.trim()) {
      toast({
        title: "Please enter an image prompt",
        description: "Text is required for image generation",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Generating image",
        description: "Using your text as a prompt for image generation",
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/image_generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: value.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      if (!data.image) {
        throw new Error('No image generated');
      }

      if (onImageGeneration) {
        onImageGeneration(data); // Pass the entire response to the parent component
      }

      toast({
        title: "Image generated successfully",
        description: "The image has been generated and displayed.",
      });
    } catch (error) {
      toast({
        title: "Error generating image",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const handleAISelect = (value: string) => {
    const selectedModel = ais.find((ai) => ai.value === value)
    if (selectedModel) {
      onAIChange(value)
      aiService.setModel(value || 'gemini-2.5-pro-exp-03-25')

      // Auto-toggle Thinking if model hasThinking
      if (selectedModel.hasThinking && !showThinking) {
        console.log("Auto-enabling Thinking mode for", value)
        onThinkingToggle()
      } else if (!selectedModel.hasThinking && showThinking) {
        console.log("Auto-disabling Thinking mode for", value)
        onThinkingToggle()
      }

      // Auto-toggle Search if model hasSearch
      if (selectedModel.hasSearch && !showSearch) {
        console.log("Auto-enabling Search mode for", value)
        onSearchToggle()
      } else if (!selectedModel.hasSearch && showSearch) {
        console.log("Auto-disabling Search mode for", value)
        onSearchToggle()
      }
    }
    setAiOpen(false)
  }

  return (
    <div className="h-12 rounded-b-xl flex flex-row justify-between px-2.5">
      <div className="flex flex-row items-center h-full gap-2.5">
        {/* File Upload Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 p-0 rounded-full',
                imagePreview ? 'bg-background text-primary border' : 'text-muted-foreground',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Paperclip className={cn(
                  'text-muted-foreground hover:text-primary size-4 transition-colors',
                  imagePreview && 'text-primary',
                )} />
              </motion.div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem onClick={handleGoogleDriveSelect}>
              <FolderCogIcon className="mr-2 h-4 w-4" /> Google Drive
            </DropdownMenuItem>

            <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <YoutubeIcon className="mr-2 h-4 w-4" /> YouTube URL
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add YouTube URL</DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" onClick={handleYoutubeUrlSubmit}>
                    Analyze
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Link2 className="mr-2 h-4 w-4" /> Media URL
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Media URL</DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <Input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/media.jpg"
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" onClick={handleMediaUrlSubmit}>
                    Analyze
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenuItem>
              <label className="flex items-center w-full cursor-pointer">
                <Upload className="mr-2 h-4 w-4" /> Upload File
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={isLoading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onImageUpload(file)
                  }}
                />
              </label>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search Button */}
        <motion.button
          type="button"
          onClick={onSearchToggle}
          disabled={isLoading}
          className={cn(
            'flex h-8 justify-center items-center gap-1.5 rounded-full border transition-all text-muted-foreground hover:text-primary',
            showSearch ? 'bg-background border px-2' : 'border-transparent',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: showSearch ? 180 : 0, scale: showSearch ? 1.1 : 1 }}
            whileHover={{ rotate: showSearch ? 180 : 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            <Globe
              className={cn(
                'size-4 hover:text-primary',
                showSearch ? 'text-primary' : 'text-muted-foreground',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showSearch && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
              >
                Search
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Research Button */}
        <motion.button
          type="button"
          onClick={onResearchToggle}
          disabled={isLoading}
          className={cn(
            'flex h-8 justify-center items-center gap-1.5 rounded-full border transition-all text-muted-foreground hover:text-primary',
            showResearch ? 'bg-background border px-2' : 'border-transparent',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: showResearch ? 180 : 0, scale: showResearch ? 1.1 : 1 }}
            whileHover={{ rotate: showResearch ? 180 : 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            <CircleDotDashed
              className={cn(
                'size-4 hover:text-primary',
                showResearch ? 'text-primary' : 'text-muted-foreground',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showResearch && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
              >
                Research
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Think Button */}
        <motion.button
          type="button"
          onClick={() => {
            console.log("Toggling thinking mode:", !showThinking);
            onThinkingToggle();
          }}
          disabled={isLoading}
          className={cn(
            'flex h-8 justify-center items-center gap-1.5 rounded-full border transition-all text-muted-foreground hover:text-primary',
            showThinking ? 'bg-background border px-2' : 'border-transparent',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: showThinking ? 360 : 0, scale: showThinking ? 1.1 : 1 }}
            whileHover={{ rotate: showThinking ? 360 : 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            <Lightbulb
              className={cn(
                'size-4 hover:text-primary',
                showThinking ? 'text-primary' : 'text-muted-foreground',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showThinking && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
              >
                Think
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Image Generation Button */}
        <motion.button
          type="button"
          onClick={handleImageGeneration} // Use the new handler
          disabled={isLoading}
          className={cn(
            'flex h-8 justify-center items-center gap-1.5 rounded-full border transition-all text-muted-foreground hover:text-primary',
            selectedAI === "gemini-2.0-flash-exp-image-generation" ? 'bg-background border px-2' : 'border-transparent',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ 
              scale: selectedAI === "gemini-2.0-flash-exp-image-generation" ? 1.1 : 1 
            }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            <ImageIcon className={cn(
              'size-4 hover:text-primary',
              selectedAI === "gemini-2.0-flash-exp-image-generation" ? 'text-primary' : 'text-muted-foreground',
              isLoading && 'cursor-not-allowed opacity-50'
            )} />
          </motion.div>
          <AnimatePresence>
            {selectedAI === "gemini-2.0-flash-exp-image-generation" && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
              >
                Image
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* AI Model Selector */}
        <Popover open={aiOpen} onOpenChange={setAiOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={aiOpen}
              className="bg-primary-foreground hover:bg-secondary h-8 w-full min-w-[50px] justify-between px-2 text-xs sm:min-w-[150px] md:w-[200px] md:min-w-[180px]"
            >
              <span className="mr-1 flex-1 truncate text-start">
                {selectedAI ? ais.find((ai) => ai.value === selectedAI)?.label : 'Gemini 2.5 Pro (Experimental)'}
              </span>
              <ChevronDown className="shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-[100000] mr-2 w-[var(--radix-popover-trigger-width)] p-0 text-xs">
            <Command className="bg-primary-foreground">
              <CommandInput placeholder="Search ai..." />
              <CommandList className="overflow-hidden">
                <CommandEmpty>No ai found.</CommandEmpty>
                <CommandGroup className="px-0">
                  <ScrollArea className="h-max max-h-[300px] px-1.5">
                    {ais.map((ai) => (
                      <CommandItem
                        className="text-xs"
                        key={ai.value}
                        value={ai.value}
                        onSelect={handleAISelect}
                      >
                        <span className="w-[20px] max-w-full flex-1 truncate">{ai.label}</span>
                        <Check
                          className={cn(
                            'ml-auto',
                            selectedAI === ai.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-row items-center h-full">
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className={cn(
            'border rounded-full transition-colors h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground hover:text-background hover:bg-foreground border-none',
            value ? '' : 'opacity-80 cursor-not-allowed',
            !isLoading && 'p-2'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <div className="border-primary-foreground flex items-center justify-center rounded-full border p-2 opacity-90">
              <div className="border-primary-foreground size-2 border" />
            </div>
          ) : (
            <ArrowUp className="size-4" />
          )}
        </motion.button>
      </div>
    </div>
  )
}