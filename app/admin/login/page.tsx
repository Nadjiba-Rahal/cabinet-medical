"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/admin.actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>BELLEVUE</h1>
        <p className="subtitle">Administration du cabinet</p>

        <form action={formAction}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="admin@bellevue-cabinet.dz"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>

          {state?.error && (
            <div className="error-banner">{state.error}</div>
          )}

          <button
            type="submit"
            className="primary-btn full"
            disabled={pending}
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="login-demo-note">
          Démo : admin@bellevue-cabinet.dz / demo1234
        </p>
      </div>
    </div>
  );
}
