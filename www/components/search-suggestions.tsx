"use client"

import { useState, useEffect } from "react"
import { Search, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useAIModelStore } from "@/lib/store/ai-model-store"
import { cn } from "@/lib/utils"

interface SearchSuggestionProps {
  inputValue: string;
  onSuggestionSelect?: (suggestion: string) => void;
}

export default function SearchSuggestions({ inputValue, onSuggestionSelect }: SearchSuggestionProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { currentModel } = useAIModelStore();
  
  // Fetch real Google search suggestions based on input
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!inputValue || inputValue.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Request Google search suggestions via our own API to avoid CORS issues
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(inputValue.trim())}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        
        const data = await response.json();
        
        if (data?.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions.slice(0, 5));
        } else {
          // Fallback to basic suggestions if the API fails
          const fallbackSuggestions = [
            `${inputValue} how to`,
            `${inputValue} tutorial`,
            `${inputValue} examples`,
            `best ${inputValue}`,
            `${inputValue} guide`
          ];
          setSuggestions(fallbackSuggestions);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        // Simple fallback suggestions on error
        const basicSuggestions = [
          `${inputValue} how to`,
          `${inputValue} tutorial`,
          `${inputValue} examples`,
          `best ${inputValue}`,
          `${inputValue} guide`
        ];
        setSuggestions(basicSuggestions);
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce to avoid too many requests
    
    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  // Handle suggestion click - either use the callback or create a new chat
  const handleSuggestionClick = async (suggestion: string) => {
    // If parent component provided a handler, use it
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
      return;
    }
    
    // Otherwise, create a new chat
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to chat with Friday AI",
        action: {
          label: "Sign In",
          onClick: () => {
            // Handle sign in
          },
        },
        duration: 5000,
      });
      return;
    }

    try {
      const chatId = uuidv4();
      
      // Create initial message
      const initialMessage = {
        id: uuidv4(),
        content: suggestion,
        role: 'user',
        timestamp: new Date().toISOString()
      };

      // Create initial chat data
      const chatData = {
        id: chatId,
        title: suggestion.slice(0, 50) + (suggestion.length > 50 ? '...' : ''),
        messages: [initialMessage],
        model: currentModel,
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creatorUid: user.uid,
        reactions: {
          likes: {},
          dislikes: {}
        },
        participants: [user.uid],
        views: 0,
        uniqueViewers: [],
        isPinned: false
      };

      // Store chat data in Firestore
      await setDoc(doc(db, "chats", chatId), chatData);

      // Store session data for auto-submission
      sessionStorage.setItem('initialPrompt', suggestion);
      sessionStorage.setItem('selectedAI', currentModel);
      sessionStorage.setItem('chatId', chatId);
      sessionStorage.setItem('autoSubmit', 'true');

      // Navigate to chat page
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  // Function to render suggestion with the matched part highlighted
  const renderHighlightedSuggestion = (suggestion: string, inputValue: string) => {
    if (!inputValue.trim()) {
      return <span>{suggestion}</span>;
    }

    const normalizedInput = inputValue.toLowerCase().trim();
    const normalizedSuggestion = suggestion.toLowerCase();
    
    let matchIndex = normalizedSuggestion.indexOf(normalizedInput);
    
    // If the input doesn't match the beginning of the suggestion, but a word in it
    if (matchIndex === -1) {
      const words = normalizedInput.split(' ');
      for (const word of words) {
        if (word.length > 2) { // Only consider meaningful words
          matchIndex = normalizedSuggestion.indexOf(word);
          if (matchIndex !== -1) break;
        }
      }
    }
    
    if (matchIndex === -1) {
      // No match found, just show the whole suggestion
      return <span className="text-base">{suggestion}</span>;
    }
    
    const beforeMatch = suggestion.slice(0, matchIndex);
    const match = suggestion.slice(matchIndex, matchIndex + inputValue.trim().length);
    const afterMatch = suggestion.slice(matchIndex + inputValue.trim().length);
    
    return (
      <span className="flex items-center text-base">
        <span className="text-muted-foreground">{beforeMatch}</span>
        <span className="text-primary font-medium">{match}</span>
        <span>{afterMatch}</span>
      </span>
    );
  };

  return (
    <div className="w-[95%] xl:w-1/2 mx-auto">
      <div className="w-full">
        <div className="border-border flex w-full flex-col rounded-lg border bg-background/90 shadow-sm backdrop-blur-sm">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "group flex cursor-pointer items-center justify-between px-5 py-3 transition-colors hover:bg-secondary/50",
                  index !== suggestions.length - 1 ? "border-b border-border/50" : ""
                )}
              >
                <div className="flex items-center space-x-4">
                  <Search className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    {renderHighlightedSuggestion(suggestion, inputValue)}
                  </div>
                </div>
                <ChevronRight className="size-4 opacity-0 text-muted-foreground transition-opacity group-hover:opacity-100" />
              </div>
            ))
          ) : inputValue.trim().length > 1 ? (
            <div className="py-3 text-center text-muted-foreground">
              No suggestions found
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
