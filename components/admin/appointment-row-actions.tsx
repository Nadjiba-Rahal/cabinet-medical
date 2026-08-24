"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAppointmentStatusAction } from "@/actions/admin.actions";
import type { AppointmentStatus } from "@/types/appointment";

export function AppointmentRowActions({ id, status }: { id: string; status: AppointmentStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(next: AppointmentStatus) {
    startTransition(async () => {
      await setAppointmentStatusAction(id, next);
      router.refresh();
    });
  }

  return (
    <div className="row-actions">
      {status !== "CONFIRMED" && (
        <button disabled={pending} onClick={() => setStatus("CONFIRMED")}>
          Confirmer
        </button>
      )}
      {status !== "COMPLETED" && (
        <button disabled={pending} onClick={() => setStatus("COMPLETED")}>
          Terminé
        </button>
      )}
      {status !== "CANCELLED" && (
        <button disabled={pending} onClick={() => setStatus("CANCELLED")}>
          Annuler
        </button>
      )}
    </div>
  );
}
