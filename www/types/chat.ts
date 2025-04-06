export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string; // Primary text content (backward compatible)
  text_response?: string; // Optional: for backward compatibility, can be removed if not needed
  image_urls?: string[]; // Updated from 'images' to 'image_ids' for Astra IDs
  reasoning?: {
    thinking: string;
    answer: string;
  }; // For reasoning responses
  media?: { type: string; url: string }[]; // For future video/audio/etc.
  reactions?: {
    likes: number;
    dislikes: number;
  }; // Existing reactions field
  timestamp?: string; // Corrected from 'times' to 'timestamp'
  model_used?: string; // Corrected from 'times' to 'timestamp'
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}