import { Metadata } from "next";

import {
  CustomizerSidebar,
  CustomizerSidebarToggle,
} from "@/components/customizer/customizer-sidebar";
import { RandomizeButton } from "@/components/customizer/randomize-button";
import { ExternalLink } from "@/components/external-link";
import { GitHub } from "@/components/icons/github";
import { ModeSwitcher } from "@/components/mode-switcher";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContainerWrapper } from "@/components/wrappers";
import { MainNavigation, MobileNavigation } from "./navigation";

export const metadata: Metadata = {
  title: {
    default: "shadcn/ui themes",
    template: "%s | themux",
  },
};

const SIDEBAR_WIDTH = "21rem";

export default async function ShadcnThemesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={true}
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
        }}
      >
        <CustomizerSidebar variant="inset" />

        <SidebarInset className="relative isolate max-h-svh overflow-hidden peer-data-[variant=inset]:max-h-[calc(100svh-1rem)]">
          <header className="isolate z-20 flex shrink-0 items-center gap-2 border-b md:z-10">
            <ContainerWrapper className="flex items-center justify-between">
              <div className="flex h-14 w-full items-center gap-2">
                <div className="inline-flex">
                  <CustomizerSidebarToggle />
                </div>

                <MainNavigation />
              </div>

              <div className="flex items-center justify-center">
                <TooltipWrapper label="Generate random theme" asChild>
                  <RandomizeButton />
                </TooltipWrapper>
                <ModeSwitcher />
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="group/toggle"
                >
                  <ExternalLink href="https://github.com/llanesluis/themux">
                    <GitHub />
                  </ExternalLink>
                </Button>

                <MobileNavigation />
              </div>
            </ContainerWrapper>
          </header>

          <ScrollArea className="relative z-10 flex h-full flex-col overflow-hidden">
            {children}
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
