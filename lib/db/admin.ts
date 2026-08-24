import { sql } from "./client";

export type AdminRow = {
  id: string;
  email: string;
  passwordHash: string;
};

export async function getAdminByEmail(
  email: string
): Promise<AdminRow | undefined> {
  const rows = await sql`
    SELECT id, email, "passwordHash"
    FROM "Admin"
    WHERE email = ${email}
    LIMIT 1
  `;

  return rows.length > 0
    ? (rows[0] as AdminRow)
    : undefined;
}
