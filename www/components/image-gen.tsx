"use client";

import React, { useState, useEffect } from "react";

interface ImageGenResponse {
  text: string;
  image: string;
  model_used: string;
  file_path: string;
}

export default function ImageGen({ content }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const samplePrompt = content;

  const generateImage = async () => {
    setIsLoading(true);
    setImageUrl(null);
    setResponseText("");
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
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data: ImageGenResponse = await response.json();
      if (!data.image) {
        throw new Error("No image generated");
      }

      setImageUrl(data.image);
      setResponseText(data.text || "Image generated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically generate the image on component mount
  useEffect(() => {
    generateImage();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto my-4 p-4 border rounded-lg shadow-lg bg-white">
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
        {isLoading ? "Generating..." : "Regenerate Image"}
      </button>

      {isLoading && (
        <div className="text-center text-gray-500">Generating image...</div>
      )}

      {error && (
        <div className="text-center text-red-500 mb-4">{error}</div>
      )}

      {responseText && (
        <div className="mb-4 text-gray-700">
          <p>{responseText}</p>
        </div>
      )}

      {imageUrl && (
        <div className="mt-4">
          <img
            src={imageUrl}
            alt="Generated Image"
            className="w-full h-auto rounded-lg shadow-md max-h-[60vh] object-contain"
            onError={() => setError("Failed to load image")}
          />
        </div>
      )}
    </div>
  );
}
