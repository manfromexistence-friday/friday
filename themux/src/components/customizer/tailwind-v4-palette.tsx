"use client";

import { useTokens } from "@/hooks/use-tokens";
import { TAILWIND_PALETTE_V4, TailwindShadeKey } from "@/lib/palettes";
import { cn } from "@/lib/utils";
import { convertToOklch } from "@/utils/color-converter";
import React, { ComponentProps } from "react";
import { TooltipWrapper } from "../tooltip-wrapper";
import { Color } from "./color";

export const MemoizedTailwindV4ColorPalette = React.memo(
  TailwindV4ColorPalette,
);
function TailwindV4ColorPalette({
  currentColor,
  shade,
  modesInSync,
  className,
  ...props
}: {
  currentColor: string;
  shade: TailwindShadeKey;
  modesInSync?: boolean;
} & ComponentProps<"div">) {
  const { setPrimaryColorTokens } = useTokens();

  const handleColorChange = (color: string) => {
    const newOklchColor = convertToOklch(color);
    setPrimaryColorTokens({ color: newOklchColor, modesInSync });
  };

  return (
    <div
      className={cn(
        "flex flex-wrap content-start items-start gap-2",
        className,
      )}
      {...props}
    >
      {Object.entries(TAILWIND_PALETTE_V4).map(([key, colors]) => {
        const color = colors[shade];
        const isActive = currentColor === color;

        return (
          <TooltipWrapper label={`${key}-${shade}`} key={key} asChild>
            <Color
              color={color}
              isActive={isActive}
              onClick={() => handleColorChange(color)}
              className="ring-border ring"
            />
          </TooltipWrapper>
        );
      })}
    </div>
  );
}
