import { Footer } from "@/components/footer";
import { FrameHighlight } from "@/components/frame-highlight";
import { GoBackButton } from "@/components/go-back-button";
import { Separator } from "@/components/ui/separator";
import { ContainerWrapper } from "@/components/wrappers";
import { MoveLeft } from "lucide-react";

export default function RootNotFound() {
  return (
    <div className="relative flex h-screen flex-col">
      <div className="grid-background-effect" />
      <div className="light-background-effect" />

      <ContainerWrapper className="flex-1">
        <div className="grid size-full place-content-center gap-4 font-mono max-sm:place-items-start sm:text-center">
          <p className="text-2xl font-bold sm:text-4xl">
            <FrameHighlight>Not Found</FrameHighlight>
          </p>
          <p className="text-muted-foreground">
            The page you're looking for does not exist.
          </p>

          <GoBackButton
            className="flex cursor-pointer items-center gap-2 p-0"
            variant="link"
          >
            <MoveLeft className="size-4" />
            Go back
          </GoBackButton>
        </div>
      </ContainerWrapper>

      <Separator />

      <ContainerWrapper withCane>
        <Footer />
      </ContainerWrapper>
    </div>
  );
}
