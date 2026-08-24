import { sql } from "./client";
import type { Service } from "@/types/service";

type ServiceRow = Omit<Service, "active"> & { active: boolean };

function toService(row: ServiceRow): Service {
  return {
    ...row,
    active: Boolean(row.active),
  };
}

export async function getActiveServices(): Promise<Service[]> {
  const rows = await sql`
    SELECT
      id,
      name,
      description,
      "durationMinutes",
      price,
      color,
      active,
      "order"
    FROM "Service"
    WHERE active = TRUE
    ORDER BY "order" ASC
  `;

  return rows.map((row) => toService(row as ServiceRow));
}

export async function getServiceById(
  id: string
): Promise<Service | undefined> {
  const rows = await sql`
    SELECT
      id,
      name,
      description,
      "durationMinutes",
      price,
      color,
      active,
      "order"
    FROM "Service"
    WHERE id = ${id}
    LIMIT 1
  `;

  return rows.length > 0
    ? toService(rows[0] as ServiceRow)
    : undefined;
}
