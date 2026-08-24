"use server";

import { redirect } from "next/navigation";
import { getAdminSession, createAdminSession, destroyAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { updateAppointmentStatus } from "@/lib/db/appointments";
import type { AppointmentStatus } from "@/types/appointment";

type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Veuillez remplir tous les champs." };
  }

  const admin = await verifyAdminCredentials(email, password);

  if (!admin) {
    return { error: "Identifiants incorrects." };
  }

  await createAdminSession(admin.email);

  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function requireAdminOrRedirect() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function setAppointmentStatusAction(
  id: string,
  status: AppointmentStatus
) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  if (!["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
    return;
  }

  await updateAppointmentStatus(id, status);
  redirect("/admin/appointments");
}
