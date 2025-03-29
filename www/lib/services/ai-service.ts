const API_URL = 'https://friday-backend.vercel.app';

// Add interface for AI model type
export interface AIModel {
  value: string;
  label: string;
}

// Interface for reasoning response
interface ReasoningResponse {
  thinking: string;
  answer: string;
  model_used: string;
}

// Interface for image generation response
interface ImageGenResponse {
  text_responses: string[];
  images: { image: string; mime_type: string }[];
  model_used: string;
}

// Interface for standard response
interface StandardResponse {
  response: string;
  model_used: string;
}

export const aiService = {
  currentModel: "gemini-2.5-pro-exp-03-25", // Default model

  setModel(model: string) {
    this.currentModel = model || "gemini-2.5-pro-exp-03-25";
    console.log('AI model set to:', this.currentModel);
  },

  async generateResponse(question: string): Promise<string | ImageGenResponse> {
    try {
      const model = this.currentModel;
      const imageGenModels = new Set(["gemini-2.0-flash-exp-image-generation"]);
      const reasoningModels = new Set([
        "gemini-2.5-pro-exp-03-25",
        "gemini-2.0-flash-thinking-exp-01-21",
      ]);

      let url: string;
      if (imageGenModels.has(model)) {
        url = `${API_URL}/image_generation`;
      } else if (reasoningModels.has(model)) {
        url = `${API_URL}/reasoning`;
      } else {
        url = `${API_URL}/api/${model}`;
      }
      console.log('Sending request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000',
        },
        body: JSON.stringify({
          question: imageGenModels.has(model) ? undefined : question, // Only reasoning and standard need "question"
          prompt: imageGenModels.has(model) ? question : undefined,   // Image generation uses "prompt"
          model, // Include selected model in request
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await response.json();

      if (imageGenModels.has(model)) {
        const imageData = data as ImageGenResponse;
        if (!imageData.images || imageData.images.length === 0) {
          throw new Error('No images generated');
        }
        return imageData; // Return full object for image generation
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