import { requireAdminOrRedirect } from "@/actions/admin.actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AppointmentRowActions } from "@/components/admin/appointment-row-actions";
import { getAllAppointments } from "@/lib/db/appointments";

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};

export default async function AdminAppointmentsPage() {
  const session = await requireAdminOrRedirect();
  const appointments = await getAllAppointments();

  const fmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <AdminShell email={session.email}>
      <h1>Rendez-vous</h1>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Service</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{fmt.format(new Date(a.startAt))}</td>
                <td>{a.fullName}</td>
                <td>{a.serviceName}</td>
                <td>{a.phone}</td>
                <td>
                  <span className={`status-pill status-${a.status}`}>{STATUS_LABELS[a.status] ?? a.status}</span>
                </td>
                <td>
                  <AppointmentRowActions id={a.id} status={a.status} />
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>
                  Aucun rendez-vous pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

