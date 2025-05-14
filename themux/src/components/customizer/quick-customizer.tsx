"use client";

import { useMounted } from "@/hooks/use-mounted";
import { useTokens } from "@/hooks/use-tokens";
import { TAILWIND_SHADES, TailwindShadeKey } from "@/lib/palettes";
import { useModesInSync } from "@/store/preferences-store";
import {
  ClipboardPaste,
  Paintbrush,
  PaintBucket,
  SquareRoundCorner,
} from "lucide-react";
import { useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import {
  AllPresetsControl,
  PasteColorControl,
  RadiusControls,
} from "./customizer-controls";
import { MemoizedTailwindV4ColorPalette } from "./tailwind-v4-palette";

export function QuickCustomizer() {
  const [shade, setShade] = useState<TailwindShadeKey>("500");
  const isMounted = useMounted();

  const { getColorToken, setPrimaryColorTokens } = useTokens();
  const modesInSync = useModesInSync();

  return (
    <div className="space-y-4">
      <div className="@container flex flex-wrap items-start gap-x-6 gap-y-4 sm:flex-row">
        <section className="max-w-80 min-w-72 flex-1 space-y-1.5 max-sm:w-full max-sm:max-w-full">
          <Label className="flex items-center gap-1 pb-2">
            <PaintBucket className="size-4" /> Theme presets
          </Label>
          <AllPresetsControl />
          <span className="text-muted-foreground truncate text-xs">
            {`Complete theme presets`}
          </span>
        </section>

        {/* Paste your primary color */}
        <section className="max-w-66 min-w-62 space-y-1.5 max-sm:w-full max-sm:max-w-full sm:flex-1">
          <Label className="flex items-center gap-1 pb-2">
            <ClipboardPaste className="size-4" /> Paste your primary color
          </Label>
          <PasteColorControl
            setColorTokens={setPrimaryColorTokens}
            modesInSync={modesInSync}
            property={"primary"}
          />
          <span className="text-muted-foreground text-xs">
            {`oklch(), hsl(), rbg() and #hex`}
          </span>
        </section>

        {/* Primary color */}
        <section className="max-w-80 min-w-72 flex-2 space-y-1.5 max-sm:w-full max-sm:max-w-full">
          <div className="flex items-start justify-between gap-2 pb-1">
            <Label className="flex items-center gap-1">
              <Paintbrush className="size-4" /> Primary color
            </Label>
            <Label className="text-muted-foreground flex gap-1">
              Shade
              <Select
                value={shade}
                onValueChange={(v: TailwindShadeKey) => setShade(v)}
              >
                <SelectTrigger
                  size="sm"
                  className="data-[size=sm]:h-5 data-[size=sm]:px-2 data-[size=sm]:text-xs"
                >
                  {isMounted ? (
                    <SelectValue defaultValue={shade} />
                  ) : (
                    <Skeleton className="h-[1ch] w-[3ch]" />
                  )}
                </SelectTrigger>
                <SelectContent className="w-fit min-w-0">
                  <SelectGroup>
                    <SelectLabel>Shade</SelectLabel>
                    {TAILWIND_SHADES.map((shade) => (
                      <SelectItem value={shade} key={shade}>
                        {shade}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          </div>
          <div className="grid grid-cols-11 gap-1.5">
            <MemoizedTailwindV4ColorPalette
              currentColor={getColorToken({
                property: "primary",
              })}
              shade={shade}
              className="contents"
              modesInSync={modesInSync}
            />
          </div>
          <span className="text-muted-foreground truncate text-xs">
            Tailwind v4 color palette
          </span>
        </section>

        {/* Radius */}
        <section className="min-w-62 space-y-1.5 max-sm:w-full max-sm:max-w-full sm:flex-1">
          <Label className="flex items-center gap-1 pb-2">
            <SquareRoundCorner className="size-4" /> Radius
          </Label>
          <RadiusControls className="flex flex-wrap gap-2 @max-lg:[&>*]:flex-1" />
        </section>
      </div>
    </div>
  );
}
