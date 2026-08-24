"use client";

import { useActionState, useState } from "react";
import { updateSettingsAction } from "@/actions/settings.actions";
import type { SettingsMap } from "@/types/settings";

export function SettingsForm({ settings }: { settings: SettingsMap }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, undefined);
  const days = [
    [1, "Lundi"], [2, "Mardi"], [3, "Mercredi"], [4, "Jeudi"],
    [5, "Vendredi"], [6, "Samedi"], [0, "Dimanche"],
  ] as const;
  const defaultHours = { start: settings.openStart, end: settings.openEnd };
  const parsedHours = (() => {
    try {
      return JSON.parse(settings.weeklyHours || "{}") as Record<string, { start: string; end: string }>;
    } catch {
      return {};
    }
  })();
  const [openDays, setOpenDays] = useState(
    (settings.openingDays || settings.openDays).split(",").filter(Boolean)
  );
  const [weeklyHours, setWeeklyHours] = useState(() =>
    days.reduce<Record<string, { start: string; end: string }>>((result, [day]) => {
      result[day] = parsedHours[day] || defaultHours;
      return result;
    }, {})
  );
  const [breakEnabled, setBreakEnabled] = useState(settings.breakEnabled === "true");

  function updateHour(day: number, field: "start" | "end", value: string) {
    setWeeklyHours((current) => ({
      ...current,
      [day]: { ...current[day], [field]: value },
    }));
  }

  return (
    <form action={formAction} className="settings-form">
      <section className="settings-section">
        <p className="settings-section-label">Informations du cabinet</p>
        <div className="field"><label htmlFor="cabinetName">Nom du cabinet</label><input id="cabinetName" name="cabinetName" defaultValue={settings.cabinetName} /></div>
        <div className="field-row"><div className="field"><label htmlFor="phone">Téléphone</label><input id="phone" name="phone" defaultValue={settings.phone} /></div><div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} /></div></div>
        <div className="field"><label htmlFor="address">Adresse</label><input id="address" name="address" defaultValue={settings.address} /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={settings.email} /></div>
      </section>

      <section className="settings-section">
        <p className="settings-section-label">Horaires</p>
        <p className="settings-help">Choisissez les jours ouverts et leurs horaires. Ces réglages contrôlent aussi les créneaux proposés aux patients.</p>
        <input type="hidden" name="weeklyHours" value={JSON.stringify(weeklyHours)} readOnly />
        <div className="opening-days">
          {days.map(([day, label]) => {
            const enabled = openDays.includes(String(day));
            return <div className={`opening-day${enabled ? " enabled" : ""}`} key={day}>
              <label className="day-toggle"><input type="checkbox" name="openingDay" value={day} checked={enabled} onChange={(event) => setOpenDays((current) => event.target.checked ? [...current, String(day)] : current.filter((value) => value !== String(day)))} /><span>{label}</span></label>
              <div className="day-hours"><input aria-label={`${label} ouverture`} type="time" value={weeklyHours[day]?.start || "08:00"} disabled={!enabled} onChange={(event) => updateHour(day, "start", event.target.value)} /><span>à</span><input aria-label={`${label} fermeture`} type="time" value={weeklyHours[day]?.end || "18:00"} disabled={!enabled} onChange={(event) => updateHour(day, "end", event.target.value)} /></div>
            </div>;
          })}
        </div>
        <div className="break-settings">
          <label className="day-toggle"><input type="checkbox" name="breakEnabled" value="true" checked={breakEnabled} onChange={(event) => setBreakEnabled(event.target.checked)} /><span>Activer une pause</span></label>
          <div className="day-hours"><input aria-label="Début de la pause" type="time" name="breakStart" defaultValue={settings.breakStart} disabled={!breakEnabled} /><span>à</span><input aria-label="Fin de la pause" type="time" name="breakEnd" defaultValue={settings.breakEnd} disabled={!breakEnabled} /></div>
        </div>
        <div className="field"><label htmlFor="appointmentInterval">Intervalle des rendez-vous</label><select id="appointmentInterval" name="appointmentInterval" defaultValue={settings.appointmentInterval || "30"}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option></select></div>
      </section>

      <button type="submit" className="primary-btn full" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer les modifications"}
      </button>
      {state?.ok && <p className="settings-success">Paramètres enregistrés.</p>}
    </form>
  );
}
