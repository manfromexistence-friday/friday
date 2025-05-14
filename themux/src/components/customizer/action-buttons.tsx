"use client";

import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import { ModeSwitcher } from "../mode-switcher";
import { TooltipWrapper } from "../tooltip-wrapper";
import { Separator } from "../ui/separator";
import { ContrastChecker } from "./contrast-checker";
import { CopyCodeButtonDialog } from "./copy-code-button-dialog";
import { CopyThemeCLI } from "./copy-theme-cli";
import { CustomizerSettings } from "./customizer-settings";
import { ResetButton } from "./reset-button";

interface ActionButtonsProps extends ComponentProps<"section"> {
  className?: string;
}

export function ActionButtons({ className }: ActionButtonsProps) {
  return (
    <div
      className={cn(
        "@container flex min-h-0 w-full flex-wrap items-center justify-between gap-2",
        className,
      )}
    >
      <section className="flex grow items-center gap-2">
        <TooltipWrapper label="View generated code" asChild>
          <CopyCodeButtonDialog
            size="sm"
            className="flex-2"
            variant="default"
          />
        </TooltipWrapper>
        <TooltipWrapper label="View shadcn CLI registry command" asChild>
          <CopyThemeCLI size="sm" variant="outline" className="flex-1" />
        </TooltipWrapper>
      </section>

      <Separator
        orientation="vertical"
        className="hidden min-h-6 @xl:inline-flex"
      />

      <section className="flex items-center justify-between gap-2 @max-[375px]:w-full">
        <TooltipWrapper label="Options to reset tokens" asChild>
          <ResetButton size="sm" variant="ghost" />
        </TooltipWrapper>

        <div className="@md:hidden">
          <TooltipWrapper label="Toggle light/dark" asChild>
            <ModeSwitcher />
          </TooltipWrapper>
        </div>

        <TooltipWrapper label="Check contrast ratio" asChild>
          <ContrastChecker />
        </TooltipWrapper>

        {/* TODO: Import CSS variables button */}
        {/* <TooltipWrapper label="Bring your CSS variables" asChild>
          <Button size="sm" variant="ghost" disabled>
            <FileCode2 />
            <span className="hidden @xl:inline-flex">Import</span>
            <span className="sr-only">Import CSS variables</span>
          </Button>
        </TooltipWrapper> */}

        <TooltipWrapper label="Configure the customizer" asChild>
          <CustomizerSettings variant="ghost" />
        </TooltipWrapper>
      </section>
    </div>
  );
}
