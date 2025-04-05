"use client";

import { useState } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import axios from "axios";

const GOOGLE_API_KEY = "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0"; // Google Generative AI API key
const ZIPPYSHARE_KEY1 = "G4RRKadRUna95gWJ2LXCIq8Vv0HoiK8p3MuYLw2IvxS58CJ4nFjeK7PT6YaCXCFT"; // Your Zippyshare API key1
const ZIPPYSHARE_KEY2 = "2n3yVvUBmO1KYVJUFGWHFcJ68VBDn105yCe12o6OLa3FAdxnPDnjEqPnbNe63SHE"; // Replace with your actual key2 (64 chars)

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

interface AuthResponse {
  data: { access_token: string; account_id: string };
  _status: string;
  _datetime: string;
}

const getZippyshareAuth = async (): Promise<{ accessToken: string; accountId: string }> => {
  try {
    const response = await axios.post<AuthResponse>(
      "https://www.zippyshare.cloud/api/v2/authorize",
      { key1: ZIPPYSHARE_KEY1, key2: ZIPPYSHARE_KEY2 },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Auth response:", response.data); // Debug log
    if (response.data._status === "success" && response.data.data.access_token && response.data.data.account_id) {
      return {
        accessToken: response.data.data.access_token,
        accountId: response.data.data.account_id,
      };
    }
    throw new Error("Invalid auth response");
  } catch (err) {
    console.error("Detailed auth error:", err.response?.data || err.message);
    throw new Error("Failed to authenticate with Zippyshare: " + (err.message || "Network error"));
  }
};

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToZippyshare = async (base64Data: string, mimeType: string) => {
    try {
      const { accessToken, accountId } = await getZippyshareAuth();
      const byteString = atob(base64Data);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: mimeType });
      const formData = new FormData();
      formData.append("access_token", accessToken);
      formData.append("account_id", accountId);
      formData.append("upload_file", blob, "generated-image");

      const response = await axios.post(
        "https://www.zippyshare.cloud/api/v2/file/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Upload response:", response.data); // Debug log
      whole
      if (response.data._status === "success" && response.data.data?.[0]?.url) {
        return response.data.data[0].url;
      }
      throw new Error("Upload failed: " + (response.data.response || "Unknown error"));
    } catch (err) {
      console.error("Detailed upload error:", err.response?.data || err.message);
      throw err;
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedText(null);
    setGeneratedImageUrl(null);
    setError(null);

    try {
      const chatSession = model.startChat({ generationConfig, history: [] });
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
            const { data: base64Data, mimeType } = part.inlineData;
            const imageUrl = await uploadToZippyshare(base64Data, mimeType);
            setGeneratedImageUrl(imageUrl);
          } else if (part.text) {
            setGeneratedText(part.text);
          }
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred while generating or uploading content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-full h-full overflow-x-hidden overflow-y-auto p-10 pt-24">
      <h1>Generative AI Demo with Zippyshare</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        style={{ width: "100%", padding: "10px", marginBottom: "20px", fontSize: "16px" }}
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

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {generatedText && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Text:</h2>
          <p>{generatedText}</p>
        </div>
      )}

      {generatedImageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Image (Stored on Zippyshare):</h2>
          <img src={generatedImageUrl} alt="Generated content" style={{ maxWidth: "100%", borderRadius: "5px" }} />
          <p>
            Image URL: <a href={generatedImageUrl} target="_blank" rel="noopener noreferrer">{generatedImageUrl}</a>
          </p>
        </div>
      )}
    </div>
  );
}