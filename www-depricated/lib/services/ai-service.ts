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
  text_responses: string[]; // Updated to match Flask's array response
  image_ids: string[];      // Updated to use image_ids instead of images array
  model_used: string;
}

// Interface for standard response
interface StandardResponse {
  response: string;
  model_used: string;
}

export const aiService = {
  currentModel: "gemini-2.0-flash-exp-image-generation", // Default model

  setModel(model: string) {
    this.currentModel = model || "gemini-2.0-flash-exp-image-generation";
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
          question: imageGenModels.has(model) ? undefined : question,
          prompt: imageGenModels.has(model) ? question : undefined,
          model,
        }),
      });

      // Handle non-OK responses for image generation specially
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        
        // Check if this is a "no images generated" error for image generation models
        if (imageGenModels.has(model)) {
          try {
            const errorData = JSON.parse(errorText);
            
            // Add debug logging to see what's in the error data
            console.log('Parsed error data:', errorData);
            
            // Check for "No images generated" specific error format
            // Note: some APIs explicitly include an "error" field with "No images generated" message
            // Define interfaces for error handling
            interface ErrorData {
              error?: string;
              text_responses?: string[];
              model_used?: string;
            }

            if ((errorData.error === "No images generated" || 
               (errorData.text_responses && errorData.text_responses.some((t: string) => t.includes("No images generated")))) && 
              errorData.model_used) {
              console.log('No images generated error detected, converting to text-only response');
              return {
              text_responses: Array.isArray(errorData.text_responses) 
                ? errorData.text_responses 
                : [errorData.error || "No images could be generated"],
              image_ids: [],
              model_used: errorData.model_used || model
              } as ImageGenResponse;
            }
            
            // More general case - if we have text_responses and model_used
            if (errorData.text_responses && errorData.model_used) {
              console.log('Error contains text_responses, converting to text-only response');
              return {
                text_responses: Array.isArray(errorData.text_responses) 
                  ? errorData.text_responses 
                  : ["No images could be generated"],
                image_ids: [],
                model_used: errorData.model_used || model
              };
            }
          } catch (parseErr) {
            // If we can't parse the error as JSON, continue with normal error handling
            console.error('Failed to parse error response:', parseErr);
          }
        }
        
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (imageGenModels.has(model)) {
        const imageData = data as ImageGenResponse;
        // Ensure text_responses is an array, with a fallback if missing
        const textResponses = Array.isArray(imageData.text_responses)
          ? imageData.text_responses
          : ["No text response provided"];

        // Always return ImageGenResponse object structure, even when no images are available
        const responseObject: ImageGenResponse = {
          text_responses: textResponses,
          image_ids: imageData.image_ids || [],
          model_used: imageData.model_used || model,
        };
        
        // Log when no images were generated but still returning the response object
        if (!imageData.image_ids || imageData.image_ids.length === 0) {
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