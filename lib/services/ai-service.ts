const API_URL = "https://friday-backend.vercel.app"

export const aiService = {
  async generateResponse(question: string, model: string = "gemini-2.0-flash") {
    try {
      // Log request for debugging
      console.log('Sending request with model:', model)

      const response = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          question,
          model: "gemini-2.0-flash" // Using the default model from documentation
        })
      })

      // Log response status and details for debugging
      console.log('API Response Status:', response.status)
      console.log('API Response Headers:', Object.fromEntries(response.headers))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        
        throw new Error(
          `API request failed with status ${response.status}: ${errorText}`
        )
      }

      const data = await response.json()
      
      if (!data || !data.response) {
        throw new Error('Invalid response format from API')
      }

      return data.response
    } catch (error) {
      console.error('Error calling AI service:', error)
      if (error instanceof Error) {
        throw new Error(`AI Service Error: ${error.message}`)
      }
      throw new Error('Unknown error occurred while calling AI service')
    }
  }
}