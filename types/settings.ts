export type SettingsMap = {
  cabinetName: string;
  phone: string;
  whatsapp: string;
  address: string;
  email: string;
  openingHours: string; // e.g. "Lun — Sam · 08:00 — 18:00"
  openDays: string; // "1,2,3,4,5,6" (0=Sun..6=Sat)
  openStart: string; // "08:00"
  openEnd: string; // "18:00"
  slotMinutes: string; // "30"
};

export const DEFAULT_SETTINGS: SettingsMap = {
  cabinetName: "Cabinet Bellevue",
  phone: "+213 555 00 00 00",
  whatsapp: "213555000000",
  address: "Centre-ville, Alger",
  email: "contact@bellevue-cabinet.dz",
  openingHours: "Lun — Sam · 08:00 — 18:00",
  openDays: "1,2,3,4,5,6",
  openStart: "08:00",
  openEnd: "18:00",
  slotMinutes: "30",
};
