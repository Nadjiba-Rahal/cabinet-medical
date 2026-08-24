import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { getAdminByEmail } from "./db/admin";

const SESSION_COOKIE = "bellevue_admin_session";
const SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "dev-only-insecure-secret-change-me";

const MAX_AGE_SECONDS = 60 * 60 * 8;

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compareSync(plain, hash);
}

export async function verifyAdminCredentials(
  email: string,
  password: string
) {
  const admin = await getAdminByEmail(email.trim().toLowerCase());

  if (!admin) return null;

  return verifyPassword(password, admin.passwordHash)
    ? admin
    : null;
}

export async function createAdminSession(email: string) {
  const payload = `${email}.${Date.now() + MAX_AGE_SECONDS * 1000}`;
  const token = `${payload}.${sign(payload)}`;

  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const [email, expiresStr, signature] = token.split(".");

  if (!email || !expiresStr || !signature) {
    return null;
  }

  const payload = `${email}.${expiresStr}`;
  const expected = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (
    sigBuf.length !== expBuf.length ||
    !timingSafeEqual(sigBuf, expBuf)
  ) {
    return null;
  }

  if (Date.now() > Number(expiresStr)) {
    return null;
  }

  return { email };
}
