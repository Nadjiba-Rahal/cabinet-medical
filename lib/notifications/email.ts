import type { Appointment } from "@/types/appointment";

/**
 * SIMULATED integration. No real email provider (Resend, SES, etc.) is
 * connected in this portfolio build — wiring one in requires credentials
 * this project intentionally doesn't ship with. This function logs what
 * would be sent, in the shape a real adapter would receive it, so the
 * hook point is obvious and swapping in a real provider is a one-file
 * change (implement the same signature, call it from the same place in
 * actions/appointment.actions.ts).
 */
export async function sendAppointmentConfirmationEmail(appointment: Appointment, serviceName: string) {
  console.log(
    `[email:SIMULATED] Confirmation would be sent to ${appointment.email} — ` +
      `"${serviceName}" on ${appointment.startAt}. (No real email provider connected in this demo.)`
  );
  return { ok: true, simulated: true };
}
