"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/actions/settings.actions";
import type { SettingsMap } from "@/types/settings";

export function SettingsForm({ settings }: { settings: SettingsMap }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, undefined);

  return (
    <form action={formAction} className="settings-form">
      <div className="field">
        <label htmlFor="cabinetName">Nom du cabinet</label>
        <input id="cabinetName" name="cabinetName" defaultValue={settings.cabinetName} />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="phone">Téléphone</label>
          <input id="phone" name="phone" defaultValue={settings.phone} />
        </div>
        <div className="field">
          <label htmlFor="whatsapp">WhatsApp (chiffres uniquement)</label>
          <input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="address">Adresse</label>
        <input id="address" name="address" defaultValue={settings.address} />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" defaultValue={settings.email} />
      </div>
      <div className="field">
        <label htmlFor="openingHours">Horaires (affichage)</label>
        <input id="openingHours" name="openingHours" defaultValue={settings.openingHours} />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="openStart">Ouverture</label>
          <input id="openStart" name="openStart" defaultValue={settings.openStart} />
        </div>
        <div className="field">
          <label htmlFor="openEnd">Fermeture</label>
          <input id="openEnd" name="openEnd" defaultValue={settings.openEnd} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="slotMinutes">Durée des créneaux (minutes)</label>
        <input id="slotMinutes" name="slotMinutes" defaultValue={settings.slotMinutes} />
      </div>

      <button type="submit" className="primary-btn full" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
      {state?.ok && <p className="settings-success">Paramètres enregistrés.</p>}
    </form>
  );
}
