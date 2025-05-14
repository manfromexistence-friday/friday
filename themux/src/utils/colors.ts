import { basePresetsV4 } from "@/lib/colors";
import Color from "color";
import { parse } from "culori";
import { colorFormatter } from "./color-converter";

export function getOptimalForegroundColor(baseColor: string) {
  if (!isValidColor(baseColor)) {
    throw new Error(`Invalid color format: ${baseColor}`);
  }

  const colorInHex = colorFormatter(baseColor, "hex", "4");
  const color = Color(colorInHex);

  const foregroundColor = color.isDark()
    ? basePresetsV4.neutral.dark.foreground
    : basePresetsV4.neutral.light.foreground;

  return foregroundColor;
}

export function isValidColor(color: string): boolean {
  try {
    const parsedColor = parse(color);
    if (!parsedColor) return false;
    return true;
  } catch {
    return false;
  }
}
