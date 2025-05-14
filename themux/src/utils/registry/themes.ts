import path from "path";

import { DEFAULT_FONTS, initialThemeConfig } from "@/lib/themes";
import {
  ColorFormat,
  Preset,
  TailwindVersion,
  ThemeObject,
  ThemeProperties,
  ThemeProperty,
} from "@/types/theme";
import { colorFormatter } from "@/utils/color-converter";
import { getPresetThemeObject } from "@/utils/presets";
import { getShadowMap } from "@/utils/shadows";
import { RegistryItem, registryItemSchema } from "shadcn/registry";
import { writeToRegistry } from ".";

const FALLBACKS = {
  "font-sans": DEFAULT_FONTS["font-sans"],
  "font-serif": DEFAULT_FONTS["font-serif"],
  "font-mono": DEFAULT_FONTS["font-mono"],
  radius: "0.5rem",
  spacing: "0.25rem",
  "letter-spacing": "0em",
  "shadow-color": "#000000",
} satisfies Partial<Record<ThemeProperty, string>>;

const THEMES_DIR = path.join(process.cwd(), "public", "r", "themes");

// Convert color to the format expected by shadcn registry
function convertToRegistryColor(
  color: string,
  colorFormat: ColorFormat = "oklch",
  tailwindVersion: TailwindVersion = "4",
): string {
  return colorFormatter(color, colorFormat, tailwindVersion);
}

// Helper to get a value from either dark or light theme
function getThemeValue(
  dark: ThemeProperties,
  light: ThemeProperties,
  key: keyof ThemeProperties,
): string {
  return dark[key] || light[key] || "";
}

// Convert theme styles to registry format
function convertThemeStyles(themeObject: ThemeObject) {
  const { light, dark } = themeObject;
  const convertColor = (color?: string) => convertToRegistryColor(color!);

  const convertBaseThemeProps = (theme: ThemeProperties): ThemeProperties => {
    const result: ThemeProperties = theme;

    // Convert all color values
    result.background = convertColor(theme.background);
    result.foreground = convertColor(theme.foreground);
    result.card = convertColor(theme.card);
    result["card-foreground"] = convertColor(theme["card-foreground"]);
    result.popover = convertColor(theme.popover);
    result["popover-foreground"] = convertColor(theme["popover-foreground"]);
    result.primary = convertColor(theme.primary);
    result["primary-foreground"] = convertColor(theme["primary-foreground"]);
    result.secondary = convertColor(theme.secondary);
    result["secondary-foreground"] = convertColor(
      theme["secondary-foreground"],
    );
    result.muted = convertColor(theme.muted);
    result["muted-foreground"] = convertColor(theme["muted-foreground"]);
    result.accent = convertColor(theme.accent);
    result["accent-foreground"] = convertColor(theme["accent-foreground"]);
    result.destructive = convertColor(theme.destructive);
    result["destructive-foreground"] = convertColor(
      theme["destructive-foreground"],
    );
    result.border = convertColor(theme.border);
    result.input = convertColor(theme.input);
    result.ring = convertColor(theme.ring);
    result["chart-1"] = convertColor(theme["chart-1"]);
    result["chart-2"] = convertColor(theme["chart-2"]);
    result["chart-3"] = convertColor(theme["chart-3"]);
    result["chart-4"] = convertColor(theme["chart-4"]);
    result["chart-5"] = convertColor(theme["chart-5"]);
    result.sidebar = convertColor(theme.sidebar);
    result["sidebar-foreground"] = convertColor(theme["sidebar-foreground"]);
    result["sidebar-primary"] = convertColor(theme["sidebar-primary"]);
    result["sidebar-primary-foreground"] = convertColor(
      theme["sidebar-primary-foreground"],
    );
    result["sidebar-accent"] = convertColor(theme["sidebar-accent"]);
    result["sidebar-accent-foreground"] = convertColor(
      theme["sidebar-accent-foreground"],
    );
    result["sidebar-border"] = convertColor(theme["sidebar-border"]);
    result["sidebar-ring"] = convertColor(theme["sidebar-ring"]);

    return result;
  };

  return {
    light: {
      ...initialThemeConfig.themeObject.light,
      ...{
        "font-sans": themeObject.fonts?.sans || FALLBACKS["font-sans"],
        "font-serif": themeObject.fonts?.serif || FALLBACKS["font-serif"],
        "font-mono": themeObject.fonts?.mono || FALLBACKS["font-mono"],
      },
      ...convertBaseThemeProps(light as ThemeProperties),
      radius: themeObject.radius || FALLBACKS.radius,
      "shadow-color": convertColor(
        light["shadow-color"] ?? FALLBACKS["shadow-color"],
      ),
    } satisfies ThemeProperties,
    dark: {
      ...initialThemeConfig.themeObject.dark,
      ...convertBaseThemeProps(dark as ThemeProperties),
      "shadow-color": convertColor(
        dark["shadow-color"] ?? FALLBACKS["shadow-color"],
      ),
    } satisfies ThemeProperties,
  };
}

