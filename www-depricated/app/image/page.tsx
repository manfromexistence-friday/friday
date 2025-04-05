"use client"; // Mark this as a Client Component since it uses browser APIs and state

import { useState } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import axios from "axios";

const GOOGLE_API_KEY = "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0"; // Google Generative AI API key
const IMGBB_API_KEY = "bb9857afc7319f2d56d34ea096991d7f"; // Your ImgBB API key

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

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
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToImgBB = async (base64Data: string, mimeType: string) => {
    try {
      // Convert base64 to Blob
      const byteString = atob(base64Data);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: mimeType });

      // Prepare FormData for ImgBB
      const formData = new FormData();
      formData.append("key", IMGBB_API_KEY);
      formData.append("image", blob, "generated-image");

      // Upload to ImgBB
      const response = await axios.post("https://api.imgbb.com/1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        return response.data.data.url; // Return the ImgBB URL
      } else {
        throw new Error("ImgBB upload failed: " + response.data.error.message);
      }
    } catch (err) {
      console.error("ImgBB upload error:", err);
      throw err;
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedText(null);
    setGeneratedImageUrl(null);
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
            const { data: base64Data, mimeType } = part.inlineData;
            const imageUrl = await uploadToImgBB(base64Data, mimeType);
            setGeneratedImageUrl(imageUrl);
          } else if (part.text) {
            // Handle text data
            setGeneratedText(part.text);
          }
        }
      }

    //   if (!generatedText && !generatedImageUrl) {
    //     setError("No text or image generated.");
    //   }
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating or uploading content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-full h-full overflow-x-hidden overflow-y-auto p-10 pt-24">
      <h1>Generative AI Demo with ImgBB</h1>
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
        {loading ? "Generating & Uploading..." : "Generate"}
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

      {generatedImageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Image (Stored on ImgBB):</h2>
          <img
            src={generatedImageUrl}
            alt="Generated content"
            style={{ maxWidth: "100%", borderRadius: "5px" }}
          />
          <p>
            Image URL:{" "}
            <a href={generatedImageUrl} target="_blank" rel="noopener noreferrer">
              {generatedImageUrl}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}