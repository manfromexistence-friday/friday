// pulled from https://github.com/shadcn-ui/ui/blob/main/apps/v4/components/component-wrapper.tsx#L7
"use client";

import { ComponentErrorBoundary } from "@/components/error-boundary";
import { ExternalLink } from "@/components/external-link";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn, getComponentName } from "@/lib/utils";
import { Check, Clipboard, Expand, Globe, Terminal } from "lucide-react";
import * as React from "react";

export function ComponentWrapper({
  className,
  name,
  children,
  internalUrl,
  showUrl = true,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  name: string;
  internalUrl?: string;
  showUrl?: boolean;
}) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <ComponentErrorBoundary name={name}>
      <div
        id={name}
        data-name={name.toLowerCase()}
        className={cn(
          "@container flex w-full scroll-mt-16 flex-col overflow-clip rounded-lg border shadow",
          className,
        )}
        {...props}
      >
        <div className="border-b px-4 py-3">
          <div className="flex flex-col items-center justify-between gap-2 text-xs font-medium lg:text-sm @lg:flex-row">
            <span className="shrink-0 font-semibold">
              {getComponentName(name)}
            </span>

            <Alert className="border-primary/30 bg-primary/10 flex w-full items-center border px-4 py-1 shadow-sm @lg:max-w-1/3">
              <div className="pr-2">
                <Terminal className="size-4" />
              </div>

              <AlertTitle className="w-full font-mono text-xs text-pretty">
                {`npx shadcn@latest add `}
                <span>{name}</span>
              </AlertTitle>

              <div className="ml-auto flex items-center">
                <TooltipWrapper label="Copy command" asChild>
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    className="relative size-4 cursor-pointer p-1"
                    onClick={() =>
                      copyToClipboard(`npx shadcn@latest add ${name}`)
                    }
                  >
                    <Clipboard
                      className={cn(
                        "absolute size-4 transition duration-200",
                        isCopied ? "scale-0" : "scale-100",
                      )}
                    />
                    <Check
                      className={cn(
                        "absolute size-4 transition duration-200",
                        !isCopied ? "scale-0" : "scale-100",
                      )}
                    />
                  </Button>
                </TooltipWrapper>

                {showUrl && (
                  <TooltipWrapper label="Shadcn docs" asChild>
                    <ExternalLink
                      href={
                        internalUrl
                          ? `${baseUrl}${internalUrl}`
                          : `https://ui.shadcn.com/docs/components/${name}`
                      }
                      showIcon
                      className="size-fit cursor-pointer p-1"
                    >
                      {internalUrl ? (
                        <Expand className="size-4" />
                      ) : (
                        <Globe className="size-4" />
                      )}
                    </ExternalLink>
                  </TooltipWrapper>
                )}
              </div>
            </Alert>
          </div>
        </div>
        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-8 p-4 @5xl:flex-row @5xl:items-start",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
