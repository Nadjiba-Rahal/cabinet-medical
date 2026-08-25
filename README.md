
<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-4-E84D10?style=for-the-badge&logo=zod&logoColor=white" />
</p>

<h1 align="center">BELLEVUE</h1>
<h3 align="center">Medical Practice Management System</h3>

<p align="center">
  <em>Real-time booking, transactional integrity, and administrative control.</em>
</p>
<!-- LIVE DEMO URL -->
<p align="center">
  <strong>Live Demo:</strong> <a href="https://cabinet-medical-five.vercel.app/">cabinet-medical-five.vercel.app</a>
</p>



<!-- PROJECT SCREENSHOT -->
<p align="center">
  <img src="https://via.placeholder.com/1200x600/0f172a/ffffff?text=Replace+with+your+website+screenshot" alt="Bellevue Dashboard Screenshot" width="100%" />
</p>

---

## Core Features

| Patient Experience | Administrative Backend |
| :--- | :--- |
| Animated Single-Page Application (Framer Motion) | Secure Admin Authentication (bcrypt, HTTP-only cookies) |
| Multi-Step Real-Time Booking Flow | Appointment Confirm / Cancel / Complete Management |
| Dynamic Time-Slot Computation (Opening Hours) | Editable Practice Settings (Phone, Hours, Address) |
| WhatsApp `wa.me` Deep Linking | Daily Operational Statistics & Queue Overview |

---

## Booking Pipeline

```mermaid
graph TD
    A[Select Service] --> B[Select Date]
    B --> C[Select Time Slot]
    C --> D[Enter Patient Info]
    D --> E[Validate with Zod]
    E --> F{Server-Side Transaction}
    F -->|Overlap Check| G[Appointment Saved]
    F -->|Overlap Detected| C
```

The final submission is wrapped in a SQLite `TRANSACTION`, re-checking time-slot overlaps immediately before insert. This guarantees **no double-booking**, even under race conditions.

---

## Architecture

```mermaid
graph LR
    subgraph Frontend
        A[Patient Site]
        B[Admin Dashboard]
    end

    subgraph Actions
        C[Server Actions]
        D[Auth Actions]
    end

    subgraph Data Layer
        E[lib/db - SQLite]
        F[lib/booking - Slots]
        G[lib/validations - Zod]
    end

    A --> C
    B --> D
    C --> E
    C --> F
    C --> G
    D --> E
```

- **`app/`**: Next.js App Router (Server Components)
- **`components/`**: UI Components (Patient + Admin)
- **`actions/`**: Server Actions (Booking, Auth, Settings)
- **`lib/db/`**: Database Access Layer
- **`lib/booking/`**: Time-Slot Algorithms
- **`lib/validations/`**: Shared Zod Schemas

---

## Database Schema

```mermaid
erDiagram
    SERVICE ||--o{ APPOINTMENT : "contains"
    ADMIN ||--o{ APPOINTMENT : "manages"

    SERVICE {
        int id PK
        string name
        float price
        int duration
    }

    APPOINTMENT {
        int id PK
        int serviceId FK
        datetime startAt
        string status
    }

    ADMIN {
        int id PK
        string email
        string password
    }

    SETTING {
        string key PK
        string value
    }
```

---

## Getting Started

```bash
npm install
npx tsx scripts/seed.ts
npm run dev
```

**Admin Panel:** `http://localhost:3000/admin/login`  
**Demo Credentials:** `admin@bellevue-cabinet.dz` / `demo1234`

---

## Deployment Notes

- Requires a **Node.js runtime** (Server Actions + SQLite).
- Set `ADMIN_SESSION_SECRET` to a secure random string.
- Ensure `data/` directory is mounted on **persistent storage**.

---

<p align="center">
  <em>Portfolio Project. Built by Nadjiba Rahal.</em>
</p>
