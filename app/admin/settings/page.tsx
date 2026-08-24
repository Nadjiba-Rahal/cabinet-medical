import { requireAdminOrRedirect } from "@/actions/admin.actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/db/settings";

export default async function AdminSettingsPage() {
  const session = await requireAdminOrRedirect();
  const settings = await getSettings();

  return (
    <AdminShell email={session.email}>
      <h1>Paramètres</h1>
      <SettingsForm settings={settings} />
    </AdminShell>
  );
}

