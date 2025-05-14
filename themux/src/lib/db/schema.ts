import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const registryTable = pgTable("registry", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  registryItem: jsonb("registry_item").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type RegistryTable = typeof registryTable.$inferSelect;
export type InsertRegistryTable = typeof registryTable.$inferInsert;
