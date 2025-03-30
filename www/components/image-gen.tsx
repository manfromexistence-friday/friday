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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadImages = async () => {
      if (!message) {
        setError("No message data provided");
        setLoading(false);
        return;
      }

      setResponseText(message.content || "Image generated successfully.");

      if (message.images && message.images.length > 0) {
        const imageRefs = message.images
          .filter((img) => img && img.url && img.mime_type)
          .map((img) => ({
            ref: img.url, // Now contains just the image ID
            mime_type: img.mime_type,
          }));

        if (imageRefs.length === 0) {
          setError("No valid images found in the message");
          setLoading(false);
          return;
        }

        try {
          const fetchedImages = await Promise.all(
            imageRefs.map(async ({ ref, mime_type }) => {
              // Use the ref directly as the imageId
              const imageId = ref;
              if (!imageId) {
                throw new Error("Empty image ID");
              }

              // Fetch image data from Next.js API route
              const response = await fetch(`/api/get_image/${imageId}`);
              if (!response.ok) {
                throw new Error(`Failed to fetch image ${imageId}: ${response.statusText}`);
              }

              const data = await response.json();
              if (data.error) {
                throw new Error(data.error);
              }

              // Convert base64 to data URL
              return `data:${mime_type};base64,${data.image}`;
            })
          );

          setImageDataUrls(fetchedImages);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred while loading images");
        }
      } else {
        setError("No images provided in the message");
      }
      setLoading(false);
    };

    setLoading(true);
    loadImages();
  }, [message]);

  alert(JSON.stringify(message));

  return (
    <div className="w-full space-y-4">
      {responseText && (
        <div className="text-muted-foreground text-sm">
          <p>{responseText}</p>
        </div>
      )}

      {error ? (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="mt-4 grid w-full auto-rows-auto grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <Card className="w-full overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[300px]" />
              </CardHeader>
              <CardContent className="p-0">
                <AspectRatio ratio={1 / 1}>
                  <Skeleton className="size-full rounded-none" />
                </AspectRatio>
              </CardContent>
            </Card>
          ) : (
            imageDataUrls.map((dataUrl, index) => (
              <Card
                key={index}
                className={cn("w-full max-w-[100vw] overflow-hidden md:min-w-[300px]", "border-border")}
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
          )}
        </div>
      )}
    </div>
  );
}