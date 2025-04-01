"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { Message } from "@/types/chat";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ImageGenProps {
  message: Message & { id?: string };
}

export default function ImageGen({ message }: ImageGenProps) {
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Use a ref to cache image URLs by message.id
  const imageCache = useRef<Map<string, string[]>>(new Map());

  useEffect(() => {
    const loadImagesAndChapters = async () => {
      if (!message) {
        setError("No message data provided");
        setChapters([]);
        setImageDataUrls([]);
        return;
      }

      const textResponse =
        typeof message.content === "string" && message.content.trim()
          ? message.content
          : "No meaningful response provided.";
      
      // Split by scene markers like **scene 1**, **scene 2**, etc.
      const splitChapters = textResponse
        .split(/(?=\*\*scene \d+\*\*)/i) // Split on scene markers, keeping them in the result
        .filter((ch) => ch.trim());
      setChapters(splitChapters);

      if (!message.image_ids || message.image_ids.length === 0) {
        setImageDataUrls([]);
        return;
      }

      const imageIds = message.image_ids.filter((id) => id);
      if (imageIds.length === 0) {
        setImageDataUrls([]);
        return;
      }

      const messageId = message.id || Date.now().toString(); // Fallback if no id
      const cachedImages = imageCache.current.get(messageId);

      if (cachedImages) {
        // Use cached images if available, no loading state
        setImageDataUrls(cachedImages);
        setError(null);
        return;
      }

      // Only show loading for new, uncached messages
      setLoading(true);

      try {
        const fetchedImages = await Promise.all(
          imageIds.map(async (imageId) => {
            if (!imageId) throw new Error("Empty image ID");

            const response = await fetch(`/api/get_image/${imageId}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch image ${imageId}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            return `data:image/png;base64,${data.image}`;
          })
        );

        // Cache the fetched images
        imageCache.current.set(messageId, fetchedImages);
        setImageDataUrls(fetchedImages);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while loading images");
        setImageDataUrls([]);
      } finally {
        setLoading(false);
      }
    };

    loadImagesAndChapters();
  }, [message]); // Include the entire message object as a dependency

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="w-full overflow-hidden">
          <CardContent className="p-0">
            <AspectRatio ratio={1 / 1}>
              <Skeleton className="size-full rounded-none" />
            </AspectRatio>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    // Single image case
    if (imageDataUrls.length === 1) {
      return (
        <div className="w-full">
          <Card className={cn("w-full max-w-[100vw] overflow-hidden", "border-border")}>
            <CardContent className="w-full overflow-hidden p-0">
              <AspectRatio ratio={1 / 1}>
                <div className="relative size-full overflow-hidden">
                  <Image
                    src={imageDataUrls[0]}
                    alt="Generated Image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all hover:scale-105"
                    onError={() => setError("Failed to load image")}
                    priority
                  />
                </div>
              </AspectRatio>
            </CardContent>
            {/* <CardFooter className="bg-muted/50 text-muted-foreground mt-1 p-2 text-xs">
              Generated Image
            </CardFooter> */}
          </Card>
          {/* <div className="text-muted-foreground hover:text-primary text-sm">
            {chapters.map((chapter, index) => (
              <p key={index}>{chapter}</p>
            ))}
          </div> */}
        </div>
      );
    }

    // Multiple images case (storytelling mode)
    return chapters.map((chapter, index) => (
      <div
        key={index}
        className={`w-full ${index < chapters.length - 1 ? "mb-4" : ""}`}
      >
        {index > 0 && index - 1 < imageDataUrls.length && (
          <Card className={cn("mb-4 w-full max-w-[100vw] overflow-hidden", "border-border")}>
            <CardContent className="w-full overflow-hidden p-0">
              <AspectRatio ratio={1 / 1}>
                <div className="relative size-full overflow-hidden">
                  <Image
                    src={imageDataUrls[index - 1]}
                    alt={`Chapter ${index} Image`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all hover:scale-105"
                    onError={() => setError(`Failed to load image for chapter ${index}`)}
                    priority={index === 1}
                  />
                </div>
              </AspectRatio>
            </CardContent>
            <CardFooter className="bg-muted/50 text-muted-foreground mt-1 p-2 text-xs">
              Chapter {index} Image
            </CardFooter>
          </Card>
        )}
        <div className="text-muted-foreground hover:text-primary text-sm">
          <p>{chapter}</p>
        </div>
      </div>
    ));
  };

  return <div className="w-full">{renderContent()}</div>;
}