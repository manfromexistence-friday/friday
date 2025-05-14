import { allPresets } from "@/lib/colors";
import { generateThemeRegistryFromPreset } from "@/utils/registry/themes";

function execute() {
  const presets = allPresets;

  // Generate registry files for presets
  Object.keys(presets).forEach((preset) => {
    generateThemeRegistryFromPreset(preset);
  });
}

execute();
