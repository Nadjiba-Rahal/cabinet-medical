import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BELLEVUE - Cabinet Médical | Prendre rendez-vous en ligne",
  description:
    "Cabinet médical à Alger. Une médecine plus simple, plus humaine - prenez rendez-vous en ligne en quelques clics.",
  openGraph: {
    title: "BELLEVUE - Cabinet Médical",
    description: "Prenez rendez-vous en ligne en quelques clics.",
    type: "website",
  },
  icons: {
    icon: "/images/logo-icon.png",
    shortcut: "/images/logo-icon.png",
    apple: "/images/logo-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
