"use client";

import React, { useState, useEffect } from "react";

// Interface to match the reasoning endpoint response
interface ReasoningResponse {
  thinking: string;
  answer: string;
  model_used: string;
  error?: string; // Optional for error cases
}

export default function ReasoningDemo({ content }: { content: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const sampleQuestion = content;

  const fetchReasoning = async () => {
    setIsLoading(true);
    setThinking("");
    setAnswer("");
    setError(null);

    try {
      const response = await fetch(`https://friday-backend.vercel.app/reasoning`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: sampleQuestion }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate reasoning");
      }

      const data: ReasoningResponse = await response.json();

      if (!data.thinking || !data.answer) {
        throw new Error("Incomplete reasoning response");
      }

      setThinking(data.thinking);
      setAnswer(data.answer);
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
    <div className="w-full max-w-2xl mx-auto my-4 p-4 border rounded-lg shadow-lg bg-white overflow-y-auto overflow-x-hidden">
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
        {isLoading ? "Processing..." : "Regenerate Reasoning"}
      </button>

      {isLoading && (
        <div className="text-center text-gray-500">Generating reasoning...</div>
      )}

      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

      {thinking && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Thinking Process:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{thinking}</p>
        </div>
      )}

      {answer && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Answer:</h3>
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}