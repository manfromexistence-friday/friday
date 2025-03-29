"use client";

import React, { useState, useEffect } from "react";

// Updated interface to match the backend response
interface ImageGenResponse {
  text_responses: string[];
  images: { image: string; mime_type: string }[];
  model_used: string;
  error?: string; // Optional for error cases
}

export default function ImageGen({ content }: { content: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]); // Array for multiple images
  const [responseTexts, setResponseTexts] = useState<string[]>([]); // Array for multiple text responses
  const [error, setError] = useState<string | null>(null);
  const samplePrompt = content;

  const generateImage = async () => {
    setIsLoading(true);
    setImageUrls([]);
    setResponseTexts([]);
    setError(null);

    try {
      const response = await fetch(`https://friday-backend.vercel.app/image_generation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: samplePrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate images");
      }

      const data: ImageGenResponse = await response.json();

      if (!data.images || data.images.length === 0) {
        throw new Error("No images generated");
      }

      // Extract image URLs from the response
      setImageUrls(data.images.map((img) => img.image));
      setResponseTexts(data.text_responses || ["Images generated successfully."]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically generate images on component mount
  useEffect(() => {
    generateImage();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto my-4 p-4 border rounded-lg shadow-lg bg-white overflow-y-auto overflow-x-hidden">
      <h2 className="text-2xl font-bold mb-4">Standalone Image Generation Demo</h2>
      <p className="mb-4 text-sm text-gray-600">
        <span className="font-semibold">Prompt:</span>{" "}
        <span className="italic">{samplePrompt}</span>
      </p>
      <button
        onClick={generateImage}
        disabled={isLoading}
        className={`mb-4 px-4 py-2 rounded-lg text-white font-semibold ${
          isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? "Generating..." : "Regenerate Images"}
      </button>

      {isLoading && (
        <div className="text-center text-gray-500">Generating images...</div>
      )}

      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

      {responseTexts.length > 0 && (
        <div className="mb-4 text-gray-700">
          {responseTexts.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>
      )}

      {imageUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Generated Image ${index + 1}`}
              className="w-full h-auto rounded-lg shadow-md max-h-[60vh] object-contain"
              onError={() => setError(`Failed to load image ${index + 1}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}