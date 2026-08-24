import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS "Service" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      "durationMinutes" INTEGER NOT NULL,
      price INTEGER,
      color TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      "order" INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_service_active
    ON "Service"(active)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Appointment" (
      id TEXT PRIMARY KEY,
      "serviceId" TEXT NOT NULL REFERENCES "Service"(id),
      "fullName" TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT,
      "startAt" TEXT NOT NULL,
      "endAt" TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TEXT NOT NULL DEFAULT NOW()::text,
      "updatedAt" TEXT NOT NULL DEFAULT NOW()::text
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_appt_startAt
    ON "Appointment"("startAt")
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_appt_status
    ON "Appointment"(status)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_appt_service_start
    ON "Appointment"("serviceId", "startAt")
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Admin" (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "createdAt" TEXT NOT NULL DEFAULT NOW()::text
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Setting" (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    )
  `;

  console.log("Neon schema created successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
