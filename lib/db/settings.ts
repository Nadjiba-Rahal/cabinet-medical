import { randomUUID } from "node:crypto";
import { sql } from "./client";
import { DEFAULT_SETTINGS, type SettingsMap } from "@/types/settings";

export async function getSettings(): Promise<SettingsMap> {
  const rows = await sql`
    SELECT key, value
    FROM "Setting"
  `;

  const map: Record<string, string> = { ...DEFAULT_SETTINGS };

  for (const row of rows) {
    const key = String(row.key);

    if (key in map) {
      map[key] = String(row.value);
    }
  }

  if (!rows.some((row) => String(row.key) === "openingDays") && rows.some((row) => String(row.key) === "openDays")) {
    map.openingDays = map.openDays;
  }

  return map as SettingsMap;
}

export async function updateSettings(
  partial: Partial<SettingsMap>
): Promise<void> {
  for (const [key, value] of Object.entries(partial)) {
    await sql`
      INSERT INTO "Setting" (id, key, value)
      VALUES (${randomUUID()}, ${key}, ${value})
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value
    `;
  }
}
