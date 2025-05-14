import fs from "fs";
import path from "path";

import { RegistryItem, registryItemSchema } from "shadcn/registry";

export function writeToRegistry(dir: string, registryItem: RegistryItem) {
  // Ensure the directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const parsedRegistryItem = registryItemSchema.safeParse(registryItem);
  if (!parsedRegistryItem.success) {
    console.error("Invalid registry item:", parsedRegistryItem.error.format());
    return;
  }

  const _registryItem = parsedRegistryItem.data;
  const filePath = path.join(dir, `${_registryItem.name}.json`);

  fs.writeFileSync(filePath, JSON.stringify(_registryItem, null, 2));
  console.log(
    `✅ Generated registry file of type '${_registryItem.type}': '${_registryItem.name}'`,
  );
}
