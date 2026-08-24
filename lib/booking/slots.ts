import type { SettingsMap } from "@/types/settings";
import type { Appointment } from "@/types/appointment";

export function isDayOpen(date: Date, settings: SettingsMap): boolean {
  const openDays = settings.openDays.split(",").map(Number);
  return openDays.includes(date.getDay());
}

export function getNextAvailableDates(settings: SettingsMap, count = 14): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  let guard = 0;
  while (dates.length < count && guard < 60) {
    guard++;
    const candidate = new Date(cursor);
    candidate.setDate(cursor.getDate() + guard - 1);
    if (isDayOpen(candidate, settings)) dates.push(candidate);
  }
  return dates;
}

/** Generates candidate start times for a given day within opening hours. */
export function generateDaySlots(day: Date, durationMinutes: number, settings: SettingsMap): Date[] {
  const [startH, startM] = settings.openStart.split(":").map(Number);
  const [endH, endM] = settings.openEnd.split(":").map(Number);
  const step = Number(settings.slotMinutes) || 30;

  const dayStart = new Date(day);
  dayStart.setHours(startH, startM, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(endH, endM, 0, 0);

  const slots: Date[] = [];
  const cursor = new Date(dayStart);
  const now = new Date();

  while (cursor.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
    if (cursor.getTime() > now.getTime()) {
      slots.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + step);
  }
  return slots;
}

export function filterAvailableSlots(candidateSlots: Date[], durationMinutes: number, booked: Appointment[]): Date[] {
  return candidateSlots.filter((slot) => {
    const slotStart = slot.getTime();
    const slotEnd = slotStart + durationMinutes * 60000;
    return !booked.some((b) => {
      const bStart = new Date(b.startAt).getTime();
      const bEnd = new Date(b.endAt).getTime();
      return slotStart < bEnd && slotEnd > bStart;
    });
  });
}
