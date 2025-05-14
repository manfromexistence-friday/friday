import * as schema from "@/lib/db/schema";
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function getDbConnectionString(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not defined in the environment variables.",
    );
  }

  return databaseUrl;
}

export const client = postgres(getDbConnectionString());
export const db = drizzle(client, { schema });
