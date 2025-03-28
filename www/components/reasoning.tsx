// components/StandaloneReasoning.tsx
"use client";

import React, { useState, useEffect } from "react";

interface ReasoningResponse {
  response: string;
  image?: string; // Optional, as the reasoning endpoint may or may not return an image
}

export default function StandaloneReasoning() {
  const [isLoading, setIsLoading] = useState(false);
  const [reasoningText, setReasoningText] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sampleQuestion = "Explain the water cycle and provide a simple diagram of the process.";

  const fetchReasoning = async () => {
    setIsLoading(true);
    setReasoningText("");
    setImageUrl(null);
    setError(null);

    try {
      const response = await fetch(`https://friday-backend.vercel.app/reasoning`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: sampleQuestion }), // Changed 'prompt' to 'question'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch reasoning");
      }

      const data: ReasoningResponse = await response.json();
      if (!data.response) {
        throw new Error("No reasoning response received");
      }

      setReasoningText(data.response);
      if (data.image) {
        setImageUrl(data.image);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch reasoning on component mount
  useEffect(() => {
    fetchReasoning();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto my-4 p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Standalone Reasoning Demo</h2>
      <p className="mb-4 text-sm text-gray-600">
        <span className="font-semibold">Question:</span>{" "}
        <span className="italic">{sampleQuestion}</span>
      </p>
      <button
        onClick={fetchReasoning}
        disabled={isLoading}
        className={`mb-4 px-4 py-2 rounded-lg text-white font-semibold ${
          isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? "Fetching..." : "Refetch Reasoning"}
      </button>

      {isLoading && (
        <div className="text-center text-gray-500">Fetching reasoning...</div>
      )}

      {error && (
        <div className="text-center text-red-500 mb-4">{error}</div>
      )}

      {reasoningText && (
        <div className="mb-4 text-gray-700">
          <h3 className="text-lg font-semibold mb-2">Reasoning Output:</h3>
          <p className="whitespace-pre-wrap">{reasoningText}</p>
        </div>
      )}

      {imageUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Diagram:</h3>
          <img
            src={imageUrl}
            alt="Reasoning Diagram"
            className="w-full h-auto rounded-lg shadow-md max-h-[60vh] object-contain"
            onError={() => setError("Failed to load image")}
          />
        </div>
      )}
    </div>
  );
}