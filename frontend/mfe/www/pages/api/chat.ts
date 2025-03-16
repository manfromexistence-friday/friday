import type { NextApiRequest, NextApiResponse } from "next"
import { HfInference } from "@huggingface/inference"

const modelConfig = {
  modelId: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  maxLength: 2048,
  temperature: 0.7,
  topP: 0.95,
  repetitionPenalty: 1.1,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const token = process.env.HUGGING_FACE_TOKEN
    if (!token) {
      throw new Error("HUGGING_FACE_TOKEN is not set")
    }

    const inference = new HfInference(token)
    const { message } = req.body

    // Format the prompt for Mistral
    const formattedPrompt = `<s>[INST] ${message} [/INST]`

    const response = await inference.textGeneration({
      model: modelConfig.modelId,
      inputs: formattedPrompt,
      parameters: {
        max_length: modelConfig.maxLength,
        temperature: modelConfig.temperature,
        top_p: modelConfig.topP,
        repetition_penalty: modelConfig.repetitionPenalty,
        do_sample: true,
        num_return_sequences: 1,
      },
    })

    if (!response || !response.generated_text) {
      throw new Error("Invalid response from API")
    }

    // Clean up Mistral's response format
    const cleanResponse = response.generated_text
      .replace(formattedPrompt, "")
      .replace(/<s>|\[\/INST\]|\[INST\]|<\/s>/g, "")
      .trim()

    return res.status(200).json({ response: cleanResponse })
  } catch (error: any) {
    console.error("Chat API Error:", error)
    return res.status(500).json({ error: "Failed to generate response" })
  }
}
