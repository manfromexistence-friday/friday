"use client";

import React, { useState, useEffect } from "react";
import type { Message } from "@/types/chat";

export default function ImageGen({ message }: { message: Message }) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [responseText, setResponseText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      setError("No message data provided");
      return;
    }

    setResponseText(message.content || "Image loaded successfully.");

    if (message.images && message.images.length > 0) {
      const validImages = message.images
        .filter((img) => img && img.url && img.mime_type) // Filter out invalid entries
        .map((img) => img.url);
      if (validImages.length > 0) {
        setImageUrls(validImages);
      } else {
        setError("No valid images found in the message");
      }
    } else {
      setError("No images provided in the message");
    }
  }, [message]);

  return (
    <div className="mx-auto my-4 w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-lg border bg-white p-4 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Generated Images</h2>
      <p className="mb-4 text-sm text-gray-600">
        <span className="font-semibold">Model:</span>{" "}
        <span className="italic">Image generation model</span>
      </p>

      {error && <div className="mb-4 text-center text-red-500">{error}</div>}

      {responseText && (
        <div className="mb-4 text-gray-700">
          <p>{responseText}</p>
        </div>
      )}

      {imageUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Generated Image ${index + 1}`}
              className="h-auto max-h-[60vh] w-full rounded-lg object-contain shadow-md"
              onError={() => setError(`Failed to load image ${index + 1}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}