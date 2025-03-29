"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Button } from "components/ui/button";
import { aiService } from "@/lib/services/ai-service";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "components/ui/dropdown-menu";
import { Globe, Paperclip, ArrowUp, CircleDotDashed, Lightbulb, ImageIcon, ChevronDown, Check, YoutubeIcon, FolderCogIcon, Upload, Link2, PackageOpen, NotebookPen } from "lucide-react";

interface InputActionsProps {
  isLoading: boolean;
  showSearch: boolean;
  showResearch: boolean;
  showThinking: boolean;
  value: string;
  selectedAI: string;
  imagePreview: string | null;
  onSubmit: () => void;
  onSearchToggle: () => void;
  onResearchToggle: () => void;
  onThinkingToggle: () => void;
  onImageUpload: (file: File | null) => void;
  onUrlAnalysis?: (urls: string[], prompt: string, type?: string) => void;
  onImageGeneration?: (response: { text_responses: string[]; images: { image: string; mime_type: string }[]; model_used: string }) => void; // Updated prop
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
  onUrlAnalysis,
  onImageGeneration,
}: InputActionsProps) {
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [youtubeDialogOpen, setYoutubeDialogOpen] = React.useState(false);
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [mediaDialogOpen, setMediaDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleThinkingSelect = async () => {
    onThinkingToggle();
    aiService.setModel("gemini-2.5-pro-exp-03-25");
  };

  const handleImageSelect = async () => {
    aiService.setModel("gemini-2.0-flash-exp-image-generation"); // Set image generation model
    toast({
      title: "Switched to Image Generation",
      description: "You can now generate images.",
      variant: "default",
    });
  };

  const handleGoogleDriveSelect = () => {
    toast({
      title: "Google Drive integration will be available soon",
      description: "This feature is currently in development",
      variant: "default",
    });
  };

  const handleCanvasSelect = () => {
    toast({
      title: "Canvas integration will be available soon",
      description: "This feature is currently in development",
      variant: "default",
    });
  };

  const handleYoutubeUrlSubmit = () => {
    if (youtubeUrl) {
      if (onUrlAnalysis) {
        onUrlAnalysis([youtubeUrl], "Analyze this YouTube video");
        toast({
          title: "YouTube URL submitted for analysis",
          description: youtubeUrl,
        });
      }
      setYoutubeUrl("");
      setYoutubeDialogOpen(false);
    } else {
      toast({
        title: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
    }
  };

  const handleMediaUrlSubmit = () => {
    if (mediaUrl) {
      if (onUrlAnalysis) {
        onUrlAnalysis([mediaUrl], "Analyze this media");
        toast({
          title: "Media URL submitted for analysis",
          description: mediaUrl,
        });
      }
      setMediaUrl("");
      setMediaDialogOpen(false);
    } else {
      toast({
        title: "Please enter a valid URL",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-12 flex-row justify-between rounded-b-xl border-t px-2.5">
      <div className="flex h-full flex-row items-center gap-2.5">
        {/* File Upload Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <div
              className={cn(
                "flex items-center justify-center rounded-full p-0",
                imagePreview ? "bg-background text-primary border" : "text-muted-foreground",
                isLoading && "cursor-not-allowed opacity-50"
              )}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Paperclip
                  className={cn(
                    "text-muted-foreground hover:text-primary size-4 transition-colors",
                    imagePreview && "text-primary"
                  )}
                />
              </motion.div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem onClick={handleGoogleDriveSelect}>
              <FolderCogIcon className="mr-2 size-4" /> Google Drive
            </DropdownMenuItem>

            <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <YoutubeIcon className="mr-2 size-4" /> YouTube URL
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
                  <Link2 className="mr-2 size-4" /> Media URL
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
              <label className="flex w-full cursor-pointer items-center">
                <Upload className="mr-2 size-4" /> Upload File
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={isLoading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageUpload(file);
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
            "text-muted-foreground hover:text-primary flex h-8 items-center justify-center gap-1.5 rounded-full border transition-all",
            showSearch ? "bg-background border px-2" : "border-transparent",
            isLoading && "cursor-not-allowed opacity-50"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: showSearch ? 180 : 0, scale: showSearch ? 1.1 : 1 }}
            whileHover={{ rotate: showSearch ? 180 : 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
          >
            <Globe
              className={cn(
                "hover:text-primary size-4",
                showSearch ? "text-primary" : "text-muted-foreground",
                isLoading && "cursor-not-allowed opacity-50"
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showSearch && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
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
            "text-muted-foreground hover:text-primary flex h-8 items-center justify-center gap-1.5 rounded-full border transition-all",
            showResearch ? "bg-background border px-2" : "border-transparent",
            isLoading && "cursor-not-allowed opacity-50"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: showResearch ? 180 : 0, scale: showResearch ? 1.1 : 1 }}
            whileHover={{ rotate: showResearch ? 180 : 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
          >
            <CircleDotDashed
              className={cn(
                "hover:text-primary size-4",
                showResearch ? "text-primary" : "text-muted-foreground",
                isLoading && "cursor-not-allowed opacity-50"
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showResearch && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
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
            "text-muted-foreground hover:text-primary flex h-8 items-center justify-center gap-1.5 rounded-full border transition-all",
            showThinking ? "bg-background border px-2" : "border-transparent",
            isLoading && "cursor-not-allowed opacity-50"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: showThinking ? 360 : 0, scale: showThinking ? 1.1 : 1 }}
            whileHover={{ rotate: showThinking ? 360 : 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
          >
            <Lightbulb
              className={cn(
                "hover:text-primary size-4",
                showThinking ? "text-primary" : "text-muted-foreground",
                isLoading && "cursor-not-allowed opacity-50"
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showThinking && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
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
                "flex items-center justify-center rounded-full p-0",
                imagePreview ? "bg-background text-primary border" : "text-muted-foreground",
                isLoading && "cursor-not-allowed opacity-50"
              )}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <PackageOpen
                  className={cn(
                    "text-muted-foreground hover:text-primary size-4 transition-colors",
                    imagePreview && "text-primary"
                  )}
                />
              </motion.div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem onClick={handleImageSelect}>
              <ImageIcon className="mr-2 size-4" /> Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCanvasSelect}>
              <NotebookPen className="mr-2 size-4" /> Canvas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex h-full flex-row items-center">
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className={cn(
            "bg-primary text-primary-foreground hover:text-background hover:bg-foreground flex size-8 items-center justify-center rounded-full border border-none transition-colors",
            value ? "" : "cursor-not-allowed opacity-80",
            !isLoading && "p-2"
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
  );
}