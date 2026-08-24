export type SettingsMap = {
  cabinetName: string;
  phone: string;
  whatsapp: string;
  address: string;
  email: string;
  openingHours: string; // e.g. "Lun — Sam · 08:00 — 18:00"
  openDays: string; // "1,2,3,4,5,6" (0=Sun..6=Sat)
  openingDays: string; // "1,2,3,4,5,6" (0=Sun..6=Sat)
  weeklyHours: string; // JSON map of day number to { start, end }
  breakEnabled: string;
  breakStart: string;
  breakEnd: string;
  appointmentInterval: string;
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
  openingDays: "1,2,3,4,5,6",
  weeklyHours: JSON.stringify({
    1: { start: "08:00", end: "18:00" },
    2: { start: "08:00", end: "18:00" },
    3: { start: "08:00", end: "18:00" },
    4: { start: "08:00", end: "18:00" },
    5: { start: "08:00", end: "18:00" },
    6: { start: "08:00", end: "18:00" },
    0: { start: "08:00", end: "18:00" },
  }),
  breakEnabled: "false",
  breakStart: "12:00",
  breakEnd: "13:00",
  appointmentInterval: "30",
  openStart: "08:00",
  openEnd: "18:00",
  slotMinutes: "30",
};
