import type { SQLiteDatabase } from "expo-sqlite";

import { SCHEMA_SQL } from "@/db/schema";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentDbVersion = row?.user_version ?? 0;

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      ${SCHEMA_SQL}
      PRAGMA user_version = 1;
    `);
  }

  await db.execAsync("PRAGMA foreign_keys = ON;");
}
