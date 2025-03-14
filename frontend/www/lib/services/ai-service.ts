const API_URL = 'https://friday-backend.vercel.app'

export const aiService = {
  async generateResponse(question: string, model: string = "gemini-2.0-flash") {
    try {
      console.log('Sending request to:', `${API_URL}/api/ask`)
      
      const response = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
          question,
          model
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