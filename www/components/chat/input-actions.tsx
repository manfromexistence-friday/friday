"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Button } from "components/ui/button";
import { aiService } from "@/lib/services/ai-service";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { Globe, Paperclip, ArrowUp, CircleDotDashed, Lightbulb, ImageIcon, ChevronDown, Check, YoutubeIcon, FolderCogIcon, Upload, Link2, PackageOpen, NotebookPen, Sparkles, X, File } from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "components/ui/tooltip";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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

interface MegaFile {
  id: string;
  name: string;
  size: number;
  type: string;
  isImage: boolean;
  timestamp?: number;
}

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
  onImageGeneration?: (response: { text_responses: string[]; images: { image: string; mime_type: string }[]; model_used: string }) => void;
  onAIChange?: (model: string) => void;
  onInsertText?: (text: string, type: string) => void;
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
  onAIChange,
  onInsertText,
}: InputActionsProps) {
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [aiOpen, setAiOpen] = React.useState(false);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = React.useState(false);
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [mediaDialogOpen, setMediaDialogOpen] = React.useState(false);
  const [localSelectedAI, setLocalSelectedAI] = React.useState<string>(selectedAI || aiService.currentModel);
  const [filePopoverOpen, setFilePopoverOpen] = React.useState(false);
  const [attachUrl, setAttachUrl] = React.useState("");
  const { toast } = useToast();

  const [activeCommandMode, setActiveCommandMode] = React.useState<string | null>(null);
  const [megaFiles, setMegaFiles] = useState<MegaFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUrlUploading, setIsUrlUploading] = useState(false);

  useEffect(() => {
    const savedCommand = localStorage.getItem('activeCommand');
    if (savedCommand) {
      setActiveCommandMode(savedCommand);
    }
  }, []);

  useEffect(() => {
    if (selectedAI) {
      setLocalSelectedAI(selectedAI);
    }
  }, [selectedAI]);

  useEffect(() => {
    console.log("Setting AI model to:", localSelectedAI);
    aiService.setModel(localSelectedAI);
  }, [localSelectedAI]);

  useEffect(() => {
    if (showThinking && activeCommandMode !== 'thinking-mode') {
      setActiveCommandMode('thinking-mode');
      localStorage.setItem('activeCommand', 'thinking-mode');
    } else if (!showThinking && activeCommandMode === 'thinking-mode') {
      setActiveCommandMode(null);
      localStorage.removeItem('activeCommand');
    }
  }, [showThinking, activeCommandMode]);

  useEffect(() => {
    if (showResearch && activeCommandMode !== 'research-mode') {
      setActiveCommandMode('research-mode');
      localStorage.setItem('activeCommand', 'research-mode');
    } else if (!showResearch && activeCommandMode === 'research-mode') {
      setActiveCommandMode(null);
      localStorage.removeItem('activeCommand');
    }
  }, [showResearch, activeCommandMode]);


  const fetchMegaFiles = React.useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch('/api/mega/files');
      const data = await response.json();
      if (data.files) {
        setMegaFiles(data.files);
      } else {
        console.error("Error fetching MEGA files:", data.error);
        toast({
          title: "Failed to load files",
          description: data.error || "Unable to load files from MEGA",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching MEGA files:", error);
      toast({
        title: "Failed to load files",
        description: "Unable to connect to MEGA service",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFiles(false);
    }
  }, [toast]);

  useEffect(() => {
    if (filePopoverOpen) {
      fetchMegaFiles();
    }
  }, [filePopoverOpen, fetchMegaFiles]);


  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch('/api/mega/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Upload successful",
          description: "File was uploaded to MEGA",
          variant: "default",
        });
        fetchMegaFiles();
      } else {
        toast({
          title: "Upload failed",
          description: data.error || "Failed to upload file to MEGA",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachUrl = async () => {
    if (!attachUrl) {
      toast({
        title: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsUrlUploading(true);

    try {
      const response = await fetch('/api/mega/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: attachUrl }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "URL download successful",
          description: `${data.filename} was uploaded to MEGA`,
        });
        fetchMegaFiles();
        setAttachUrl("");
        setFilePopoverOpen(false);
      } else {
        toast({
          title: "URL download failed",
          description: data.error || "Failed to download and upload the URL",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing URL:", error);
      toast({
        title: "URL processing failed",
        description: "An error occurred while downloading the URL",
        variant: "destructive",
      });
    } finally {
      setIsUrlUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const enhancePrompt = async () => {
    if (value.trim() === "") {
      toast({
        title: "No text to enhance",
        description: "Please enter some text first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Enhancing your prompt...",
      description: "Making your instructions clearer for the AI",
      variant: "default",
    });

    try {
      let textToEnhance = value;

      if (activeCommandMode) {
        const prefix = prefixes[activeCommandMode as keyof typeof prefixes];
        if (value.startsWith(`${prefix}: `)) {
          textToEnhance = value.substring(`${prefix}: `.length);
        }
      }

      const previousModel = aiService.currentModel;

      aiService.setModel("gemini-2.0-flash");

      const enhancementPrompt = `Please rewrite and improve the following prompt to make it clearer, more specific, and easier for an AI to understand. Focus on improving structure, specificity, and clarity. Return ONLY the improved prompt with no explanations or additional text:\n\n${textToEnhance}`;

      const response = await aiService.generateResponse(enhancementPrompt);

      aiService.setModel(previousModel);

      const enhancedPrompt = typeof response === 'string'
        ? response.trim()
        : response.text_response?.trim() || '';

      let cleanedPrompt = enhancedPrompt;
      while (cleanedPrompt.endsWith(':')) {
        cleanedPrompt = cleanedPrompt.slice(0, -1).trim();
      }

      let finalText = cleanedPrompt;
      if (activeCommandMode) {
        const prefix = prefixes[activeCommandMode as keyof typeof prefixes];
        finalText = `${prefix}: ${enhancedPrompt}`;

        while (finalText.endsWith(':')) {
          finalText = finalText.slice(0, -1).trim();
        }

        if (onInsertText) {
          onInsertText(finalText, activeCommandMode);

          setTimeout(() => {
            if (document.getElementById('ai-input')) {
              const event = new Event('input', { bubbles: true });
              document.getElementById('ai-input')?.dispatchEvent(event);
            }
          }, 50);
        }
      } else {
        if (onInsertText) {
          onInsertText(finalText, "");

          setTimeout(() => {
            if (document.getElementById('ai-input')) {
              const event = new Event('input', { bubbles: true });
              document.getElementById('ai-input')?.dispatchEvent(event);
            }
          }, 50);
        }
      }

      toast({
        title: "Prompt Enhanced",
        description: (
          <div className="mt-1">
            Your prompt has been improved
          </div>
        ),
        variant: "default",
      });
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast({
        title: "Enhancement failed",
        description: "Unable to enhance prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const prefixes = {
    'image-gen': "Image",
    'thinking-mode': "Thinking",
    'search-mode': "Search",
    'research-mode': "Research",
    'canvas-mode': "Canvas"
  };

  const handleImageSelect = async () => {
    const imageGenModel = "gemini-2.0-flash-exp-image-generation";

    setLocalSelectedAI(imageGenModel);

    setActiveCommandMode('image-gen');
    localStorage.setItem('activeCommand', 'image-gen');

    aiService.setModel(imageGenModel);

    if (onAIChange) {
      onAIChange(imageGenModel);
    }

    if (onInsertText) {
      onInsertText(`${prefixes['image-gen']}:`, 'image-gen');
    }

    localStorage.setItem("previousModel", selectedAI || "gemini-2.0-flash");

    try {
      const currentChatId = window.location.pathname.split('/').pop();
      if (currentChatId) {
        const chatRef = doc(db, "chats", currentChatId);
        await updateDoc(chatRef, { model: imageGenModel });
        console.log("Firestore model updated to:", imageGenModel);
      }
    } catch (error) {
      console.error("Failed to update Firestore model:", error);
    }

    toast({
      title: "Switched to Image Generation",
      description: "You can now generate images.",
      variant: "default",
    });

    console.log("Model switched to image generation:", imageGenModel);
  };

  const handleGoogleDriveSelect = () => {
    toast({
      title: "Google Drive integration will be available soon",
      description: "This feature is currently in development",
      variant: "default",
    });
  };

  const handleCanvasSelect = () => {
    const thinkingModel = "gemini-2.0-flash-thinking-exp-01-21";
    setLocalSelectedAI(thinkingModel);

    setActiveCommandMode('canvas-mode');
    localStorage.setItem('activeCommand', 'canvas-mode');

    if (onInsertText) {
      onInsertText(`${prefixes['canvas-mode']}:`, 'canvas-mode');
    }

    toast({
      title: "Switched to Canvas Mode",
      description: "Canvas mode activated with enhanced thinking capabilities.",
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

  const handleSearchSelect = () => {
    const thinkingModel = "gemini-2.0-flash-thinking-exp-01-21";
    setLocalSelectedAI(thinkingModel);

    setActiveCommandMode('search-mode');
    localStorage.setItem('activeCommand', 'search-mode');

    if (onInsertText) {
      onInsertText(`${prefixes['search-mode']}:`, 'search-mode');
    }

    toast({
      title: "Switched to Search Mode",
      description: "Enhanced search capabilities activated.",
      variant: "default",
    });
  };

  const handleResearchToggle = async () => {
    const newResearchState = !showResearch;
    onResearchToggle();

    if (newResearchState) {
      localStorage.setItem("previousModel", localSelectedAI);
      const thinkingModel = "gemini-2.5-pro-exp-03-25";
      setLocalSelectedAI(thinkingModel);

      setActiveCommandMode('research-mode');
      localStorage.setItem('activeCommand', 'research-mode');

      if (onInsertText) {
        onInsertText(`${prefixes['research-mode']}:`, 'research-mode');
      }

      try {
        const currentChatId = window.location.pathname.split('/').pop();
        if (currentChatId) {
          const chatRef = doc(db, "chats", currentChatId);
          await updateDoc(chatRef, { model: thinkingModel });
          console.log("Firestore model updated to:", thinkingModel);
        }
      } catch (error) {
        console.error("Failed to update Firestore model:", error);
      }

      toast({
        title: "Deep Research Mode Activated",
        description: "Enhanced reasoning capabilities for deep research.",
        variant: "default",
      });
    } else {
      const prevModel = localStorage.getItem("previousModel") || "gemini-2.0-flash";
      setLocalSelectedAI(prevModel);

      setActiveCommandMode(null);
      localStorage.removeItem('activeCommand');

      if (value && value.startsWith("Research")) {
        if (onInsertText) {
          onInsertText("", "");
        }
      }

      try {
        const currentChatId = window.location.pathname.split('/').pop();
        if (currentChatId) {
          const chatRef = doc(db, "chats", currentChatId);
          await updateDoc(chatRef, { model: prevModel });
          console.log("Firestore model updated to:", prevModel);
        }
      } catch (error) {
        console.error("Failed to update Firestore model:", error);
      }

      toast({
        title: "Research Mode Disabled",
        description: `Restored to ${prevModel}`,
        variant: "default",
      });
    }
  };

  const handleThinkingSelect = async () => {
    const newResearchState = !showResearch;

    if (newResearchState) {
      localStorage.setItem("previousModel", localSelectedAI);
      const thinkingModel = "gemini-2.0-flash-thinking-exp-01-21";
      setLocalSelectedAI(thinkingModel);

      setActiveCommandMode('research-mode');
      localStorage.setItem('activeCommand', 'research-mode');

      if (onInsertText) {
        onInsertText(`${prefixes['research-mode']}:`, 'research-mode');
      }

      try {
        const currentChatId = window.location.pathname.split('/').pop();
        if (currentChatId) {
          const chatRef = doc(db, "chats", currentChatId);
          await updateDoc(chatRef, { model: thinkingModel });
          console.log("Firestore model updated to:", thinkingModel);
        }
      } catch (error) {
        console.error("Failed to update Firestore model:", error);
      }

      toast({
        title: "Deep Research Mode Activated",
        description: "Enhanced reasoning capabilities for deep research.",
        variant: "default",
      });
    } else {
      const prevModel = localStorage.getItem("previousModel") || "gemini-2.0-flash";
      setLocalSelectedAI(prevModel);

      setActiveCommandMode(null);
      localStorage.removeItem('activeCommand');

      if (value && value.startsWith("Research")) {
        if (onInsertText) {
          onInsertText("", "");
        }
      }

      try {
        const currentChatId = window.location.pathname.split('/').pop();
        if (currentChatId) {
          const chatRef = doc(db, "chats", currentChatId);
          await updateDoc(chatRef, { model: prevModel });
          console.log("Firestore model updated to:", prevModel);
        }
      } catch (error) {
        console.error("Failed to update Firestore model:", error);
      }

      toast({
        title: "Research Mode Disabled",
        description: `Restored to ${prevModel}`,
        variant: "default",
      });
    }
  };

  const recentFiles = [
    { id: 1, name: "Opera Snapshot_2025...", type: "image", thumbnail: "/placeholder.svg?height=40&width=40" },
    { id: 2, name: "Opera Snapshot_2025...", type: "image", thumbnail: "/placeholder.svg?height=40&width=40" },
    { id: 3, name: "112450-JEE-Advanced-...", type: "document", thumbnail: null },
    { id: 4, name: "52b1e466-5e9a-40ec...", type: "image", thumbnail: "/placeholder.svg?height=40&width=40" },
    { id: 5, name: "Opera Snapshot_2025...", type: "image", thumbnail: "/placeholder.svg?height=40&width=40" },
    { id: 6, name: "ai-message-actions.tsx", type: "document", thumbnail: null },
    { id: 7, name: "markdown-preview.tsx", type: "document", thumbnail: null },
    { id: 8, name: "user-message-actions...", type: "document", thumbnail: null },
    { id: 9, name: "message-list.tsx", type: "document", thumbnail: null },
  ];

  return (
    <div className="flex h-12 flex-row justify-between rounded-b-xl border-t px-2.5">
      <div className="flex h-full flex-row items-center gap-2.5">

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                type="button"
                onClick={handleResearchToggle}
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Deep Research Mode with Enhanced Thinking</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <div
              className={cn(
                "flex items-center justify-center rounded-full p-0",
                (activeCommandMode === 'image-gen' || activeCommandMode === 'search-mode' ||
                  activeCommandMode === 'thinking-mode' || activeCommandMode === 'canvas-mode') ?
                  "bg-background text-primary border" : "text-muted-foreground",
                isLoading && "cursor-not-allowed opacity-50"
              )}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <PackageOpen
                  className={cn(
                    "size-4 transition-colors",
                    (activeCommandMode === 'image-gen' || activeCommandMode === 'search-mode' ||
                      activeCommandMode === 'thinking-mode' || activeCommandMode === 'canvas-mode') ?
                      "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                />
              </motion.div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem onClick={handleImageSelect}>
              <ImageIcon className={cn("mr-2 size-4", activeCommandMode === 'image-gen' && "text-primary")} />
              Image Generation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSearchSelect}>
              <Globe className={cn("mr-2 size-4", activeCommandMode === 'search-mode' && "text-primary")} />
              Smart Search
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleThinkingSelect}>
              <Lightbulb className={cn("mr-2 size-4", activeCommandMode === 'thinking-mode' && "text-primary")} />
              Thinking Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCanvasSelect}>
              <NotebookPen className={cn("mr-2 size-4", activeCommandMode === 'canvas-mode' && "text-primary")} />
              Canvas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
      </div>

      <div className="flex h-full flex-row items-center gap-2.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                type="button"
                onClick={enhancePrompt}
                disabled={isLoading}
                className={cn(
                  "text-muted-foreground hover:text-primary flex h-8 items-center justify-center gap-1.5 rounded-full border transition-all",
                  isLoading && "cursor-not-allowed opacity-50",
                  "border-transparent"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ scale: 1 }}
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                >
                  <Sparkles
                    className={cn(
                      "hover:text-primary size-4",
                      "text-muted-foreground",
                      isLoading && "cursor-not-allowed opacity-50"
                    )}
                  />
                </motion.div>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enhance your prompt for better AI understanding</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Dialog open={filePopoverOpen} onOpenChange={setFilePopoverOpen}>
                <DialogTrigger asChild disabled={isLoading}>
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
                </DialogTrigger>
                <DialogContent
                  className="bg-background/95 w-full max-w-2xl overflow-hidden border p-0 shadow-lg backdrop-blur-md"
                >
                  <DialogHeader className="border-b p-4">
                    <DialogTitle className="text-xl font-medium">Attach Files from MEGA</DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-col items-center justify-center gap-3 border-b p-10">
                    <div className="bg-primary/10 mb-3 flex size-16 items-center justify-center rounded-full">
                      <Upload className="text-primary size-8" />
                    </div>
                    <h3 className="text-xl font-medium">Upload files to MEGA</h3>
                    <p className="text-muted-foreground mb-2 text-center">
                      Drag and drop files here or click to browse
                    </p>

                    <label>
                      <Button variant="default" size="lg" className="mt-2" disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Select files"}
                        <input
                          type="file"
                          className="hidden"
                          disabled={isLoading || isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file);
                              onImageUpload(file);
                            }
                          }}
                        />
                      </Button>
                    </label>
                  </div>

                  <div className="border-b p-4">
                    <h3 className="mb-3 text-lg font-medium">Files from MEGA</h3>
                    {isLoadingFiles ? (
                      <div className="flex justify-center p-4">
                        <div className="border-primary size-8 animate-spin rounded-full border-b-2"></div>
                      </div>
                    ) : megaFiles.length > 0 ? (
                      <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto">
                        {megaFiles.map((file) => (
                          <div
                            key={file.id}
                            className="bg-muted hover:bg-accent group relative flex cursor-pointer items-center gap-2 rounded-lg p-2 pr-8 transition-colors"
                            onClick={() => {
                              toast({
                                title: "File selected",
                                description: `${file.name} selected from MEGA`,
                              });
                              setFilePopoverOpen(false);
                            }}
                          >
                            {file.isImage ? (
                              <div className="bg-background size-8 shrink-0 overflow-hidden rounded">
                                <ImageIcon className="size-full object-cover p-1" />
                              </div>
                            ) : (
                              <File className="text-muted-foreground size-5 shrink-0" />
                            )}
                            <span className="truncate text-sm">{file.name}</span>
                            <div className="text-muted-foreground absolute right-1 top-1/2 -translate-y-1/2 text-xs">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-4 text-center">No files found in your MEGA storage</p>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="mb-3 text-lg font-medium">Download from URL to MEGA</h3>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter a publicly accessible URL"
                        value={attachUrl}
                        onChange={(e) => setAttachUrl(e.target.value)}
                        disabled={isUrlUploading}
                      />
                      <Button
                        variant="secondary"
                        onClick={handleAttachUrl}
                        disabled={isUrlUploading}
                      >
                        {isUrlUploading ? "Downloading..." : "Attach"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload files and folders to enhance you conversations.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className={cn(
            "bg-primary text-primary-foreground hover:text-background hover:bg-foreground flex size-8 items-center justify-center rounded-full border border-none transition-colors",
            value ? "" : "cursor-not-allowed",
            !isLoading && "p-2"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <div className="border-primary-foreground flex items-center justify-center rounded-full border-[3px] p-2 opacity-90">
              <div className="border-primary-foreground size-3 rounded-md border-[3px]" />
            </div>
          ) : (
            <ArrowUp className="size-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
