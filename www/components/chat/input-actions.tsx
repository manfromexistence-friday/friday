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
import { useEffect } from "react";
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
  onInsertText?: (text: string, type: string) => void; // Add new prop
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

  // Add state to track the active command mode
  const [activeCommandMode, setActiveCommandMode] = React.useState<string | null>(null);

  // Load active command mode from localStorage on mount
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
    // Sync the showThinking prop with the thinking-mode command
    if (showThinking && activeCommandMode !== 'thinking-mode') {
      setActiveCommandMode('thinking-mode');
      localStorage.setItem('activeCommand', 'thinking-mode');
    } else if (!showThinking && activeCommandMode === 'thinking-mode') {
      setActiveCommandMode(null);
      localStorage.removeItem('activeCommand');
    }
  }, [showThinking, activeCommandMode]);

  useEffect(() => {
    // Sync the showResearch prop with the research-mode command
    if (showResearch && activeCommandMode !== 'research-mode') {
      setActiveCommandMode('research-mode');
      localStorage.setItem('activeCommand', 'research-mode');
    } else if (!showResearch && activeCommandMode === 'research-mode') {
      setActiveCommandMode(null);
      localStorage.removeItem('activeCommand');
    }
  }, [showResearch, activeCommandMode]);

  // Modify the handleThinkingSelect function
  const enhancePrompt = async () => {
    // Check if there's text to enhance
    if (value.trim() === "") {
      toast({
        title: "No text to enhance",
        description: "Please enter some text first",
        variant: "destructive",
      });
      return;
    }

    // Show loading state
    toast({
      title: "Enhancing your prompt...",
      description: "Making your instructions clearer for the AI",
      variant: "default",
    });

    try {
      // Strip any existing command prefixes if present
      let textToEnhance = value;

      // Use the standardized prefixes without colons
      if (activeCommandMode) {
        const prefix = prefixes[activeCommandMode as keyof typeof prefixes];
        // Check for prefix + colon format
        if (value.startsWith(`${prefix}: `)) {
          textToEnhance = value.substring(`${prefix}: `.length);
        }
      }

      // Save the current model before switching
      const previousModel = aiService.currentModel;

      // Temporarily set model to gemini-2.0-flash specifically for enhancement
      aiService.setModel("gemini-2.0-flash");

      // Use gemini-2.0-flash to enhance the prompt
      const enhancementPrompt = `Please rewrite and improve the following prompt to make it clearer, more specific, and easier for an AI to understand. Focus on improving structure, specificity, and clarity. Return ONLY the improved prompt with no explanations or additional text:\n\n${textToEnhance}`;

      // Call your AI service to get the enhancement
      const response = await aiService.generateResponse(enhancementPrompt);

      // Restore the original model
      aiService.setModel(previousModel);

      // Extract the enhanced prompt from the response based on its type
      const enhancedPrompt = typeof response === 'string'
        ? response.trim()
        : response.text_response?.trim() || '';

      // More aggressively clean any colons that might appear at the end
      let cleanedPrompt = enhancedPrompt;
      while (cleanedPrompt.endsWith(':')) {
        cleanedPrompt = cleanedPrompt.slice(0, -1).trim();
      }

      // If we have an active command, prepend the appropriate prefix
      let finalText = cleanedPrompt;
      if (activeCommandMode) {
        const prefix = prefixes[activeCommandMode as keyof typeof prefixes];
        // Standardize format: prefix + colon + space (matching chat-input.tsx)
        finalText = `${prefix}: ${enhancedPrompt}`;

        // Fixing the second colon problem
        while (finalText.endsWith(':')) {
          finalText = finalText.slice(0, -1).trim();
        }

        // alert("Final text: " + finalText);

        // Pass the command mode to keep the indicator active
        if (onInsertText) {
          onInsertText(finalText, activeCommandMode);

          // Force height recalculation after text is inserted
          setTimeout(() => {
            // This will trigger the onHeightChange callback that was passed to ChatInput
            if (document.getElementById('ai-input')) {
              const event = new Event('input', { bubbles: true });
              document.getElementById('ai-input')?.dispatchEvent(event);
            }
          }, 50);
        }
      } else {
        // No command mode, just insert the enhanced text
        if (onInsertText) {
          onInsertText(finalText, "");

          // Force height recalculation after text is inserted
          setTimeout(() => {
            if (document.getElementById('ai-input')) {
              const event = new Event('input', { bubbles: true });
              document.getElementById('ai-input')?.dispatchEvent(event);
            }
          }, 50);
        }
      }

      // Show success toast
      toast({
        title: "Prompt Enhanced",
        description: (
          <div className="mt-1">
            Your prompt has been improved
            {/* <HyperText className="ml-1 text-sm">
              with enhanced AI understanding
            </HyperText> */}
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

  // First, update the prefixes object to be standardized across the component
  const prefixes = {
    'image-gen': "Image",
    'thinking-mode': "Thinking",
    'search-mode': "Search",
    'research-mode': "Research",
    'canvas-mode': "Canvas"
  };

  // Then modify handleImageSelect to use the prefix without manually adding a colon
  const handleImageSelect = async () => {
    const imageGenModel = "gemini-2.0-flash-exp-image-generation";

    // Update local state
    setLocalSelectedAI(imageGenModel);

    // Set the active command mode
    setActiveCommandMode('image-gen');
    localStorage.setItem('activeCommand', 'image-gen');

    // Directly update the zustand store
    aiService.setModel(imageGenModel);

    // Call the onAIChange prop to update parent component state
    if (onAIChange) {
      onAIChange(imageGenModel);
    }

    // Insert the text indicator consistently with a colon
    if (onInsertText) {
      onInsertText(`${prefixes['image-gen']}:`, 'image-gen');
    }

    // Store the previous model for later restoration
    localStorage.setItem("previousModel", selectedAI || "gemini-2.0-flash");

    // Update Firestore with the new model
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

    // Log confirmation for debugging
    console.log("Model switched to image generation:", imageGenModel);
  };

  const handleGoogleDriveSelect = () => {
    toast({
      title: "Google Drive integration will be available soon",
      description: "This feature is currently in development",
      variant: "default",
    });
  };

  // Update handleCanvasSelect 
  const handleCanvasSelect = () => {
    const thinkingModel = "gemini-2.0-flash-thinking-exp-01-21";
    setLocalSelectedAI(thinkingModel);

    // Set the active command mode
    setActiveCommandMode('canvas-mode');
    localStorage.setItem('activeCommand', 'canvas-mode');

    // Add text indicator consistently
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

  // Handle Search mode selection
  // Update handleSearchSelect similarly
  const handleSearchSelect = () => {
    const thinkingModel = "gemini-2.0-flash-thinking-exp-01-21";
    setLocalSelectedAI(thinkingModel);

    // Set the active command mode
    setActiveCommandMode('search-mode');
    localStorage.setItem('activeCommand', 'search-mode');

    // Add text indicator consistently
    if (onInsertText) {
      onInsertText(`${prefixes['search-mode']}:`, 'search-mode');
    }

    toast({
      title: "Switched to Search Mode",
      description: "Enhanced search capabilities activated.",
      variant: "default",
    });
  };

  // Research mode toggle with model switch
  const handleResearchToggle = async () => {
    // Toggle research mode 
    const newResearchState = !showResearch;
    onResearchToggle();

    if (newResearchState) {
      // Enable research mode
      localStorage.setItem("previousModel", localSelectedAI);
      const thinkingModel = "gemini-2.5-pro-exp-03-25";
      setLocalSelectedAI(thinkingModel);

      // Set the active command mode
      setActiveCommandMode('research-mode');
      localStorage.setItem('activeCommand', 'research-mode');

      // Add text indicator consistently
      if (onInsertText) {
        onInsertText(`${prefixes['research-mode']}:`, 'research-mode');
      }

      // Update Firestore with the new model
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
      // Disable research mode
      const prevModel = localStorage.getItem("previousModel") || "gemini-2.0-flash";
      setLocalSelectedAI(prevModel);

      // Clear the active command mode
      setActiveCommandMode(null);
      localStorage.removeItem('activeCommand');

      // Clear the input text if it starts with "Research"
      if (value && value.startsWith("Research")) {
        // We need to use a callback to pass an empty string to the parent
        if (onInsertText) {
          onInsertText("", "");  // This will clear the input
        }
      }

      // Update Firestore with the previous model
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
  // Research mode toggle with model switch
  const handleThinkingSelect = async () => {
    // Toggle research mode 
    const newResearchState = !showResearch;

    if (newResearchState) {
      // Enable research mode
      localStorage.setItem("previousModel", localSelectedAI);
      const thinkingModel = "gemini-2.0-flash-thinking-exp-01-21";
      setLocalSelectedAI(thinkingModel);

      // Set the active command mode
      setActiveCommandMode('research-mode');
      localStorage.setItem('activeCommand', 'research-mode');

      // Add text indicator consistently
      if (onInsertText) {
        onInsertText(`${prefixes['research-mode']}:`, 'research-mode');
      }

      // Update Firestore with the new model
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
      // Disable research mode
      const prevModel = localStorage.getItem("previousModel") || "gemini-2.0-flash";
      setLocalSelectedAI(prevModel);

      // Clear the active command mode
      setActiveCommandMode(null);
      localStorage.removeItem('activeCommand');

      // Clear the input text if it starts with "Research"
      if (value && value.startsWith("Research")) {
        // We need to use a callback to pass an empty string to the parent
        if (onInsertText) {
          onInsertText("", "");  // This will clear the input
        }
      }

      // Update Firestore with the previous model
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

  const handleAttachUrl = () => {
    if (attachUrl) {
      if (onUrlAnalysis) {
        onUrlAnalysis([attachUrl], "Analyze this media");
        toast({
          title: "URL submitted for analysis",
          description: attachUrl,
        });
      }
      setAttachUrl("");
      setFilePopoverOpen(false);
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
              <DialogTitle className="text-xl font-medium">Attach Files</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center gap-3 border-b p-10">
              <div className="bg-primary/10 mb-3 flex size-16 items-center justify-center rounded-full">
                <Upload className="text-primary size-8" />
              </div>
              <h3 className="text-xl font-medium">Upload files</h3>
              <p className="text-muted-foreground mb-2 text-center">
                Drag and drop files here or click to browse
              </p>

              <label>
                <Button variant="default" size="lg" className="mt-2">
                  Select files
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={isLoading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onImageUpload(file);
                        setFilePopoverOpen(false);
                      }
                    }}
                  />
                </Button>
              </label>
            </div>

            <div className="border-b p-4">
              <h3 className="mb-3 text-lg font-medium">Recent Files</h3>
              <div className="grid grid-cols-3 gap-2">
                {recentFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className="bg-muted hover:bg-accent group relative flex cursor-pointer items-center gap-2 rounded-lg p-2 pr-8 transition-colors"
                    onClick={() => {
                      toast({
                        title: "File selected",
                        description: `${file.name} selected for upload`,
                      });
                      setFilePopoverOpen(false);
                    }}
                  >
                    {file.type === "image" ? (
                      <div className="bg-background size-8 shrink-0 overflow-hidden rounded">
                        <ImageIcon className="size-full object-cover p-1" />
                      </div>
                    ) : (
                      <File className="text-muted-foreground size-5 shrink-0" />
                    )}
                    <span className="truncate text-sm">{file.name}</span>
                    <button className="text-muted-foreground hover:text-foreground absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4">
              <h3 className="mb-3 text-lg font-medium">Attach URL</h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter a publicly accessible URL"
                  value={attachUrl}
                  onChange={(e) => setAttachUrl(e.target.value)}
                />
                <Button variant="secondary" onClick={handleAttachUrl}>
                  Attach
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Research button with tooltip */}
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

        {/* Thinking button with tooltip */}
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
                  // Remove the showThinking condition for styling
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
      </div>

      <div className="flex h-full flex-row items-center">
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
