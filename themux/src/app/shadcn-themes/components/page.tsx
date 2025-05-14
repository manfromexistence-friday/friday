import { Metadata } from "next";

import { AccordionDemo } from "@/components/demos/components-demo/accordion-demo";
import { AlertDemo } from "@/components/demos/components-demo/alert-demo";
import { AlertDialogDemo } from "@/components/demos/components-demo/alert-dialog-demo";
import { AspectRatioDemo } from "@/components/demos/components-demo/aspect-ratio-demo";
import { AvatarDemo } from "@/components/demos/components-demo/avatar-demo";
import { BadgeDemo } from "@/components/demos/components-demo/badge-demo";
import { BreadcrumbDemo } from "@/components/demos/components-demo/breadcrumb-demo";
import { ButtonDemo } from "@/components/demos/components-demo/button-demo";
import { CalendarDemo } from "@/components/demos/components-demo/calendar-demo";
import { CardDemo } from "@/components/demos/components-demo/card-demo";
import { CarouselDemo } from "@/components/demos/components-demo/carousel-demo";
import { ChartDemo } from "@/components/demos/components-demo/chart-demo";
import { CheckboxDemo } from "@/components/demos/components-demo/checkbox-demo";
import { CollapsibleDemo } from "@/components/demos/components-demo/collapsible-demo";
import { ComboboxDemo } from "@/components/demos/components-demo/combobox-demo";
import { CommandDemo } from "@/components/demos/components-demo/command-demo";
import { ComponentWrapper } from "@/components/demos/components-demo/component-wrapper";
import { ContextMenuDemo } from "@/components/demos/components-demo/context-menu-demo";
import { DatePickerDemo } from "@/components/demos/components-demo/date-picker-demo";
import { DialogDemo } from "@/components/demos/components-demo/dialog-demo";
import { DrawerDemo } from "@/components/demos/components-demo/drawer-demo";
import { DropdownMenuDemo } from "@/components/demos/components-demo/dropdown-menu-demo";
import { FormDemo } from "@/components/demos/components-demo/form-demo";
import { FormsDemo } from "@/components/demos/components-demo/forms-demo";
import { HoverCardDemo } from "@/components/demos/components-demo/hover-card-demo";
import { InputDemo } from "@/components/demos/components-demo/input-demo";
import { InputOTPDemo } from "@/components/demos/components-demo/input-otp-demo";
import { LabelDemo } from "@/components/demos/components-demo/label-demo";
import { MenubarDemo } from "@/components/demos/components-demo/menubar-demo";
import { NavigationMenuDemo } from "@/components/demos/components-demo/navigation-menu-demo";
import { PaginationDemo } from "@/components/demos/components-demo/pagination-demo";
import { PopoverDemo } from "@/components/demos/components-demo/popover-demo";
import { ProgressDemo } from "@/components/demos/components-demo/progress-demo";
import { RadioGroupDemo } from "@/components/demos/components-demo/radio-group-demo";
import { ResizableDemo } from "@/components/demos/components-demo/resizable-demo";
import { ScrollAreaDemo } from "@/components/demos/components-demo/scroll-area-demo";
import { SelectDemo } from "@/components/demos/components-demo/select-demo";
import { SeparatorDemo } from "@/components/demos/components-demo/separator-demo";
import { SheetDemo } from "@/components/demos/components-demo/sheet-demo";
import { SkeletonDemo } from "@/components/demos/components-demo/skeleton-demo";
import { SliderDemo } from "@/components/demos/components-demo/slider-demo";
import { SonnerDemo } from "@/components/demos/components-demo/sonner-demo";
import { SwitchDemo } from "@/components/demos/components-demo/switch-demo";
import { TableDemo } from "@/components/demos/components-demo/table-demo";
import { TabsDemo } from "@/components/demos/components-demo/tabs-demo";
import { TextareaDemo } from "@/components/demos/components-demo/textarea-demo";
import { ToggleDemo } from "@/components/demos/components-demo/toggle-demo";
import { ToggleGroupDemo } from "@/components/demos/components-demo/toggle-group-demo";
import { TooltipDemo } from "@/components/demos/components-demo/tooltip-demo";
import { ExternalLink } from "@/components/external-link";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { ContainerWrapper, SectionWrapper } from "@/components/wrappers";

export const metadata: Metadata = {
  title: "Components",
  description: "A collection of components built with shadcn/ui.",
};

