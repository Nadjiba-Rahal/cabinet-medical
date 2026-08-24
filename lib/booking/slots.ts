import type { SettingsMap } from "@/types/settings";
import type { Appointment } from "@/types/appointment";

type DailyHours = { start: string; end: string };

const DEFAULT_HOURS: DailyHours = { start: "08:00", end: "18:00" };

function getOpeningDays(settings: SettingsMap): number[] {
  const raw = settings.openingDays || settings.openDays;
  return raw.split(",").map(Number).filter((day) => Number.isInteger(day));
}

function getWeeklyHours(settings: SettingsMap): Record<string, DailyHours> {
  try {
    const parsed = JSON.parse(settings.weeklyHours || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getHoursForDay(day: Date, settings: SettingsMap): DailyHours {
  return getWeeklyHours(settings)[day.getDay()] ?? {
    start: settings.openStart || DEFAULT_HOURS.start,
    end: settings.openEnd || DEFAULT_HOURS.end,
  };
}

export function isDayOpen(date: Date, settings: SettingsMap): boolean {
  return getOpeningDays(settings).includes(date.getDay());
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
  if (!isDayOpen(day, settings)) return [];

  const hours = getHoursForDay(day, settings);
  const [startH, startM] = hours.start.split(":").map(Number);
  const [endH, endM] = hours.end.split(":").map(Number);
  const step = Number(settings.appointmentInterval || settings.slotMinutes) || 30;

  const dayStart = new Date(day);
  dayStart.setHours(startH, startM, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(endH, endM, 0, 0);

  const slots: Date[] = [];
  const cursor = new Date(dayStart);
  const now = new Date();

  while (cursor.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
    const breakStart = settings.breakStart ? getTimeOnDay(day, settings.breakStart).getTime() : 0;
    const breakEnd = settings.breakEnd ? getTimeOnDay(day, settings.breakEnd).getTime() : 0;
    const inBreak = settings.breakEnabled === "true" && cursor.getTime() < breakEnd && cursor.getTime() + durationMinutes * 60000 > breakStart;

    if (cursor.getTime() > now.getTime() && !inBreak) {
      slots.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + step);
  }
  return slots;
}

function getTimeOnDay(day: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(day);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function isSlotWithinSchedule(
  start: Date,
  durationMinutes: number,
  settings: SettingsMap
): boolean {
  if (!isDayOpen(start, settings)) return false;

  const hours = getHoursForDay(start, settings);
  const opening = getTimeOnDay(start, hours.start).getTime();
  const closing = getTimeOnDay(start, hours.end).getTime();
  const end = start.getTime() + durationMinutes * 60000;

  if (start.getTime() < opening || end > closing) return false;

  if (settings.breakEnabled === "true") {
    const breakStart = getTimeOnDay(start, settings.breakStart).getTime();
    const breakEnd = getTimeOnDay(start, settings.breakEnd).getTime();
    if (start.getTime() < breakEnd && end > breakStart) return false;
  }

  const interval = Number(settings.appointmentInterval || settings.slotMinutes) || 30;
  return (start.getTime() - opening) % (interval * 60000) === 0;
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
