"use client";

import { useThemeConfig } from "@/hooks/use-theme-config";
import { cn } from "@/lib/utils";
import { usePreferencesActions } from "@/store/preferences-store";
import { Terminal } from "lucide-react";
import React, { useState, useTransition } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

import { generateThemeRegistryItemFromThemeObject } from "@/actions/registry";
import { usePackageManager } from "@/store/preferences-store";
import { ThemeObject } from "@/types/theme";
import { toast } from "sonner";
import { CopyToClipboardButton } from "../copy-to-clipboard-button";
import { ExternalLink } from "../external-link";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export function CopyThemeCLI({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { currentPresetThemeObject } = useThemeConfig();
  const { hasCurrentPresetChanged } = useThemeConfig();

  const alertTitle = hasCurrentPresetChanged()
    ? "Use the shadcn CLI"
    : "Theme preset has not changed";
  const alertDescription = hasCurrentPresetChanged()
    ? `Make sure to generate the registry item, otherwise the command will apply the base styles for the current preset: ${currentPresetThemeObject?.label}.`
    : `This command will apply the base styles for the current preset: ${currentPresetThemeObject?.label}.`;

  return (
    <>
      {/* A Drawer trigger for smaller screens */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            className={cn("flex cursor-pointer md:hidden", className)}
            {...props}
          >
            <Terminal className="text-primary" />
            Command
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="leading-none font-semibold tracking-tight">
              Shadcn registry command
            </DrawerTitle>

            <DrawerDescription className="text-muted-foreground text-xs">
              Copy and paste the following command into your terminal. This will
              use the{" "}
              <ExternalLink
                href="https://ui.shadcn.com/docs/cli"
                className="text-primary"
                showIcon
              >
                shadcn CLI
              </ExternalLink>{" "}
              to add or update the styles in your project.{" "}
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-24">
            <Alert className="bg-muted">
              <Terminal className="h-4 w-4" />
              <AlertTitle>{alertTitle}</AlertTitle>
              <AlertDescription>{alertDescription}</AlertDescription>
            </Alert>
            <CopyThemeCLITabs />
          </div>
        </DrawerContent>
      </Drawer>

      {/* A Dialog trigger for larger screens */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className={cn("hidden cursor-pointer md:flex", className)}
            {...props}
          >
            <Terminal className="text-primary" />
            Command
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-background space-y-2 overflow-hidden rounded-lg outline-none sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="leading-none font-semibold tracking-tight">
              Shadcn registry command
            </DialogTitle>

            <DialogDescription className="text-muted-foreground text-xs">
              Copy and paste the following command into your terminal. This will
              use the{" "}
              <ExternalLink
                href="https://ui.shadcn.com/docs/cli"
                className="text-primary"
                showIcon
              >
                shadcn CLI
              </ExternalLink>{" "}
              to add or update the styles in your project.
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-muted">
            <Terminal className="h-4 w-4" />
            <AlertTitle>{alertTitle}</AlertTitle>
            <AlertDescription>{alertDescription}</AlertDescription>
          </Alert>

          <CopyThemeCLITabs />
        </DialogContent>
      </Dialog>
    </>
  );
}

function CopyThemeCLITabs() {
  const themeRegistryUrl = process.env.NEXT_PUBLIC_THEME_REGISTRY_URL;
  const themeRegistryApiUrl = process.env.NEXT_PUBLIC_THEME_REGISTRY_API_URL;

  const packageManager = usePackageManager();
  const { setPackageManager } = usePreferencesActions();
  const {
    currentThemeObject,
    currentFonts,
    currentRadius,
    hasCurrentPresetChanged,
  } = useThemeConfig();

  const [isLoading, startTransition] = useTransition();
  const [baseUrlType, setBaseUrlType] = useState<"public" | "api">("public");
  const [themeName, setThemeName] = useState(currentThemeObject.name);

  const baseUrl =
    baseUrlType === "public" ? themeRegistryUrl : themeRegistryApiUrl;
  const themeNameUrl =
    baseUrlType === "public" ? `${themeName}.json` : themeName;
  const themeRegistryItemUrl = `${baseUrl}/${themeNameUrl}`;

  const getBaseCliCommand = () => {
    const pmPrefixes = {
      npm: "npx",
      pnpm: "pnpm dlx",
      bun: "bunx",
      yarn: "yarn dlx",
    };
    const prefixPM = pmPrefixes[packageManager] || "npx";
    return `${prefixPM} shadcn@latest add `;
  };

  const fullCliCommand = `${getBaseCliCommand()} ${themeRegistryItemUrl}`;

  const generateCLICommandForCurrentThemeObject = () => {
    // Build the themeObject with the "current" tokens
    const themeObject: ThemeObject = {
      ...currentThemeObject,
      fonts: {
        ...currentThemeObject.fonts,
        ...currentFonts,
      },
      radius: currentRadius,
    };

    startTransition(async () => {
      // Since the async function is a Server Action, ir order for the toast to catch the error,
      // i had to manually create a promise and resolve/reject it based on the result of the action.
      const promise = new Promise(async (res, rej) => {
        const response =
          await generateThemeRegistryItemFromThemeObject(themeObject);
        if (response.success) res(response.data);
        else rej(response.error);
      });

      toast.promise(promise, {
        loading: "Generating theme registry item...",
        success: (name) => {
          setBaseUrlType("api");
          setThemeName(name as string);
          return `Theme registry item has been created!`;
        },
        error: (error) => {
          return error || "An error occurred";
        },
      });
    });
  };

  return (
    <>
      {hasCurrentPresetChanged() && (
        <Button
          disabled={isLoading || !hasCurrentPresetChanged()}
          onClick={generateCLICommandForCurrentThemeObject}
          className="w-full font-semibold uppercase"
        >
          Generate theme registry item
        </Button>
      )}

      <div className="flex h-fit w-full flex-col overflow-hidden rounded-lg border shadow">
        <div className="flex items-center justify-between gap-4">
          <ToggleGroup
            className="m-0 overflow-visible rounded-none border-none p-0"
            type="single"
            value={packageManager}
            onValueChange={setPackageManager}
          >
            {["npm", "pnpm", "bun", "yarn"].map((pm) => (
              <ToggleGroupItem
                key={pm}
                value={pm}
                className="text-muted-foreground h-8 p-0 px-2 font-mono text-xs shadow-none first:rounded-none last:rounded-none md:text-sm"
              >
                {pm}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <CopyToClipboardButton
            text={fullCliCommand}
            className="mr-1 size-6"
            disabled={isLoading}
          />
        </div>

        <ScrollArea className="bg-muted scrollbar-thin w-full overflow-x-auto px-2 py-2">
          <code
            className={cn(
              "font-mono text-xs whitespace-nowrap md:text-sm",
              isLoading && "pointer-events-none",
            )}
          >
            <span>{getBaseCliCommand()}</span>
            <span
              className={cn(
                "transition-all",
                isLoading && "text-primary animate-pulse",
              )}
            >
              {themeRegistryItemUrl}
            </span>
          </code>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
}
