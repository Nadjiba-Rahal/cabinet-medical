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
    "openStart",
    "openEnd",
    "slotMinutes",
  ];

  const partial: Partial<SettingsMap> = {};

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
