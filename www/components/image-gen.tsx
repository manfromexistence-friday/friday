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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [responseText, setResponseText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const generateImage = () => {
      if (!message) {
        setError("No message data provided");
        setLoading(false);
        return;
      }

      setResponseText(message.content || "Image generated successfully.");

      if (message.images && message.images.length > 0) {
        const validImages = message.images
          .filter((img) => img && img.url && img.mime_type)
          .map((img) => img.url);
        if (validImages.length > 0) {
          setImageUrls(validImages);
          setError(null);
        } else {
          setError("No valid images found in the message");
        }
      } else {
        setError("No images provided in the message");
      }
      setLoading(false);
    };

    setLoading(true);
    generateImage();
  }, [message]);

  return (
    <div className="w-full space-y-4">
      {/* {responseText && (
        <div className="text-muted-foreground text-sm">
          <p>{responseText}</p>
        </div>
      )} */}

      {error ? (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 min-w-full">
          {loading ? (
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[300px]" />
              </CardHeader>
              <CardContent className="p-0">
                <AspectRatio ratio={16 / 9}>
                  <Skeleton className="h-full w-full rounded-none" />
                </AspectRatio>
              </CardContent>
            </Card>
          ) : (
            imageUrls.map((url, index) => (
              <Card key={index} className={cn("overflow-hidden", "border-border")}>
                <CardContent className="p-0 min-w-[300px]">
                  <AspectRatio ratio={1 / 1}>
                    {/* Next Image component with proper dimensions */}
                    <div className="relative h-full w-full">
                      <Image
                        src={url}
                        alt={`Generated Image ${index + 1}`}
                        fill
                        className="object-cover transition-all"
                        onError={() => setError(`Failed to load image ${index + 1}`)}
                        priority={index === 0}
                      />
                    </div>
                  </AspectRatio>
                </CardContent>
                <CardFooter className="bg-muted/50 p-2 text-xs text-muted-foreground">
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