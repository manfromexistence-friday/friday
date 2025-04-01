"use client";

import React, { useState, useEffect } from "react";
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
  const [responseText, setResponseText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const storageKey = `imageData_${message.id || Date.now()}`;

  useEffect(() => {
    const loadImages = async () => {
      if (!message) {
        setError("No message data provided");
        setLoading(false);
        return;
      }

      const textContent =
        typeof message.content === "string" && message.content.trim()
          ? message.content
          : "No meaningful response provided.";
      setResponseText(textContent);

      if (!message.image_ids || message.image_ids.length === 0) {
        setImageDataUrls([]);
        setLoading(false);
        return;
      }

      const cachedImages = localStorage.getItem(storageKey);
      if (cachedImages) {
        setImageDataUrls(JSON.parse(cachedImages));
        setLoading(false);
        return;
      }

      setLoading(true);
      const imageIds = message.image_ids.filter((id) => id);

      if (imageIds.length === 0) {
        setImageDataUrls([]);
        setLoading(false);
        return;
      }

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

        setImageDataUrls(fetchedImages);
        localStorage.setItem(storageKey, JSON.stringify(fetchedImages));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while loading images");
        setImageDataUrls([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [message.id, message.image_ids, storageKey]); // Removed message.content from dependencies

  return (
    <div className="w-full">
      {responseText && (
        <div className="text-muted-foreground hover:text-primary text-sm">
          <p>{responseText}</p>
        </div>
      )}

      {error ? (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid w-full auto-rows-auto grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <Card className="w-full overflow-hidden">
              <CardContent className="p-0">
                <AspectRatio ratio={1 / 1}>
                  <Skeleton className="size-full rounded-none" />
                </AspectRatio>
              </CardContent>
            </Card>
          ) : imageDataUrls.length > 0 ? (
            imageDataUrls.map((dataUrl, index) => (
              <Card
                key={index}
                className={cn("w-full max-w-[100vw] overflow-hidden", "border-border")}
              >
                <CardContent className="w-full overflow-hidden p-0">
                  <AspectRatio ratio={1 / 1}>
                    <div className="relative size-full overflow-hidden">
                      <Image
                        src={dataUrl}
                        alt={`Generated Image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-all hover:scale-105"
                        onError={() => setError(`Failed to load image ${index + 1}`)}
                        priority={index === 0}
                      />
                    </div>
                  </AspectRatio>
                </CardContent>
                <CardFooter className="bg-muted/50 text-muted-foreground mt-1 p-2 text-xs">
                  Image {index + 1}
                </CardFooter>
              </Card>
            ))
          ) : null}
        </div>
      )}
    </div>
  );
}