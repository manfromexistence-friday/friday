import { allPresetsArray } from "@/lib/colors";
import { Preset } from "@/types/theme";

export function getPresetThemeObject(preset: Preset) {
  const themeObject = allPresetsArray.find((p) => p.name === preset);

  if (!themeObject) {
    throw new Error(`Preset ${preset} not found`);
  }

  return themeObject;
}
