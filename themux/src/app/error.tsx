"use client";

import { FrameHighlight } from "@/components/frame-highlight";
import { GoBackButton } from "@/components/go-back-button";
import { Button } from "@/components/ui/button";
import { ContainerWrapper } from "@/components/wrappers";
import { MoveLeft } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex h-screen flex-col">
      <div className="grid-background-effect" />
      <div className="light-background-effect" />

      <ContainerWrapper className="flex-1">
        <div className="grid size-full place-content-center gap-4 font-mono max-sm:place-items-start sm:text-center">
          <p className="text-2xl font-bold sm:text-4xl">
            <FrameHighlight>Error</FrameHighlight>
          </p>
          <p className="text-muted-foreground">An error occurred.</p>

          <GoBackButton
            className="flex cursor-pointer items-center gap-2 p-0"
            variant="link"
          >
            <MoveLeft className="size-4" />
            Go back
          </GoBackButton>

          <Button variant={"link"} onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </ContainerWrapper>
    </div>
  );
}
