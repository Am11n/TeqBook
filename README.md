## TeqBook – Multi‑tenant Salon Booking MVP

TeqBook is an opinionated, multi‑tenant salon booking MVP built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**.  
It is designed for salons that take **payment in the salon**, not online, with a strong focus on:

- **Operational simplicity** for salon owners.
- **Multi‑language UX** for both staff and end‑clients.
- **Clean multi‑tenant data isolation** using Supabase Row Level Security.

This repository contains:

- `web/` – the Next.js + Supabase web application (dashboard, public booking, landing page).
- SQL / schema and RLS logic managed directly in Supabase (see `web/docs/plan.md` for the implementation roadmap).

---

## High‑level Architecture

- **Frontend:** Next.js (App Router) with React and TypeScript.
- **Styling & UI:** Tailwind CSS + shadcn/ui component primitives.
- **Backend & Data:** Supabase (Postgres, Auth, Row Level Security, RPC/Postgres functions).
- **Authentication:** Supabase Auth (email/password).
- **Multi‑tenancy:** Achieved through:
  - A `salons` table, owned by a Supabase user.
  - A `profiles` table, linking Supabase auth users to a current `salon_id`.
  - RLS policies that ensure every query is automatically scoped to the current salon.
- **Domain model (MVP):**
  - `salons` – the core tenant entity.
  - `profiles` – per‑user profile and salon linkage.
  - `employees`
  - `services`
  - `shifts` – staff availability and opening hours.
  - `customers`
  - `bookings`
- **Business logic:** Implemented in Postgres functions (called via Supabase RPC), e.g.:
  - `create_salon_for_current_user`
  - `generate_availability`
  - `create_booking_with_validation`

The frontend talks directly to Supabase using the shared client in `web/src/lib/supabase-client.ts`.

---

## Features Overview

### Landing Page

Public marketing site describing TeqBook, built as `web/src/app/landing/page.tsx`:

- Clear positioning around **pay‑in‑salon** booking.
- Modern, mobile‑first layout using shared layout primitives (`Section`, `SectionCard`, `StatsGrid`).
- **Pricing section** with three plans:
  - **TeqBook Starter** – for very small salons (1–2 staff).
  - **TeqBook Pro** – for salons with 3–6 staff that need more control and fewer no‑shows.
  - **TeqBook Business** – for larger/multi‑chair salons that need roles and reporting.
- Pricing copy and plan features are fully translated into all supported languages.
- FAQ and stats sections tied to the same `copy` object per locale.
- Language selector with flags and translations for the entire page.

### Dashboard (Internal App)

The authenticated salon owner & staff experience, built around a reusable layout:

- `DashboardShell` (`web/src/components/dashboard-shell.tsx`):
  - Desktop sidebar with navigation (Overview, Calendar, Employees, Services, Shifts, Customers, Bookings, Onboarding).
  - Mobile nav with slide‑in panel.
  - Integrated language selector with country flags.
  - Brand area showing the TeqBook logo (`Favikon.svg`) and translated tagline.
  - `CurrentUserBadge` and `CurrentSalonBadge` components show context for the current user/salon.

Per‑feature pages:

- `Overview` (`web/src/app/page.tsx`)
  - High‑level metrics (placeholder in MVP) and “next steps” explaining setup.
- `Employees` CRUD (`web/src/app/employees/page.tsx`)
  - Add/edit/delete staff, responsive table + card layout.
- `Services` CRUD (`web/src/app/services/page.tsx`)
  - Manage services, duration, and price.
- `Shifts & Opening Hours` (`web/src/app/shifts/page.tsx`)
  - Define per‑employee weekly availability using localized weekday labels.
- `Customers` CRUD (`web/src/app/customers/page.tsx`)
  - Manage customer profiles with notes.
- `Bookings` (`web/src/app/bookings/page.tsx`)
  - Internal list of bookings, statuses and a “new booking” flow that calls Supabase functions:
    - `generate_availability`
    - `create_booking_with_validation`
