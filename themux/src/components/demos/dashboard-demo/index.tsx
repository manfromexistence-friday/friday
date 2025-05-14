import { AppSidebar } from "@/components/demos/dashboard-demo/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/demos/dashboard-demo/components/chart-area-interactive";
import { DataTable } from "@/components/demos/dashboard-demo/components/data-table";
import { SectionCards } from "@/components/demos/dashboard-demo/components/section-cards";
import { SiteHeader } from "@/components/demos/dashboard-demo/components/site-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { BlockViewer } from "@/components/block-viewer";
import data from "./data.json";

export function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="relative max-h-svh overflow-hidden peer-data-[variant=inset]:max-h-[calc(100svh-1rem)]">
        <SiteHeader />
        <ScrollArea className="relative flex h-full flex-col overflow-hidden">
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardDemo() {
  return (
    <BlockViewer name="dashboard-01" internalUrl={`/dashboard`}>
      <iframe
        src={`/dashboard`}
        className="bg-background relative z-1 h-full min-h-[750px] w-full"
      />
    </BlockViewer>
  );
}
