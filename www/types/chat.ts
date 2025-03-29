export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string; // Primary text content (backward compatible)
  images?: { url: string; mime_type: string }[]; // For image generation, renamed 'image' to 'url'
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
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}
