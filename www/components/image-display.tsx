"use client";

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageGenerationDisplayProps {
  content: string;
  isGenerating?: boolean;
}

interface ImageGenResponse {
  text: string;
  image: string;
  model_used?: string;
  error?: string;
}

// Function to extract image data from content
const extractImageData = (content: string): { text: string; imageUrl: string | null; isImageGenerationPrompt?: boolean } => {
  console.log("Extracting image data from content:", content);

  // Special case for direct "image_generation" command
  if (content.trim() === "image_generation") {
    return {
      text: "Generating image...",
      imageUrl: null,
      isImageGenerationPrompt: true
    };
  }

  // Try to parse as JSON (e.g., response from /image_generation endpoint)
  try {
    const parsed = JSON.parse(content);
    console.log("Parsed JSON content:", parsed);
    if (parsed.error) {
      return {
        text: parsed.text || parsed.error,
        imageUrl: null
      };
    }
    if (parsed.image) {
      return {
        text: parsed.text || "Image generated successfully.",
        imageUrl: parsed.image
      };
    }
  } catch (e) {
    console.log("Content is not JSON:", e);
  }
  
  // Try to extract from markdown image format
  const markdownMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch && markdownMatch[1]) {
    const imageUrl = markdownMatch[1];
    const text = content.replace(/!\[.*?\]\(.*?\)/, "").trim();
    console.log("Extracted from markdown - text:", text, "imageUrl:", imageUrl);
    return { text, imageUrl };
  }
  
  // Look for URLs directly in the content
  const urlMatch = content.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  if (urlMatch) {
    const imageUrl = urlMatch[0];
    const text = content.replace(urlMatch[0], "").trim() || "Image generated successfully.";
    console.log("Extracted from URL - text:", text, "imageUrl:", imageUrl);
    return { text, imageUrl };
  }
  
  // If the content contains a detailed description (like a scene description), treat it as a prompt for image generation
  if (content.includes("**Scene:**") || content.includes("**Central Focus:**") || content.includes("**Setting:**")) {
    console.log("Detected a detailed scene description, treating as image generation prompt");
    return {
      text: content,
      imageUrl: null,
      isImageGenerationPrompt: true
    };
  }

  console.log("No image found in content, returning text only:", content);
  return { text: content, imageUrl: null };
};

export default function ImageGenerationDisplay({ content, isGenerating = false }: ImageGenerationDisplayProps) {
  const [imageData, setImageData] = useState<{ text: string; imageUrl: string | null }>({ 
    text: "Generating image...", 
    imageUrl: null 
  });
  const [loading, setLoading] = useState(isGenerating || content.trim() === "image_generation");
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    console.log("useEffect triggered - content:", content, "isGenerating:", isGenerating);
    const extracted = extractImageData(content);
    console.log("Extracted image data:", extracted);
    
    if (extracted.imageUrl) {
      setImageData(extracted);
      setLoading(false);
      return;
    }
    
    // If the content is a prompt for image generation (either "image_generation", a detailed description, or isGenerating is true)
    if (extracted.isImageGenerationPrompt || content.trim() === "image_generation" || isGenerating) {
      setLoading(true);
      // Use the content as the prompt if it's a detailed description, otherwise use a default prompt
      const prompt = extracted.isImageGenerationPrompt ? content : "A majestic mountain landscape with a clear blue lake and snowy peaks";
      generateImage(prompt);
    } else {
      setImageData(extracted);
      setLoading(false);
    }
  }, [content, isGenerating]);

  const generateImage = async (prompt: string) => {
    try {
      console.log("Generating image with prompt:", prompt);
      const response = await fetch(`https://friday-backend.vercel.app/image_generation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.status}`);
      }

      const data: ImageGenResponse = await response.json();
      console.log("Image generation response:", data);
      
      if (data.error) {
        throw new Error(data.text || data.error);
      }

      if (!data.image) {
        throw new Error("No image in response");
      }

      setImageData({
        text: content, // Keep the original content (description) as the text
        imageUrl: data.image
      });
      setError(null);
      setImageLoaded(false);
    } catch (err) {
      console.error("Error generating image:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-generation-container w-full">
      {/* Display the text explanation */}
      {imageData.text && !loading && (
        <p className="mb-3 whitespace-pre-wrap">{imageData.text}</p>
      )}

      {/* Show loading state */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex flex-col items-center justify-center my-8 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Generating image...</p>
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* Show error message if any */}
      {error && (
        <div className="text-center text-red-500 my-4 p-3 bg-red-50 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Display the image */}
      {imageData.imageUrl && !loading && (
        <div className="mt-4 relative">
          {!imageLoaded && (
            <Skeleton className="h-[300px] w-full absolute inset-0 rounded-lg" />
          )}
          <img
            src={imageData.imageUrl}
            alt="Generated Image"
            className={`w-full h-auto rounded-lg shadow-md max-h-[60vh] object-contain ${!imageLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
            onLoad={() => {
              console.log("Image loaded successfully");
              setImageLoaded(true);
            }}
            onError={(e) => {
              console.error("Failed to load image:", imageData.imageUrl);
              e.currentTarget.style.display = 'none';
              setError("Failed to load image");
            }}
          />
        </div>
      )}

      {/* Button to regenerate image if needed */}
      {!loading && (imageData.imageUrl || error) && (
        <button
          className="mt-4 text-xs text-muted-foreground hover:text-primary underline"
          onClick={() => generateImage(content)}
        >
          Regenerate image
        </button>
      )}
    </div>
  );
}