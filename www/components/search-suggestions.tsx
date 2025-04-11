"use client"

import { useState, useEffect } from "react"
import { Search, ArrowRight, ChevronRight, LightbulbIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useAIModelStore } from "@/lib/store/ai-model-store"
import { cn } from "@/lib/utils"

// Common search prefixes to combine with user input
const SEARCH_PREFIXES = [
  "how to", "what is", "why does", "can I", "where to", 
  "when will", "who invented", "is it possible to",
  "best way to", "differences between", "explain",
  "tutorial for", "examples of"
];

// Popular topics to combine with user input
const POPULAR_TOPICS = [
  "machine learning", "javascript", "react", "python", 
  "covid", "climate change", "blockchain", "AI",
  "chatgpt", "web development", "data science", 
  "mobile apps", "remote work", "best practices"
];

interface SearchSuggestionProps {
  inputValue: string;
  onSuggestionSelect?: (suggestion: string) => void;
}

export default function SearchSuggestions({ inputValue, onSuggestionSelect }: SearchSuggestionProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const { user } = useAuth();
  const { currentModel } = useAIModelStore();
  
  // Generate search suggestions based on input value
  useEffect(() => {
    if (!inputValue) {
      // Default popular searches
      setSuggestions([
        "how to learn programming",
        "what is machine learning",
        "javascript tutorial for beginners",
        "best practices for web development",
        "how to create a react app"
      ]);
      return;
    }
    
    const cleanInput = inputValue.trim().toLowerCase();
    const generatedSuggestions: string[] = [];
    
    // Strategy 1: Add direct completions
    if (cleanInput.length > 2) {
      // Complete the current word/phrase
      const completions = [
        `${cleanInput} tutorial`,
        `${cleanInput} examples`,
        `${cleanInput} vs other options`,
        `best ${cleanInput} resources`,
        `${cleanInput} for beginners`
      ];
      generatedSuggestions.push(...completions);
    }
    
    // Strategy 2: Use the input with common prefixes
    const prefixSuggestions = SEARCH_PREFIXES
      .filter(prefix => !cleanInput.startsWith(prefix.toLowerCase()))
      .map(prefix => `${prefix} ${cleanInput}`)
      .slice(0, 3);
    generatedSuggestions.push(...prefixSuggestions);
    
    // Strategy 3: Combine with popular topics if input is short
    if (cleanInput.split(" ").length <= 2) {
      const topicSuggestions = POPULAR_TOPICS
        .filter(topic => topic.includes(cleanInput) || cleanInput.includes(topic.split(" ")[0]))
        .map(topic => 
          cleanInput.includes(topic) ? cleanInput : `${cleanInput} ${topic}`
        )
        .slice(0, 3);
      generatedSuggestions.push(...topicSuggestions);
    }
    
    // Remove duplicates and limit
    const uniqueSuggestions = Array.from(new Set(generatedSuggestions))
      .slice(0, 5)
      .map(suggestion => suggestion.charAt(0).toUpperCase() + suggestion.slice(1));
    
    setSuggestions(uniqueSuggestions);
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
      return (
        <span className="">{suggestion}</span>
      );
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
      return (
        <span className="">{suggestion}</span>
      );
    }
    
    const beforeMatch = suggestion.slice(0, matchIndex);
    const match = suggestion.slice(matchIndex, matchIndex + inputValue.trim().length);
    const afterMatch = suggestion.slice(matchIndex + inputValue.trim().length);
    
    return (
      <span className="flex items-center">
        <span className="text-muted-foreground">{beforeMatch}</span>
        <span className="text-primary font-medium">{match}</span>
        <span className="text-primary-foreground">{afterMatch}</span>
      </span>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-2 p-2 lg-w-lg pt-0">
      <div className="w-full">
        {/* <div className="mb-2 flex items-center justify-center">
          <LightbulbIcon className="mr-2 size-4 text-yellow-500" />
          <span className="text-muted-foreground text-sm">Search suggestions</span>
        </div> */}
        
        <div className="border-border hover:border-primary flex w-full flex-col rounded-lg border bg-background/90 shadow-sm backdrop-blur-sm">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "group flex cursor-pointer items-center justify-between px-4 py-2 transition-colors hover:bg-secondary/50",
                index !== suggestions.length - 1 ? "border-b border-border/50" : ""
              )}
            >
              <div className="flex items-center">
                <Search className="mr-2 size-4" />
                {renderHighlightedSuggestion(suggestion, inputValue)}
              </div>
              <ChevronRight className="text-muted-foreground size-4 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
