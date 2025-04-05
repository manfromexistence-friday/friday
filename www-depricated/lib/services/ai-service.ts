import { useAIModelStore } from '@/lib/store/ai-model-store'

const API_URL = 'https://friday-backend.vercel.app'

// Add interface for AI model type
export interface AIModel {
  value: string
  label: string
}

// Interface for reasoning response
interface ReasoningResponse {
  thinking: string
  answer: string
  model_used: string
}

// Interface for image generation response
interface ImageGenResponse {
  text_response: string
  image_urls: string[]
  model_used: string
}

// Interface for standard response
interface StandardResponse {
  response: string
  model_used: string
}

export const aiService = {
  // Get the current model from Zustand store
  get currentModel(): string {
    return useAIModelStore.getState().currentModel
  },

  // Update the model in Zustand store
  setModel(model: string) {
    useAIModelStore.getState().setModel(model)
  },

  async generateResponse(question: string): Promise<string | ImageGenResponse> {
    try {
      const model = this.currentModel // Now this comes from Zustand
      const imageGenModels = new Set(["gemini-2.0-flash-exp-image-generation"])
      const reasoningModels = new Set([
        "gemini-2.5-pro-exp-03-25",
        "gemini-2.0-flash-thinking-exp-01-21",
      ])

      let url: string
      if (imageGenModels.has(model)) {
        url = `${API_URL}/image_generation`
      } else if (reasoningModels.has(model)) {
        url = `${API_URL}/reasoning`
      } else {
        url = `${API_URL}/api/${model}`
      }
      console.log('Sending request to:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000',
        },
        body: JSON.stringify({
          question: imageGenModels.has(model) ? undefined : question,
          prompt: imageGenModels.has(model) ? question : undefined,
          model,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (imageGenModels.has(model)) {
        const imageData = data as ImageGenResponse;
        // Ensure text_response is a string, with a fallback if missing
        const textResponse = typeof imageData.text_response === 'string'
          ? imageData.text_response
          : "No text response provided";

        // Always return ImageGenResponse object structure
        const responseObject: ImageGenResponse = {
          text_response: textResponse,
          image_urls: imageData.image_urls || [], // Changed from image_ids to image_urls
          model_used: imageData.model_used || model,
        };
        
        // Log when no images were generated
        if (!imageData.image_urls || imageData.image_urls.length === 0) { // Changed from image_ids to image_urls
          console.log('No images generated, returning text response in object format');
        }
        
        return responseObject;
      } else if (reasoningModels.has(model)) {
        const reasoningData = data as ReasoningResponse;
        if (!reasoningData.thinking || !reasoningData.answer) {
          throw new Error('Invalid reasoning response format from API');
        }
        return `${reasoningData.thinking}\n\nAnswer: ${reasoningData.answer}`;
      } else {
        const standardData = data as StandardResponse;
        if (!standardData || !standardData.response) {
          throw new Error('Invalid response format from API');
        }
        return standardData.response;
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  },
};