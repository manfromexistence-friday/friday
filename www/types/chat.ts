export interface Message {
  id: string;
  role: "user" | "assistant"
  content: string
  reactions?: {
    likes: number
    dislikes: number
  }
  timestamp?: string
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}
