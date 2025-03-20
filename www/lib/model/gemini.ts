import {
  GoogleGenerativeAI,
  GenerateContentRequest,
  Part,
  Tool,
  SchemaType,
} from "@google/generative-ai"

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
const genAI = new GoogleGenerativeAI(API_KEY)

export const getModel = () => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro" })

  const searchTool: Tool = {
    functionDeclarations: [
      {
        name: "search",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: { type: SchemaType.STRING, description: "The search query." },
          },
          required: ["query"],
        },
      },
    ],
  }

  return { model, searchTool }
}

export const generateResponse = async (prompt: string, useSearch: boolean = false) => {
  const { model, searchTool } = getModel()

  const parts: Part[] = [{ text: prompt }]

  const request: GenerateContentRequest = {
    contents: [{ role: 'user', parts }],
    tools: useSearch ? [searchTool] : undefined,
  }

  try {
    const result = await model.generateContent(request)
    const response = result.response

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0]
      
      if (candidate.content && candidate.content.parts) {
        let finalResponse = ""

        for (const part of candidate.content.parts) {
          if (part.functionResponse) {
            const functionResponse = part.functionResponse
            if (functionResponse.name === "search") {
              const searchResult = JSON.parse((functionResponse.response as { content: string }).content)
              console.log("Search Results:", searchResult)
              finalResponse += `\n[Search Results: ${JSON.stringify(searchResult)}]`
            }
          } else if (part.text) {
            finalResponse += part.text
          }
        }

        return finalResponse
      }
    }

    throw new Error("No valid response generated")
  } catch (error) {
    console.error("Error generating content:", error)
    throw error
  }
}