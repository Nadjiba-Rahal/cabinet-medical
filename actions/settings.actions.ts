"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { updateSettings } from "@/lib/db/settings";
import type { SettingsMap } from "@/types/settings";

export async function updateSettingsAction(
  _prevState: { ok?: boolean } | undefined,
  formData: FormData
): Promise<{ ok?: boolean }> {
  const session = await getAdminSession();

  if (!session) {
    return { ok: false };
  }

  const keys: (keyof SettingsMap)[] = [
    "cabinetName",
    "phone",
    "whatsapp",
    "address",
    "email",
    "openingHours",
    "openingDays",
    "weeklyHours",
    "breakEnabled",
    "breakStart",
    "breakEnd",
    "appointmentInterval",
    "openDays",
    "openStart",
    "openEnd",
    "slotMinutes",
  ];

  const partial: Partial<SettingsMap> = {};

  const openingDays = formData.getAll("openingDay").map(String).join(",");
  const weeklyHours = String(formData.get("weeklyHours") || "");

  if (weeklyHours) {
    partial.weeklyHours = weeklyHours;
  }
  partial.openingDays = openingDays;
  partial.openDays = openingDays;
  partial.breakEnabled = formData.get("breakEnabled") === "true" ? "true" : "false";

  if (weeklyHours) {
    try {
      const hours = JSON.parse(weeklyHours) as Record<string, { start?: string; end?: string }>;
      const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
      const validHours = Object.values(hours).every((day) =>
        Boolean(day?.start && day?.end && timePattern.test(day.start) && timePattern.test(day.end) && day.start < day.end)
      );
      if (!validHours) return { ok: false };
      const monday = hours["1"];
      if (monday?.start && monday.end) {
        partial.openStart = monday.start;
        partial.openEnd = monday.end;
      }
    } catch {
      partial.weeklyHours = undefined;
    }
  }

  for (const key of keys) {
    const value = formData.get(key);

    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      partial[key] = value.trim();
    }
  }

  const interval = partial.appointmentInterval;
  if (interval && !["15", "30", "45", "60"].includes(interval)) {
    return { ok: false };
  }

  const breakStart = partial.breakStart;
  const breakEnd = partial.breakEnd;
  if (breakStart && breakEnd && (breakStart < "00:00" || breakStart > "23:59" || breakEnd <= breakStart)) {
    return { ok: false };
  }

  await updateSettings(partial);

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { ok: true };
}
