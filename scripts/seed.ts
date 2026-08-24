import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

function daysFromNowAt(days: number, hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
}

async function main() {
  console.log("Seeding Cabinet Bellevue (demo/fictional data)…");

  await sql`DELETE FROM "Appointment"`;
  await sql`DELETE FROM "Service"`;
  await sql`DELETE FROM "Setting"`;
  await sql`DELETE FROM "Admin"`;

  const services = [
    {
      id: randomUUID(),
      name: "Consultation générale",
      description:
        "Une approche holistique pour votre bien-être global. Écoute active et diagnostic précis.",
      durationMinutes: 30,
      price: 2500,
      color: "#10b981",
      order: 0,
    },
    {
      id: randomUUID(),
      name: "Consultation spécialisée",
      description:
        "Une expertise approfondie pour des besoins de santé spécifiques avec une approche sur-mesure.",
      durationMinutes: 45,
      price: 3500,
      color: "#8b5cf6",
      order: 1,
    },
    {
      id: randomUUID(),
      name: "Suivi médical",
      description:
        "Un accompagnement continu et personnalisé pour une santé durable et équilibrée.",
      durationMinutes: 30,
      price: 2000,
      color: "#3b82f6",
      order: 2,
    },
    {
      id: randomUUID(),
      name: "Médecine préventive",
      description:
        "Anticiper pour mieux protéger. Une approche proactive pour votre santé future.",
      durationMinutes: 30,
      price: 2500,
      color: "#22c55e",
      order: 3,
    },
  ];

  for (const service of services) {
    await sql`
      INSERT INTO "Service" (
        id,
        name,
        description,
        "durationMinutes",
        price,
        color,
        active,
        "order"
      )
      VALUES (
        ${service.id},
        ${service.name},
        ${service.description},
        ${service.durationMinutes},
        ${service.price},
        ${service.color},
        TRUE,
        ${service.order}
      )
    `;
  }

  const demoAppointments = [
    {
      serviceIdx: 0,
      name: "Amine Boudiaf",
      phone: "0555 12 34 56",
      days: 0,
      hour: 9,
      minute: 0,
      status: "CONFIRMED",
    },
    {
      serviceIdx: 1,
      name: "Yasmine Kaci",
      phone: "0661 22 33 44",
      days: 0,
      hour: 10,
      minute: 30,
      status: "CONFIRMED",
    },
    {
      serviceIdx: 2,
      name: "Karim Belaïd",
      phone: "0770 44 55 66",
      days: 0,
      hour: 11,
      minute: 0,
      status: "PENDING",
    },
    {
      serviceIdx: 0,
      name: "Sara Meziane",
      phone: "0555 88 99 00",
      days: 0,
      hour: 14,
      minute: 0,
      status: "CONFIRMED",
    },
    {
      serviceIdx: 3,
      name: "Nadia Cherif",
      phone: "0661 77 88 99",
      days: 0,
      hour: 15,
      minute: 30,
      status: "CANCELLED",
    },
    {
      serviceIdx: 0,
      name: "Mehdi Larbi",
      phone: "0770 11 22 33",
      days: 1,
      hour: 9,
      minute: 30,
      status: "PENDING",
    },
    {
      serviceIdx: 1,
      name: "Lina Haddad",
      phone: "0555 33 22 11",
      days: 1,
      hour: 11,
      minute: 0,
      status: "CONFIRMED",
    },
    {
      serviceIdx: 2,
      name: "Riad Zoubir",
      phone: "0661 99 00 11",
      days: -1,
      hour: 10,
      minute: 0,
      status: "COMPLETED",
    },
  ];

  for (const appointment of demoAppointments) {
    const service = services[appointment.serviceIdx];
    const startAt = daysFromNowAt(
      appointment.days,
      appointment.hour,
      appointment.minute
    );

    await sql`
      INSERT INTO "Appointment" (
        id,
        "serviceId",
        "fullName",
        phone,
        email,
        message,
        "startAt",
        "endAt",
        status,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${service.id},
        ${appointment.name},
        ${appointment.phone},
        ${appointment.name.split(" ")[0].toLowerCase() + "@example.com"},
        NULL,
        ${startAt},
        ${addMinutes(startAt, service.durationMinutes)},
        ${appointment.status},
        ${new Date().toISOString()},
        ${new Date().toISOString()}
      )
    `;
  }

  const defaults: Record<string, string> = {
    cabinetName: "Cabinet Bellevue",
    phone: "+213 555 00 00 00",
    whatsapp: "213555000000",
    address: "12, rue des Jardins, Bellevue, El Harrach — Alger",
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

  for (const [key, value] of Object.entries(defaults)) {
    await sql`
      INSERT INTO "Setting" (id, key, value)
      VALUES (${randomUUID()}, ${key}, ${value})
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value
    `;
  }

  await sql`
    INSERT INTO "Admin" (
      id,
      email,
      "passwordHash"
    )
    VALUES (
      ${randomUUID()},
      ${"admin@bellevue-cabinet.dz"},
      ${bcrypt.hashSync("demo1234", 10)}
    )
  `;

  console.log("Seed complete.");
  console.log("  Services:", services.length);
  console.log("  Appointments:", demoAppointments.length);
  console.log("  Admin login: admin@bellevue-cabinet.dz / demo1234");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


