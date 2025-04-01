"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { Message } from "@/types/chat";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function ImageGen({ message }: { message: Message }) {
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const [responseText, setResponseText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadImages = async () => {
      if (!message) {
        setError("No message data provided");
        setLoading(false);
        return;
      }

      // Use message.content for text response, with a fallback
      const textContent = typeof message.content === "string" && message.content.trim()
        ? message.content
        : "No meaningful response provided.";
      setResponseText(textContent);

      if (message.image_ids && message.image_ids.length > 0) {
        const imageIds = message.image_ids.filter((id) => id); // Filter out null/undefined

        if (imageIds.length === 0) {
          setImageDataUrls([]);
          setLoading(false);
          return;
        }

        try {
          const fetchedImages = await Promise.all(
            imageIds.map(async (imageId) => {
              if (!imageId) {
                throw new Error("Empty image ID");
              }

              const response = await fetch(`/api/get_image/${imageId}`);
              if (!response.ok) {
                throw new Error(`Failed to fetch image ${imageId}: ${response.statusText}`);
              }

              const data = await response.json();
              if (data.error) {
                throw new Error(data.error);
              }

              // Assuming the API returns { image: base64_string }
              return `data:image/png;base64,${data.image}`; // Default to PNG since mime_type isn’t stored
            })
          );

          setImageDataUrls(fetchedImages);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred while loading images");
          setImageDataUrls([]);
        }
      } else {
        setImageDataUrls([]);
      }
      setLoading(false);
    };

    setLoading(true);
    loadImages();
  }, [message]);

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
              <CardHeader>
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="p-0">
                <AspectRatio ratio={1 / 1}>
                  <Skeleton className="size-full rounded-none" />
                </AspectRatio>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-2">
              {imageDataUrls.length > 0 ? (
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
      )}
    </div>
  );
}