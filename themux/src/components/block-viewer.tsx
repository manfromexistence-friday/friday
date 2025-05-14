"use client";

import { useFullscreen } from "@/hooks/use-fullscreen";
import { cn, getComponentName } from "@/lib/utils";
import {
  Command,
  Fullscreen,
  Maximize,
  Minimize,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import React from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ComponentErrorBoundary } from "./error-boundary";
import { ExternalLink } from "./external-link";
import { ModeSwitcher } from "./mode-switcher";
import { TooltipWrapper } from "./tooltip-wrapper";
import { Button } from "./ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type BlockViewerContext = {
  resizablePanelRef: React.RefObject<ImperativePanelHandle> | null;
};

const BlockViewerContext = React.createContext<BlockViewerContext | null>(null);

function useBlockViewer() {
  const context = React.useContext(BlockViewerContext);
  if (!context) {
    throw new Error(
      "useBlockViewer must be used within a BlockViewerProvider.",
    );
  }
  return context;
}

function BlockViewerProvider({ children }: { children: React.ReactNode }) {
  const resizablePanelRef = React.useRef<ImperativePanelHandle>(null);

  return (
    <BlockViewerContext.Provider
      value={{
        // @ts-ignore
        resizablePanelRef,
      }}
    >
      <div className="group/block-view-wrapper @container flex min-w-0 flex-col items-stretch gap-4">
        {children}
      </div>
    </BlockViewerContext.Provider>
  );
}

export function BlockViewer({
  className,
  name,
  children,
  href,
  internalUrl,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  name: string;
  href?: string;
  internalUrl?: string;
}) {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <BlockViewerProvider {...props}>
      {isFullscreen && (
        <div className="pointer-events-none fixed inset-0 z-1 backdrop-blur-md" />
      )}
      <div
        className={cn(
          "flex flex-col overflow-clip rounded-lg border shadow",
          isFullscreen
            ? "bg-background fixed inset-0 z-100 max-h-svh scale-95 shadow-2xl"
            : "overflow-clip",
        )}
      >
        <BlockViewerToolbar
          name={name}
          internalUrl={internalUrl}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />
        <BlockViewerView name={name}>{children}</BlockViewerView>
      </div>
    </BlockViewerProvider>
  );
}

function BlockViewerToolbar({
  name,
  internalUrl,
  isFullscreen,
  toggleFullscreen,
}: {
  name: string;
  internalUrl?: string;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}) {
  const { resizablePanelRef } = useBlockViewer();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <div className="w-full border-b px-4 py-3">
      <div className="flex flex-col items-center gap-4 text-xs font-medium lg:text-sm @lg:flex-row">
        <div className="flex w-full items-center justify-between gap-4">
          <span className="shrink-0 font-semibold">
            {getComponentName(name)}
          </span>

          {isFullscreen && (
            <div className="text-muted-foreground ml-auto flex items-center gap-2 text-sm">
              <span className="text-muted-foreground flex items-center gap-[0.5ch] rounded-sm border p-0.5 px-1.5 font-mono">
                <Command className="size-3" /> <kbd>+</kbd> <kbd>b</kbd>
              </span>
              <span>Toggle customizer sidebar</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <ToggleGroup
              className="border shadow-sm"
              type="single"
              defaultValue="100"
              onValueChange={(value) => {
                if (resizablePanelRef?.current) {
                  resizablePanelRef.current.resize(parseInt(value));
                }
              }}
            >
              <TooltipWrapper label="Desktop view" asChild>
                <ToggleGroupItem
                  value="100"
                  className="hidden aspect-square size-7 lg:inline-flex"
                >
                  <Monitor className="size-4" />
                </ToggleGroupItem>
              </TooltipWrapper>

              <TooltipWrapper label="Tablet view" asChild>
                <ToggleGroupItem
                  value="60"
                  className="hidden aspect-square size-7 lg:inline-flex"
                >
                  <Tablet className="size-4" />
                </ToggleGroupItem>
              </TooltipWrapper>

              <TooltipWrapper label="Mobile view" asChild>
                <ToggleGroupItem
                  value="30"
                  className="hidden aspect-square size-7 lg:inline-flex"
                >
                  <Smartphone className="size-4" />
                </ToggleGroupItem>
              </TooltipWrapper>
            </ToggleGroup>

            <div className="flex items-center">
              {isFullscreen && (
                <TooltipWrapper label="Toggle light/dark" asChild>
                  <ModeSwitcher className="size-7" />
                </TooltipWrapper>
              )}

              <TooltipWrapper
                label={isFullscreen ? "Minimize view" : "Maximize view"}
                asChild
              >
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="relative hidden size-7 lg:inline-flex"
                >
                  <div>
                    {isFullscreen ? (
                      <>
                        <span className="sr-only">Minimize view</span>
                        <Minimize />
                      </>
                    ) : (
                      <>
                        <span className="sr-only">Maximize view</span>
                        <Maximize />
                      </>
                    )}

                    <div
                      className={cn(
                        "bg-primary absolute top-0 right-0 size-1.5 rounded-full transition-opacity duration-300 ease-in-out",
                        isFullscreen
                          ? "animate-bounce opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </div>
                </Button>
              </TooltipWrapper>

              <TooltipWrapper label="Open in new tab" asChild>
                <Button size="icon" variant="ghost" className="h-7">
                  <ExternalLink href={`${baseUrl}${internalUrl}`} showIcon>
                    <span className="sr-only">Open in New Tab</span>
                    <Fullscreen className="size-4" />
                  </ExternalLink>
                </Button>
              </TooltipWrapper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockViewerView({
  name,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  name: string;
}) {
  const { resizablePanelRef } = useBlockViewer();

  return (
    <ComponentErrorBoundary name={name}>
      <div
        id={name}
        data-name={name.toLowerCase()}
        className={cn(
          "grid w-full grow gap-4 overflow-clip md:pr-1",
          className,
        )}
        {...props}
      >
        <ResizablePanelGroup direction="horizontal" className="relative z-10">
          <ResizablePanel
            ref={resizablePanelRef}
            className="bg-background relative md:aspect-auto md:border-r"
            defaultSize={100}
            minSize={30}
          >
            {children}
          </ResizablePanel>

          <ResizableHandle className="after:bg-border relative hidden w-3 bg-transparent p-0 after:absolute after:top-1/2 after:right-0 after:h-8 after:w-[6px] after:translate-x-[-1px] after:-translate-y-1/2 after:rounded-full after:transition-all hover:after:h-12 md:block" />
          <ResizablePanel defaultSize={0} minSize={0} />
        </ResizablePanelGroup>
      </div>
    </ComponentErrorBoundary>
  );
}
