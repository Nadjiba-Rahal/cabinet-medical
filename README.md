# BELLEVUE — Cabinet Médical

A portfolio project: a premium single-page website for a fictional Algerian
private medical practice, with a real, working online booking flow and a
small admin area behind it.

> **Fictional demo project.** "Cabinet Bellevue," "Dr. Nadia Rahal," and all
> patient/appointment data are invented for demonstration purposes only.

## Overview

The frontend (layout, animations, copy, images) is a fixed design — this
README covers what sits underneath it: a real SQLite database, real
availability checking, and a real booking pipeline, wired into that design
without changing its markup or CSS.

## Features

- Animated single-page site: hero, services, about, "why us," testimonials,
  process, FAQ, contact — all in the original design (Framer Motion,
  particles, dark mode toggle, glass/blur modal)
- **Real booking flow** inside the existing modal: pick a service, pick a
  real open date, pick a real available time slot (server-checked against
  existing bookings), enter contact details, get a confirmation
- Double-booking is prevented server-side inside a database transaction,
  not just hidden in the UI
- Small admin area (`/admin`): login, today's stats, full appointment list
  with confirm/cancel/complete actions, and editable cabinet settings
  (phone, WhatsApp number, address, hours)
- Real `wa.me` WhatsApp deep links (no WhatsApp Business API — see
  "Notifications" below)

## Booking flow

```
Service  ->  Date  ->  Time  ->  Patient info  ->  Confirmation
(step 1)    (step 2)   (step 3)    (step 4)          (step 5)
```

Each step only unlocks once the previous one is valid. The date/time steps
are computed from the cabinet's real opening hours and existing
appointments (`lib/booking/slots.ts`); the final submission re-validates
everything server-side (`actions/appointment.actions.ts`) with Zod, then
creates the appointment inside a SQLite transaction that re-checks for
overlaps immediately before inserting, so two people racing for the same
slot can't both win it.

## Architecture

```
app/
├── page.tsx                  server component: fetches services+settings, renders the design
├── layout.tsx
├── globals.css                the original stylesheet, untouched, with additive
│                               rules appended at the bottom for the info-step form
│                               and the admin panel (nothing above was edited)
└── admin/
    ├── login/page.tsx
    ├── page.tsx                (dashboard)
    ├── appointments/page.tsx
    └── settings/page.tsx

components/
├── bellevue-site.tsx          the original design, now data-driven + booking logic
└── admin/                     small admin UI pieces

actions/                       Server Actions (booking, admin auth, settings)
lib/
├── db/                        SQLite access layer (better-sqlite3)
├── booking/slots.ts           opening-hours + duration -> available time slots
├── validations/appointment.ts Zod schema, shared by client form + server action
├── auth.ts                    admin session (signed HTTP-only cookie)
└── notifications/             WhatsApp deep-link + simulated email adapter

scripts/seed.ts                 demo data (matches the site's 4 service cards 1:1)
```

## Tech stack

Next.js 16 (App Router) - TypeScript - React 19 - Framer Motion -
better-sqlite3 - Zod - React Hook Form - Lucide React

## Database

**Why `better-sqlite3` instead of Prisma:** this was built in a sandboxed
environment whose network allowlist blocked Prisma's engine-binary CDN
(`binaries.prisma.sh`), so `prisma generate`/`migrate` couldn't complete
there and the app couldn't be verified end-to-end with it. `better-sqlite3`
is a plain npm package — no external binary download, synchronous, and
fully testable in that sandbox. The schema (`lib/db/client.ts`) mirrors
exactly what a Prisma `schema.prisma` would declare, so migrating to Prisma
later, with a normal internet connection, is a mechanical change rather
than a rewrite.

**Tables:** `Service`, `Appointment`, `Admin`, `Setting` — see
`lib/db/client.ts` for the exact DDL, or `types/*.ts` for the TS shapes.
Indexes exist on `Appointment.startAt`, `.status`, and the
`(serviceId, startAt)` pair used by the availability check.

The four seeded services (`scripts/seed.ts`) are seeded in the same order
as the hardcoded display cards (icon, colour, feature tags) in
`components/bellevue-site.tsx`, so card *N* always books against seeded
service *N*. If you rename/reorder services from `/admin`, the name/price/
duration shown on the card stays live — only the icon/colour/feature-tag
decoration is static, since those aren't stored fields.

## Notifications

- **WhatsApp:** real `wa.me/<number>` deep links only (`lib/notifications/whatsapp.ts`).
  No WhatsApp Business API is integrated.
- **Email:** `lib/notifications/email.ts` is a **simulated** adapter — it
  logs what would be sent instead of calling a real provider (no
  Resend/SES/etc. credentials are wired in). Swapping in a real provider
  is a one-file change: implement the same function signature and call it
  from the same place in `actions/appointment.actions.ts`.

## Local development

```bash
npm install
npx tsx scripts/seed.ts     # (also: npm run db:seed) creates data/bellevue.db + demo data
npm run dev
```

Visit `http://localhost:3000`. Admin: `http://localhost:3000/admin/login`
— demo credentials `admin@bellevue-cabinet.dz` / `demo1234`.

**Verification run during this build:**

```bash
npx tsc --noEmit   # clean
npx eslint .       # clean
npm run build      # succeeds - / and /admin/login prerender static, /admin* dynamic
```

## Environment variables

| Variable               | Purpose                                              | Default (dev)                |
|-------------------------|-------------------------------------------------------|-------------------------------|
| `DATABASE_URL`          | Kept for naming parity with a future Prisma migration | `file:./dev.db` (not read directly — see `lib/db/client.ts`, which resolves to `data/bellevue.db`) |
| `ADMIN_SESSION_SECRET`  | HMAC secret signing the admin session cookie          | insecure dev fallback — **set a real value before deploying** |

## Hosting

This needs a Node.js server runtime (Server Actions + `better-sqlite3`), so
it is not a static export. Any Node host works (Render, Railway, a VPS,
Docker, etc.) — just make sure:

1. `ADMIN_SESSION_SECRET` is set to a real random value.
2. The `data/` directory is on persistent storage (a plain container
   filesystem gets wiped on redeploy — use a volume, or point `DB_PATH` in
   `lib/db/client.ts` at a mounted path).
3. `npx tsx scripts/seed.ts` is run once against the production database
   (or replace it with your own real services/admin/settings).

## Security notes

- Admin auth is intentionally minimal: bcrypt password check plus a
  signed, HTTP-only session cookie (`lib/auth.ts`) — no external auth
  library, matching this project's "keep it simple" scope. Good enough for
  a small single-admin cabinet site; not a general-purpose auth system.
- Change the demo admin password before putting this anywhere public
  (re-run the seed script with a different password, or add a "change
  password" flow).

## What's intentionally out of scope

No patient accounts, medical records, prescriptions, billing, insurance,
payments, or complex RBAC. Multi-language/RTL support was also left out of
this build in favor of keeping the exact single design provided.

## License

Demo/portfolio project. Not for production use without changing the admin
credentials and session secret.