// TODO: Adjust the right (and only the necessary) variables
// Maybe pass the object to Zod and let it do the work?
export function buildThemeRegistryItem(themeObject: ThemeObject) {
  const { light, dark } = convertThemeStyles(themeObject);

  // Generate shadow variables for both light and dark modes
  const lightShadows = getShadowMap(themeObject, "light", { varOutput: true });

  const registryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: themeObject.name,
    type: "registry:style",
    cssVars: {
      theme: {
        "font-sans": themeObject.fonts?.sans || FALLBACKS["font-sans"],
        "font-serif": themeObject.fonts?.serif || FALLBACKS["font-serif"],
        "font-mono": themeObject.fonts?.mono || FALLBACKS["font-mono"],
        "tracking-tighter": "calc(var(--tracking-normal) - 0.05em)",
        "tracking-tight": "calc(var(--tracking-normal) - 0.025em)",
        "tracking-wide": "calc(var(--tracking-normal) + 0.025em)",
        "tracking-wider": "calc(var(--tracking-normal) + 0.05em)",
        "tracking-widest": "calc(var(--tracking-normal) + 0.1em)",
      },
      light: {
        ...cleanUpLightModeStyles(light),
        "shadow-2xs": lightShadows["shadow-2xs"],
        "shadow-xs": lightShadows["shadow-xs"],
        "shadow-sm": lightShadows["shadow-sm"],
        shadow: lightShadows["shadow"],
        "shadow-md": lightShadows["shadow-md"],
        "shadow-lg": lightShadows["shadow-lg"],
        "shadow-xl": lightShadows["shadow-xl"],
        "shadow-2xl": lightShadows["shadow-2xl"],
        spacing: getThemeValue(dark, light, "spacing") || FALLBACKS.spacing,
        "tracking-normal":
          getThemeValue(dark, light, "letter-spacing") ||
          FALLBACKS["letter-spacing"],
      },
      dark: {
        ...cleanUpDarkModeStyles(dark),
      },
    },
  } satisfies RegistryItem;

  // Validate the registry item against the official "shadcn/registry" schema
  const parsedRegistryItem = registryItemSchema.safeParse(registryItem);

  if (!parsedRegistryItem.success) {
    console.error("Invalid registry item:", parsedRegistryItem.error.format());
    throw new Error("Invalid registry item");
  }

  const validRegistryItem = parsedRegistryItem.data;
  return validRegistryItem;
}

function cleanUpLightModeStyles(light: ThemeProperties): ThemeProperties {
  const {
    "shadow-opacity": shadowOpacity,
    "shadow-blur": shadowBlur,
    "shadow-spread": shadowSpread,
    "shadow-offset-x": shadowOffsetX,
    "shadow-offset-y": shadowOffsetY,
    ...restLight
  } = light;

  return {
    radius: restLight.radius,
    "font-sans": restLight["font-sans"],
    "font-serif": restLight["font-serif"],
    "font-mono": restLight["font-mono"],
    ...restLight,
  };
}

function cleanUpDarkModeStyles(dark: ThemeProperties): ThemeProperties {
  const {
    "shadow-opacity": shadowOpacity,
    "shadow-blur": shadowBlur,
    "shadow-spread": shadowSpread,
    "shadow-offset-x": shadowOffsetX,
    "shadow-offset-y": shadowOffsetY,
    radius,
    "font-sans": fontSans,
    "font-serif": fontSerif,
    "font-mono": fontMono,
    ...restDark
  } = dark;

  return restDark;
}

// Generate the theme registry item based on an **existing** preset
export function generateThemeRegistryFromPreset(preset: Preset) {
  const themeObject = getPresetThemeObject(preset);
  const registryItem = buildThemeRegistryItem(themeObject);

  writeToRegistry(THEMES_DIR, registryItem);
}

// Generate the theme registry item based on whatever theme object is passed
// - useful for custom themes or when 'tweaking' existing presets
export function generateThemeRegistryFromThemeObject(themeObject: ThemeObject) {
  const registryItem = buildThemeRegistryItem(themeObject);
  writeToRegistry(THEMES_DIR, registryItem);
  return registryItem;
}
