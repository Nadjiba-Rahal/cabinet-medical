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

  await updateSettings(partial);

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { ok: true };
}
