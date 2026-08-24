"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, Settings, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/admin.actions";

const NAV = [
  { href: "/admin", label: "Aperçu", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Rendez-vous", icon: CalendarCheck },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/admin" className="brand-text">
          <span>BELLEVUE <small style={{ fontSize: 11, color: "var(--muted)" }}>admin</small></span>
        </Link>
        <nav className="admin-nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : undefined}>
              <item.icon size={14} /> {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="admin-topbar">
        <span>{email}</span>
        <form action={logoutAction}>
          <button type="submit"><LogOut size={12} /> Déconnexion</button>
        </form>
      </div>

      <main className="admin-main">{children}</main>
    </div>
  );
}
