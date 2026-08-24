"use server";

import { appointmentInputSchema } from "@/lib/validations/appointment";
import {
  createAppointmentIfAvailable,
  getBookedSlotsForServiceOnDay,
} from "@/lib/db/appointments";
import { getServiceById } from "@/lib/db/services";
import { sendAppointmentConfirmationEmail } from "@/lib/notifications/email";
import {
  generateDaySlots,
  filterAvailableSlots,
} from "@/lib/booking/slots";
import { getSettings } from "@/lib/db/settings";

export async function getAvailableSlotsAction(
  serviceId: string,
  dateIso: string
): Promise<string[]> {
  const service = await getServiceById(serviceId);

  if (!service) return [];

  const settings = await getSettings();

  const day = new Date(dateIso);
  day.setHours(0, 0, 0, 0);

  const dayEnd = new Date(day);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const candidates = generateDaySlots(
    day,
    service.durationMinutes,
    settings
  );

  const booked = await getBookedSlotsForServiceOnDay(
    serviceId,
    day.toISOString(),
    dayEnd.toISOString()
  );

  const available = filterAvailableSlots(
    candidates,
    service.durationMinutes,
    booked
  );

  return available.map((d) => d.toISOString());
}

export type CreateAppointmentResult =
  | { ok: true; appointmentId: string }
  | {
      ok: false;
      error: "validation" | "conflict" | "not_found" | "unknown";
    };

export async function createAppointmentAction(
  raw: unknown
): Promise<CreateAppointmentResult> {
  const parsed = appointmentInputSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  const service = await getServiceById(parsed.data.serviceId);

  if (!service || !service.active) {
    return { ok: false, error: "not_found" };
  }

  const start = new Date(parsed.data.startAt);

  if (
    Number.isNaN(start.getTime()) ||
    start.getTime() < Date.now() - 60_000
  ) {
    return { ok: false, error: "validation" };
  }

  const end = new Date(
    start.getTime() + service.durationMinutes * 60000
  );

  try {
    const result = await createAppointmentIfAvailable({
      serviceId: service.id,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message || null,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    });

    if (!result.ok) {
      return { ok: false, error: result.reason };
    }

    void sendAppointmentConfirmationEmail(
      result.appointment,
      service.name
    ).catch(() => {});

    return {
      ok: true,
      appointmentId: result.appointment.id,
    };
  } catch {
    return { ok: false, error: "unknown" };
  }
}
