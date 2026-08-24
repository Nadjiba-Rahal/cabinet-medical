"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminSession, verifyAdminCredentials } from "@/lib/auth";
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

  const cookieStore = await cookies();

  cookieStore.set("bellevue_admin", admin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("bellevue_admin");
  redirect("/admin/login");
}

export async function requireAdminOrRedirect() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("bellevue_admin")?.value;

  if (!adminId) {
    redirect("/admin/login");
  }

  return {
    id: adminId,
    email: "admin@bellevue-cabinet.dz",
  };
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