- `Calendar` (`web/src/app/calendar/page.tsx`)
  - Internal, per‑employee calendar view for bookings, localized date/time formatting.

Every page is mobile‑first and uses shared building blocks:

- `DashboardShell`, `PageHeader`, `EmptyState`, `TableToolbar`.
- shadcn/ui primitives: `Button`, `Card`, `Table`, `Dialog`, `Badge`, `Input`, `Textarea`, etc.

### Public Booking Page

Path: `web/src/app/book/[salon_slug]/page.tsx` + `web/src/components/public-booking-page.tsx`

- Public booking URL per salon – typically shared on web, Instagram, Google profile, etc.
- Flow:
  1. Resolve `salon_slug` and ensure the salon is public.
  2. Let end‑users select service, staff (optional) and time.
  3. Generate availability via `generate_availability`.
  4. Create a booking via `create_booking_with_validation`, auto‑creating/updating the `customers` row.
  5. Confirm booking with a clear **“Pay at the salon”** message and badge.
- Public language selector with the same set of supported locales as the dashboard.

---

## Internationalization (i18n)

TeqBook is intentionally built for multi‑lingual salons.  
The i18n system is centralized and strongly typed:

- **Locale context**: `web/src/components/locale-provider.tsx`
  - `Locale` union type:
    - `"nb" | "en" | "ar" | "so" | "ti" | "am" | "tr" | "pl" | "vi" | "tl" | "zh" | "fa" | "dar" | "ur" | "hi"`
  - `useLocale()` hook providing `locale` and `setLocale`.

- **Translation namespaces**: `web/src/i18n/translations.ts`
  - `AppLocale` type matches the locales above.
  - Strongly typed namespaces:
    - `publicBooking`, `login`, `onboarding`, `dashboard`, `home`,
      `calendar`, `employees`, `services`, `customers`, `bookings`, `shifts`.

- **Per‑language files** (one file per locale):
  - `nb.ts`, `en.ts`, `ar.ts`, `so.ts`, `ti.ts`, `am.ts`, `tr.ts`,
    `pl.ts`, `vi.ts`, `zh.ts`, `tl.ts`, `fa.ts`, `dar.ts`, `ur.ts`, `hi.ts`.
  - Each exports a `TranslationNamespaces` object for that locale.
  - All login/onboarding/dashboard/home/calendar/CRUD texts are localized.

- **Usage pattern in pages/components**:
  - Derive an `appLocale` from the global `locale`.
  - Access translations via `translations[appLocale].<namespace>`.
  - Example (dashboard home):
    - `const t = translations[appLocale].home;`

The landing page uses its own `copy` object keyed by locale, but mirrors the same set of languages and includes full translations for:

- Hero section
- Pricing (plans, features, add‑ons, tagline)
- Stats
- FAQ
- Footer messaging

---

## Branding

- Product name: **TeqBook** (capital “B”).
- Logo: `web/public/Favikon.svg` used as:
  - Global favicon via `metadata.icons` in `web/src/app/layout.tsx`.
  - Brand logo in:
    - Dashboard sidebar and mobile menu (`DashboardShell`).
    - Landing page top navigation.
- All occurrences of the old name `Eivo` have been migrated to TeqBook across UI and i18n content.

---

## Development Setup

### Prerequisites

- **Node.js** 18+ (or the version used by your environment).
- **npm** (or `pnpm`/`yarn`, but the repo ships with `package-lock.json`).
- **Supabase project** with:
  - Database tables and RLS policies as defined during setup (see `web/docs/plan.md`).
  - Auth configured for email/password sign‑in.
  - Required Postgres functions created:
    - `create_salon_for_current_user`
    - `generate_availability`
    - `create_booking_with_validation`

### Environment Variables

In `web/.env.local` (not committed), set:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

If these are missing, `supabase-client.ts` logs:

```ts
console.warn(
  "[TeqBook] NEXT_PUBLIC_SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_ANON_KEY mangler. Sjekk .env.local."
);
```

