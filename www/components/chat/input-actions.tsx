'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from 'components/ui/input'
import { useToast } from "@/hooks/use-toast"
import { Button } from 'components/ui/button'
import { aiService } from '@/lib/services/ai-service'
import { ScrollArea } from 'components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from 'components/ui/dialog'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from 'components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'components/ui/dropdown-menu'
import { Globe, Paperclip, ArrowUp, CircleDotDashed, Lightbulb, ImageIcon, ChevronDown, Check, YoutubeIcon, FolderCogIcon, Upload, Link2, PackageOpen, NotebookPen } from 'lucide-react'

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

  const handleThinkingSelect = () => {
    onThinkingToggle();
    toast({
      title: "Thinking will be available soon",
      description: "This feature is currently in development",
      variant: "default",
    })
  }

  const handleImageSelect = () => {
    toast({
      title: "Image integration will be available soon",
      description: "This feature is currently in development",
      variant: "default",
    })
  }

  const handleGoogleDriveSelect = () => {
    toast({
      title: "Google Drive integration will be available soon",
      description: "This feature is currently in development",
      variant: "default",
    })
  }

  const handleCanvasSelect = () => {
    toast({
      title: "Canvas integration will be available soon",
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

  return (
    <div className="h-12 rounded-b-xl flex flex-row justify-between px-2.5 border-t">
      <div className="flex flex-row items-center h-full gap-2.5">
        {/* File Upload Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <div
              className={cn(
                'flex items-center justify-center p-0 rounded-full',
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
            </div>
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
          onClick={handleThinkingSelect}
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

        {/* Tools */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <div
              className={cn(
                'flex items-center justify-center p-0 rounded-full',
                imagePreview ? 'bg-background text-primary border' : 'text-muted-foreground',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <PackageOpen className={cn(
                  'text-muted-foreground hover:text-primary size-4 transition-colors',
                  imagePreview && 'text-primary',
                )} />
              </motion.div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem onClick={handleImageSelect}>
              <ImageIcon className="mr-2 h-4 w-4" /> Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCanvasSelect}>
              <NotebookPen className="mr-2 h-4 w-4" /> Canvas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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