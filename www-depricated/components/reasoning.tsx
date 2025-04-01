"use client";

import React, { useState, useEffect, useCallback } from "react";

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

  // Wrap the fetchReasoning function in useCallback
  const fetchReasoning = useCallback(async () => {
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
  }, [sampleQuestion]); // Add sampleQuestion as dependency

  // Now useEffect correctly depends on a stable function reference
  useEffect(() => {
    fetchReasoning();
  }, [fetchReasoning]);

  return (
    <div className="mx-auto my-4 w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-lg border bg-white p-4 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Standalone Reasoning Demo</h2>
      <p className="mb-4 text-sm text-gray-600">
        <span className="font-semibold">Question:</span>{" "}
        <span className="italic">{sampleQuestion}</span>
      </p>
      <button
        onClick={fetchReasoning}
        disabled={isLoading}
        className={`mb-4 rounded-lg px-4 py-2 font-semibold text-white ${
          isLoading ? "cursor-not-allowed bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? "Processing..." : "Regenerate Reasoning"}
      </button>

      {isLoading && (
        <div className="text-center text-gray-500">Generating reasoning...</div>
      )}

      {error && <div className="mb-4 text-center text-red-500">{error}</div>}

      {thinking && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Thinking Process:</h3>
          <p className="whitespace-pre-wrap text-gray-700">{thinking}</p>
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