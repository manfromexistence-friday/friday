# Friday AI Chat Integration
> A powerful AI chat interface using Next.js and Flask backend

## Overview
Friday AI Chat is a modern web application that leverages multiple AI models for natural language processing and chat interactions.

## Backend API
Base URL: `https://friday-backend.vercel.app`

### Endpoints
```http
POST /api/ask
Content-Type: application/json

{
    "question": "string",
    "model": "string"
}

Response:
{
    "response": "string",
    "model_used": "string"
}
```

## Available Models
We support multiple AI models for different use cases:
- `gemini-2.0-flash` (Default) - Fast response model
- `gemini-2.0-flash-lite` - Lightweight version
- `gemini-2.0-pro-exp-02-05` - Experimental pro
- `gemini-2.0-flash-thinking-exp-01-21` - Enhanced thinking
- `gemini-2.0-flash-exp` - Experimental features
- `learnlm-1.5-pro-experimental` - Learning model
- `gemini-1.5-pro` - Stable release
- `gemini-1.5-flash` - Quick response
- `gemini-1.5-flash-8b` - 8B parameter version

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd your-project

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=https://friday-backend.vercel.app
```

## Development

### File Structure
```
src/
├── components/
│   ├── Chat/
│   │   ├── index.tsx
│   │   └── styles.module.css
│   └── ModelSelector/
├── types/
│   └── models.ts
├── services/
│   └── api.ts
└── pages/
    └── index.tsx
```

### Type Definitions
```typescript
type AIModel = typeof AI_MODELS[number];

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    model?: string;
}
```

## License
MIT License

---

Made with ❤️ by Your Team