### Installing and Running Locally

From the repo root:

```bash
cd web
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

The default routes include:

- Landing page: `/landing`
- Login: `/auth/login`
- Onboarding: `/onboarding`
- Dashboard overview: `/`
- Employees: `/employees`
- Services: `/services`
- Shifts: `/shifts`
- Customers: `/customers`
- Bookings: `/bookings`
- Calendar: `/calendar`
- Public booking: `/book/[salon_slug]`

> Note: Make sure your Supabase tables, RLS policies and functions are in place before exercising the onboarding flow and booking logic, otherwise you will see backend errors from the RPC calls.

---

## Code Structure (Web App)

Key directories under `web/src`:

- `app/`
  - `layout.tsx` – global layout, fonts, `LocaleProvider`, background, metadata + icons.
  - `page.tsx` – dashboard overview (requires login + correct Supabase setup).
  - `(auth)/login/page.tsx` – login page driven by `translations[appLocale].login`.
  - `(onboarding)/onboarding/page.tsx` – onboarding flow that calls `create_salon_for_current_user`.
  - `landing/page.tsx` – public marketing/landing page with pricing and multi‑language copy.
  - Feature routes: `employees`, `services`, `shifts`, `customers`, `bookings`, `calendar`.
  - Public booking: `book/[salon_slug]/page.tsx`.

- `components/`
  - `dashboard-shell.tsx` – main app shell (sidebar, header, language selector).
  - `public-booking-page.tsx` – full public booking UI and RPC integration.
  - `locale-provider.tsx` – global locale context & hook.
  - `page-header.tsx`, `empty-state.tsx`, `section.tsx`, `stats-grid.tsx`, `table-toolbar.tsx`, `form-layout.tsx`.
  - `ui/` – shadcn/ui primitive wrappers (button, card, table, dialog, input, etc.).

- `i18n/`
  - `translations.ts` – types and central export of the `translations` map.
  - One file per locale (`nb.ts`, `en.ts`, `ar.ts`, etc.) with full namespaced translations.

- `lib/`
  - `supabase-client.ts` – shared Supabase client.
  - `utils.ts` – generic helpers.

---

## Quality, Types and Linting

- The project is fully typed with **TypeScript**.
- Types for translation namespaces enforce that every locale implements the same shape.
- Pages use explicit type guards and casts around Supabase responses to keep the compiler honest.
- ESLint is configured in `web/eslint.config.mjs`.  
  Recent iterations included:
  - Fixes for mistaken size props (e.g. `size="xs"` → valid `shadcn/ui` sizes).
  - Correct typing of Supabase query results for bookings, shifts and calendar.

Run linting from the `web/` directory:

```bash
npm run lint
```

---

## Deployment

The web app is designed to be deployed on **Vercel**, backed by **Supabase**:

- Build output is a standard Next.js App Router project.
- Supabase URL and anon key are passed via environment variables.
- No server‑side Node APIs beyond what Next.js already provides – business logic lives in Supabase.

Refer to Vercel’s documentation for deploying a Next.js (App Router) project and Supabase’s documentation for connecting your project securely.

---

## Roadmap (Beyond the MVP)

The current codebase is an MVP with a clear path forward. Future phases, as outlined in `web/docs/plan.md`, include:

- **Notifications:**
  - SMS / email reminders for bookings.
  - No‑show handling and re‑engagement flows.
- **Reporting & Analytics:**
  - Revenue over time, per service, per employee.
  - Capacity utilization and no‑show statistics.
- **Integrations:**
  - POS / card terminals.
  - Accounting and invoicing systems.
- **Multi‑salon owner experience:**
  - Better cross‑salon dashboards.
  - Shared staff / service templates.

TeqBook is intentionally kept small, strongly typed and well‑structured to make these later phases easy to implement on top of the current foundation.

---

## License

This project is licensed under the terms described in `LICENSE` at the repository root.


