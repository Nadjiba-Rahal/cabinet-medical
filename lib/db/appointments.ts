import { randomUUID } from "node:crypto";
import { sql } from "./client";
import type {
  Appointment,
  AppointmentStatus,
  AppointmentWithService,
} from "@/types/appointment";

export async function createAppointmentIfAvailable(input: {
  serviceId: string;
  fullName: string;
  phone: string;
  email: string;
  message?: string | null;
  startAt: string;
  endAt: string;
}): Promise<
  | { ok: true; appointment: Appointment }
  | { ok: false; reason: "conflict" | "not_found" }
> {
  const service = await sql`
    SELECT id
    FROM "Service"
    WHERE id = ${input.serviceId}
      AND active = TRUE
    LIMIT 1
  `;

  if (service.length === 0) {
    return { ok: false, reason: "not_found" };
  }

  const overlap = await sql`
    SELECT id
    FROM "Appointment"
    WHERE "serviceId" = ${input.serviceId}
      AND status != 'CANCELLED'
      AND "startAt" < ${input.endAt}
      AND "endAt" > ${input.startAt}
    LIMIT 1
  `;

  if (overlap.length > 0) {
    return { ok: false, reason: "conflict" };
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  const rows = await sql`
    INSERT INTO "Appointment" (
      id,
      "serviceId",
      "fullName",
      phone,
      email,
      message,
      "startAt",
      "endAt",
      status,
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${input.serviceId},
      ${input.fullName},
      ${input.phone},
      ${input.email},
      ${input.message ?? null},
      ${input.startAt},
      ${input.endAt},
      'PENDING',
      ${now},
      ${now}
    )
    RETURNING *
  `;

  return {
    ok: true,
    appointment: rows[0] as Appointment,
  };
}

export async function getBookedSlotsForServiceOnDay(
  serviceId: string,
  dayStartIso: string,
  dayEndIso: string
): Promise<Appointment[]> {
  const rows = await sql`
    SELECT *
    FROM "Appointment"
    WHERE "serviceId" = ${serviceId}
      AND status != 'CANCELLED'
      AND "startAt" >= ${dayStartIso}
      AND "startAt" < ${dayEndIso}
    ORDER BY "startAt" ASC
  `;

  return rows as Appointment[];
}

export async function getAllAppointments(): Promise<AppointmentWithService[]> {
  const rows = await sql`
    SELECT
      a.*,
      s.name AS "serviceName",
      s."durationMinutes" AS "durationMinutes"
    FROM "Appointment" a
    JOIN "Service" s
      ON s.id = a."serviceId"
    ORDER BY a."startAt" DESC
  `;

  return rows as AppointmentWithService[];
}

export async function getTodayStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const rows = await sql`
    SELECT status, COUNT(*)::int AS count
    FROM "Appointment"
    WHERE "startAt" >= ${start.toISOString()}
      AND "startAt" <= ${end.toISOString()}
    GROUP BY status
  `;

  const stats = {
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
  };

  for (const row of rows) {
    const count = Number(row.count);

    stats.total += count;

    if (row.status === "CONFIRMED") stats.confirmed = count;
    if (row.status === "PENDING") stats.pending = count;
    if (row.status === "CANCELLED") stats.cancelled = count;
    if (row.status === "COMPLETED") stats.completed = count;
  }

  return stats;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  await sql`
    UPDATE "Appointment"
    SET
      status = ${status},
      "updatedAt" = ${new Date().toISOString()}
    WHERE id = ${id}
  `;
}
