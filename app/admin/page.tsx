import { requireAdminOrRedirect } from "@/actions/admin.actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { getTodayStats, getAllAppointments } from "@/lib/db/appointments";
import { ArrowRight, ArrowUpRight, CalendarPlus, CheckCircle2, Clock3, TriangleAlert } from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmé",
  PENDING: "En attente",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};

export default async function AdminDashboardPage() {
  const session = await requireAdminOrRedirect();

  const [stats, appointments] = await Promise.all([
    getTodayStats(),
    getAllAppointments(),
  ]);

  const now = new Date();
  const todayKey = now.toLocaleDateString("fr-CA");
  const todayAppointments = appointments
    .filter((appointment) => new Date(appointment.startAt).toLocaleDateString("fr-CA") === todayKey)
    .filter((appointment) => appointment.status !== "CANCELLED")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const pendingAppointments = appointments
    .filter((appointment) => appointment.status === "PENDING")
    .slice(0, 3);
  const nextAppointment = todayAppointments.find((appointment) => new Date(appointment.startAt) >= now);
  const recent = appointments.slice(0, 6);

  const cards = [
    { label: "Rendez-vous aujourd'hui", value: stats.total, detail: "Planning du jour", icon: Clock3 },
    { label: "À traiter", value: stats.pending, detail: "Demandent votre attention", icon: TriangleAlert, urgent: stats.pending > 0 },
    { label: "Confirmés", value: stats.confirmed, detail: "Du planning d'aujourd'hui", icon: CheckCircle2 },
    { label: "Annulés", value: stats.cancelled, detail: "Aujourd'hui", icon: TriangleAlert },
  ];

  const dateFmt = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AdminShell email={session.email}>
      <section className="admin-welcome">
        <div>
          <p className="admin-kicker">Espace administration</p>
          <h1>Bonjour, Administration</h1>
          <p className="admin-date">{dateFmt.format(now)} · Cabinet Bellevue</p>
        </div>
        <Link href="/?booking=1#booking" className="admin-primary-action">
          <CalendarPlus size={16} /> Nouveau rendez-vous
        </Link>
      </section>

      <div className="stat-grid">
        {cards.map((c) => (
          <div className={`stat-card${c.urgent ? " is-urgent" : ""}`} key={c.label}>
            <div className="stat-card-top">
              <span>{c.label}</span>
              <c.icon size={16} />
            </div>
            <strong>{c.value}</strong>
            <small>{c.detail}</small>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel timeline-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Aujourd&apos;hui</p>
              <h2>Planning du jour</h2>
            </div>
            <Link href="/admin/appointments" className="text-link">Planning <ArrowRight size={14} /></Link>
          </div>
          <div className="today-timeline">
            {todayAppointments.map((appointment) => (
              <div className="timeline-item" key={appointment.id}>
                <time>{timeFmt.format(new Date(appointment.startAt))}</time>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <strong>{appointment.fullName}</strong>
                  <span>{appointment.serviceName}</span>
                  <span className={`status-pill status-${appointment.status}`}>
                    {STATUS_LABELS[appointment.status] ?? appointment.status}
                  </span>
                </div>
              </div>
            ))}
            {todayAppointments.length === 0 && <p className="empty-state">Aucun rendez-vous prévu aujourd&apos;hui.</p>}
          </div>
        </section>

        <section className="admin-panel attention-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Action requise</p>
              <h2>À traiter</h2>
            </div>
            <span className="attention-count">{stats.pending}</span>
          </div>
          {pendingAppointments.length > 0 ? pendingAppointments.map((appointment) => (
            <div className="attention-item" key={appointment.id}>
              <div>
                <strong>{appointment.fullName}</strong>
                <span>{appointment.serviceName}</span>
                <small>{dateTimeFmt.format(new Date(appointment.startAt))}</small>
              </div>
              <Link href="/admin/appointments" className="small-action">Voir</Link>
            </div>
          )) : <p className="empty-state">Aucun rendez-vous en attente.</p>}
          <Link href="/admin/appointments" className="panel-footer-link">Voir tous les rendez-vous <ArrowRight size={14} /></Link>
        </section>
      </div>

      <section className="admin-panel next-appointment-panel">
        <div className="next-appointment-label"><Clock3 size={15} /> Prochain rendez-vous</div>
        {nextAppointment ? (
          <div className="next-appointment-content">
            <strong>{timeFmt.format(new Date(nextAppointment.startAt))}</strong>
            <div><b>{nextAppointment.fullName}</b><span>{nextAppointment.serviceName}</span></div>
            <span className={`status-pill status-${nextAppointment.status}`}>{STATUS_LABELS[nextAppointment.status]}</span>
            <Link href="/admin/appointments" className="text-link">Voir <ArrowRight size={14} /></Link>
          </div>
        ) : <p className="empty-state">La journée est libre pour le moment.</p>}
      </section>

      <section className="quick-actions-section">
        <p className="admin-kicker">Accès rapide</p>
        <div className="quick-actions">
          <Link href="/admin/appointments" className="quick-action"><CalendarPlus size={17} /><span><b>Voir les rendez-vous</b><small>Gérer le planning</small></span><ArrowRight size={14} /></Link>
          <Link href="/admin/settings" className="quick-action"><Clock3 size={17} /><span><b>Modifier les horaires</b><small>Ouverture et pauses</small></span><ArrowRight size={14} /></Link>
          <Link href="/admin/settings" className="quick-action"><CheckCircle2 size={17} /><span><b>Voir les paramètres</b><small>Informations du cabinet</small></span><ArrowRight size={14} /></Link>
          <Link href="/" className="quick-action"><ArrowUpRight size={17} /><span><b>Retour au site</b><small>Voir l&apos;expérience patient</small></span><ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="recent-section">
        <div className="admin-panel-heading">
          <div><p className="admin-kicker">Activité</p><h2>Rendez-vous récents</h2></div>
          <Link href="/admin/appointments" className="text-link">Voir tout <ArrowRight size={14} /></Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Patient</th><th>Service</th><th>Date</th><th>Statut</th></tr></thead>
            <tbody>
              {recent.map((appointment) => (
                <tr key={appointment.id}>
                  <td><strong>{appointment.fullName}</strong></td>
                  <td>{appointment.serviceName}</td>
                  <td>{dateTimeFmt.format(new Date(appointment.startAt))}</td>
                  <td><span className={`status-pill status-${appointment.status}`}>{STATUS_LABELS[appointment.status] ?? appointment.status}</span></td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={4} className="empty-table">Aucun rendez-vous pour le moment.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
