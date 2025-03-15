const API_URL = 'https://friday-backend.vercel.app';

// Interface for AI model type
export interface AIModel {
  value: string;
  label: string;
}

// AI service with authentication and session management
export const aiService = {
  currentModel: "gemini-2.0-flash" as string, // Default model with type assertion
  authToken: null as string | null, // Store Firebase ID token

  // Set the current AI model
  setModel(model: string): void {
    this.currentModel = model || "gemini-2.0-flash";
  },

  // Set the authentication token (called after user login)
  setAuthToken(token: string): void {
    this.authToken = token;
  },

  // Set user's custom API key via the backend
  async setApiKey(apiKey: string): Promise<any> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }
    try {
      const response = await fetch(`${API_URL}/api_key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken,
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000',
        },
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Key Error:', errorText);
        throw new Error(`Failed to set API key: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting API key:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  },

  // Generate a response by creating a session and adding a message
  async generateResponse(question: string): Promise<string> {
    try {
      if (!this.authToken) {
        throw new Error('Not authenticated');
      }
      const model = this.currentModel;
      const sessionUrl = `${API_URL}/api/${model}/new`;
      console.log('Creating session at:', sessionUrl);

      // Step 1: Create a new session
      const sessionResponse = await fetch(sessionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken,
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000',
        },
      });

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.error('Session Creation Error:', errorText);
        throw new Error(`Failed to create session: ${errorText}`);
      }

      const sessionData = await sessionResponse.json();
      const sessionId: string = sessionData.session_id;

      // Step 2: Add message to the session
      const messageUrl = `${API_URL}/api/${model}/${sessionId}/message`;
      console.log('Sending message to:', messageUrl);

      const messageResponse = await fetch(messageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken,
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000',
        },
        body: JSON.stringify({ question }),
      });

      if (!messageResponse.ok) {
        const errorText = await messageResponse.text();
        console.error('API Error:', errorText);
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await messageResponse.json();
      if (!data || !data.response) {
        throw new Error('Invalid response format from API');
      }

      return data.response as string;
    } catch (error) {
      console.error('Error calling AI service:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  },
};

// const API_URL = 'https://friday-backend.vercel.app'

// // Add interface for AI model type
// export interface AIModel {
//   value: string
//   label: string
// }

// // Add context to manage selected AI model
// export const aiService = {
//   currentModel: "gemini-2.0-flash", // Default model

//   setModel(model: string) {
//     this.currentModel = model || "gemini-2.0-flash"
//   },

//   async generateResponse(question: string) {
//     try {
//       const model = this.currentModel
//       const url = `${API_URL}/api/${model}`
//       console.log('Sending request to:', url)
      
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//           'Origin': 'http://localhost:3000'
//         },
//         body: JSON.stringify({
//           question,
//           model // Include selected model in request
//         })
//       })

//       if (!response.ok) {
//         const errorText = await response.text()
//         console.error('API Error:', errorText)
//         throw new Error(`API request failed: ${errorText}`)
//       }

//       const data = await response.json()
      
//       if (!data || !data.response) {
//         throw new Error('Invalid response format from API')
//       }

//       return data.response
//     } catch (error) {
//       console.error('Error calling AI service:', error)
//       throw error instanceof Error ? error : new Error('Unknown error occurred')
//     }
//   }
// }

// const API_URL = 'https://friday-backend.vercel.app'

// export const aiService = {
//   async generateResponse(question: string, model: string = "gemini-2.0-flash") {
//     try {
//       const url = `${API_URL}/api/${model}`
//       console.log('Sending request to:', url)
      
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//           'Origin': 'http://localhost:3000' // Adjust if needed for your frontend
//         },
//         body: JSON.stringify({
//           question // Only send the question, model is in the URL
//         })
//       })

//       if (!response.ok) {
//         const errorText = await response.text()
//         console.error('API Error:', errorText)
//         throw new Error(`API request failed: ${errorText}`)
//       }

//       const data = await response.json()
      
//       if (!data || !data.response) {
//         throw new Error('Invalid response format from API')
//       }

//       return data.response
//     } catch (error) {
//       console.error('Error calling AI service:', error)
//       throw error instanceof Error ? error : new Error('Unknown error occurred')
//     }
//   }
// }

// const API_URL = 'https://friday-backend.vercel.app'

// export const aiService = {
//   async generateResponse(question: string, model: string = "gemini-2.0-flash") {
//     try {
//       console.log('Sending request to:', `${API_URL}/api/ask`)
      
//       const response = await fetch(`${API_URL}/api/ask`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//           'Origin': 'http://localhost:3000'
//         },
//         body: JSON.stringify({
//           question,
//           model
//         })
//       })

//       if (!response.ok) {
//         const errorText = await response.text()
//         console.error('API Error:', errorText)
//         throw new Error(`API request failed: ${errorText}`)
//       }

//       const data = await response.json()
      
//       if (!data || !data.response) {
//         throw new Error('Invalid response format from API')
//       }

//       return data.response
//     } catch (error) {
//       console.error('Error calling AI service:', error)
//       throw error instanceof Error ? error : new Error('Unknown error occurred')
//     }
//   }
// }