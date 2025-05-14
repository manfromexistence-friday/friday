import { db } from "@/lib/db";
import {
  InsertRegistryTable,
  registryTable,
  RegistryTable,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { RegistryItem } from "shadcn/registry";

export async function getRegistryItem(id: string): Promise<RegistryTable> {
  const [row] = await db
    .select()
    .from(registryTable)
    .where(eq(registryTable.id, id))
    .limit(1)
    .execute();

  return row;
}

export async function createRegistryItem(
  registryItem: RegistryItem,
): Promise<string> {
  const newItem: InsertRegistryTable = {
    id: registryItem.name,
    name: registryItem.name,
    type: registryItem.type,
    registryItem: JSON.stringify(registryItem),
  };

  const [createdRegistryItem] = await db
    .insert(registryTable)
    .values(newItem)
    .returning();

  return createdRegistryItem.name;
}
