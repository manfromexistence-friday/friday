const API_URL = 'https://friday-backend.vercel.app'

// Add interface for AI model type
export interface AIModel {
  value: string
  label: string
}

// Add context to manage selected AI model
export const aiService = {
  currentModel: "gemini-2.0-flash", // Default model

  setModel(model: string) {
    this.currentModel = model || "gemini-2.0-flash"
  },

  async generateResponse(question: string) {
    try {
      const model = this.currentModel
      const url = `${API_URL}/api/${model}`
      console.log('Sending request to:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
          question,
          model // Include selected model in request
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`API request failed: ${errorText}`)
      }

      const data = await response.json()
      
      if (!data || !data.response) {
        throw new Error('Invalid response format from API')
      }

      return data.response
    } catch (error) {
      console.error('Error calling AI service:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }
}
