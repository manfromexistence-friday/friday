const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://friday-backend.vercel.app'

export const aiService = {
  async generateResponse(question: string, model: string = "gemini-2.0-flash") {
    try {
      const response = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          question,
          model
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response from AI service')
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