export default function ComponentsPage() {
  return (
    <>
      <ContainerWrapper className="@container" withCane>
        <SectionWrapper>
          <PageHeader>
            <PageHeaderHeading>Components dump</PageHeaderHeading>
            <PageHeaderDescription>
              <span>
                The <span className="italic">totality</span> of{" "}
                <ExternalLink
                  href="https://ui.shadcn.com/docs/components/accordion"
                  showIcon
                >
                  shadcn/ui
                </ExternalLink>{" "}
                components.
              </span>
            </PageHeaderDescription>
          </PageHeader>
        </SectionWrapper>
      </ContainerWrapper>

      <Separator />

      <ContainerWrapper withCane>
        <SectionWrapper>
          <div className="@container grid flex-1 gap-4 space-y-8">
            <ComponentWrapper name="button">
              <ButtonDemo />
            </ComponentWrapper>
            <ComponentWrapper name="form">
              <FormsDemo />
            </ComponentWrapper>
            <ComponentWrapper name="calendar">
              <CalendarDemo />
            </ComponentWrapper>
            <ComponentWrapper name="chart" className="w-full">
              <ChartDemo />
            </ComponentWrapper>
            <ComponentWrapper name="input">
              <InputDemo />
            </ComponentWrapper>
            <ComponentWrapper name="input-otp">
              <InputOTPDemo />
            </ComponentWrapper>
            <ComponentWrapper name="label">
              <LabelDemo />
            </ComponentWrapper>
            <ComponentWrapper name="accordion">
              <AccordionDemo />
            </ComponentWrapper>
            <ComponentWrapper name="alert">
              <AlertDemo />
            </ComponentWrapper>
            <ComponentWrapper name="alert-dialog">
              <AlertDialogDemo />
            </ComponentWrapper>
            <ComponentWrapper name="aspect-ratio">
              <AspectRatioDemo />
            </ComponentWrapper>
            <ComponentWrapper name="avatar">
              <AvatarDemo />
            </ComponentWrapper>
            <ComponentWrapper name="badge">
              <BadgeDemo />
            </ComponentWrapper>
            <ComponentWrapper name="breadcrumb">
              <BreadcrumbDemo />
            </ComponentWrapper>
            <ComponentWrapper name="card">
              <CardDemo />
            </ComponentWrapper>
            <ComponentWrapper name="carousel">
              <CarouselDemo />
            </ComponentWrapper>
            <ComponentWrapper name="checkbox">
              <CheckboxDemo />
            </ComponentWrapper>
            <ComponentWrapper name="collapsible">
              <CollapsibleDemo />
            </ComponentWrapper>
            <ComponentWrapper name="combobox">
              <ComboboxDemo />
            </ComponentWrapper>
            <ComponentWrapper name="command">
              <CommandDemo />
            </ComponentWrapper>
            <ComponentWrapper name="context-menu">
              <ContextMenuDemo />
            </ComponentWrapper>
            <ComponentWrapper name="date-picker">
              <DatePickerDemo />
            </ComponentWrapper>
            <ComponentWrapper name="dialog">
              <DialogDemo />
            </ComponentWrapper>
            <ComponentWrapper name="drawer">
              <DrawerDemo />
            </ComponentWrapper>
            <ComponentWrapper name="dropdown-menu">
              <DropdownMenuDemo />
            </ComponentWrapper>
            <ComponentWrapper name="form">
              <FormsDemo />
              <FormDemo />
            </ComponentWrapper>
            <ComponentWrapper name="hover-card">
              <HoverCardDemo />
            </ComponentWrapper>
            <ComponentWrapper name="menubar">
              <MenubarDemo />
            </ComponentWrapper>
            <ComponentWrapper name="navigation-menu">
              <NavigationMenuDemo />
            </ComponentWrapper>
            <ComponentWrapper name="pagination">
              <PaginationDemo />
            </ComponentWrapper>
            <ComponentWrapper name="popover">
              <PopoverDemo />
            </ComponentWrapper>
            <ComponentWrapper name="progress">
              <ProgressDemo />
            </ComponentWrapper>
            <ComponentWrapper name="radio-group">
              <RadioGroupDemo />
            </ComponentWrapper>
            <ComponentWrapper name="resizable">
              <ResizableDemo />
            </ComponentWrapper>
            <ComponentWrapper name="scroll-area">
              <ScrollAreaDemo />
            </ComponentWrapper>
            <ComponentWrapper name="select">
              <SelectDemo />
            </ComponentWrapper>
            <ComponentWrapper name="separator">
              <SeparatorDemo />
            </ComponentWrapper>
            <ComponentWrapper name="sheet">
              <SheetDemo />
            </ComponentWrapper>
            <ComponentWrapper name="skeleton">
              <SkeletonDemo />
            </ComponentWrapper>
            <ComponentWrapper name="slider">
              <SliderDemo />
            </ComponentWrapper>
            <ComponentWrapper name="sonner">
              <SonnerDemo />
            </ComponentWrapper>
            <ComponentWrapper name="switch">
              <SwitchDemo />
            </ComponentWrapper>
            <ComponentWrapper name="table">
              <TableDemo />
            </ComponentWrapper>
            <ComponentWrapper name="tabs">
              <TabsDemo />
            </ComponentWrapper>
            <ComponentWrapper name="textarea">
              <TextareaDemo />
            </ComponentWrapper>
            <ComponentWrapper name="toggle">
              <ToggleDemo />
            </ComponentWrapper>
            <ComponentWrapper name="toggle-group">
              <ToggleGroupDemo />
            </ComponentWrapper>
            <ComponentWrapper name="tooltip">
              <TooltipDemo />
            </ComponentWrapper>
          </div>
        </SectionWrapper>
      </ContainerWrapper>
    </>
  );
}
