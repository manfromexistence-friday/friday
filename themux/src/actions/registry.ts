"use server";

import { createRegistryItem } from "@/data/r/themes";
import { ThemeObject } from "@/types/theme";
import { buildThemeRegistryItem } from "@/utils/registry/themes";

export async function generateThemeRegistryItemFromThemeObject(
  themeObject: ThemeObject,
) {
  // Name needs to be a UUID to be unique, hence I use this as the ID in the database
  const randomId = crypto.randomUUID();
  themeObject.name = randomId;

  try {
    const registryItem = buildThemeRegistryItem(themeObject);
    const registryItemName = await createRegistryItem(registryItem);
    return {
      success: true,
      data: registryItemName,
    };
  } catch (e) {
    return {
      success: false,
      error: "An error occurred while generating the theme registry item.",
    };
  }
}
