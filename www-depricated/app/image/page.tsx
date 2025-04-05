"use client"; // Mark this as a Client Component since it uses browser APIs and state

import { useState } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp-image-generation",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: ["image", "text"],
  responseMimeType: "text/plain",
};

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedText(null);
    setGeneratedImage(null);
    setError(null);

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage(prompt);

      const candidates = result.response.candidates;

      if (!candidates || candidates.length === 0) {
        setError("No response from the API.");
        setLoading(false);
        return;
      }

      for (const candidate of candidates) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            // Handle image data (base64)
            const imageDataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            setGeneratedImage(imageDataUrl);
          } else if (part.text) {
            // Handle text data
            setGeneratedText(part.text);
          }
        }
      }

      if (!generatedText && !generatedImage) {
        setError("No text or image generated.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-full h-full overflow-x-hidden overflow-y-auto p-10 pt-24">
      <h1>Generative AI Demo</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          fontSize: "16px",
        }}
      />
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: loading ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>{error}</p>
      )}

      {generatedText && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Text:</h2>
          <p>{generatedText}</p>
        </div>
      )}

      {generatedImage && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Image:</h2>
          <img
            src={generatedImage}
            alt="Generated content"
            style={{ maxWidth: "100%", borderRadius: "5px" }}
          />
        </div>
      )}
    </div>
  );
}