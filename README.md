## TeqBook – Multi‑tenant Salon Booking MVP

TeqBook is an opinionated, multi‑tenant salon booking MVP built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**.  
It is designed for salons that take **payment in the salon**, not online, with a strong focus on:

- **Operational simplicity** for salon owners.
- **Multi‑language UX** for both staff and end‑clients.
- **Clean multi‑tenant data isolation** using Supabase Row Level Security.

**🌐 Production:** [https://teqbook.com](https://teqbook.com)

This repository contains:

- `web/` – the Next.js + Supabase web application (dashboard, public booking, landing page).
- SQL / schema and RLS logic managed directly in Supabase (see `web/docs/plan.md` for the implementation roadmap).

### Deployment

TeqBook is deployed on **Vercel** with automatic deployments from the `main` branch. Each push to `main` triggers a new deployment.

- **Production:** Automatically deployed from `main` branch
- **Preview:** Automatically created for pull requests
- **Build:** `npm run build` (handled automatically by Vercel)

For detailed deployment information and migration notes, see [`web/docs/deployment/vercel.md`](web/docs/deployment/vercel.md).

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
  - `SalonProvider` context (`web/src/components/salon-provider.tsx`) centralizes salon data fetching.
- **Domain model (MVP):**
  - `salons` – the core tenant entity (includes `preferred_language`, `salon_type`, `online_booking_enabled`, etc.).
  - `profiles` – per‑user profile and salon linkage.
  - `opening_hours` – salon opening hours per day of week.
  - `employees` – staff with roles, languages, and service assignments.
  - `services` – services with categories, estimated time, and sort order.
  - `shifts` – staff availability and opening hours (linked to employees).
  - `customers` – customer profiles with notes.
  - `bookings` – bookings with status, walk-in flag, and employee/service linkage.
- **Business logic:** Implemented in Postgres functions (called via Supabase RPC), e.g.:
  - `create_salon_for_current_user` – creates salon with opening hours, preferred language, salon type, etc.
  - `generate_availability` – generates available time slots for booking.
  - `create_booking_with_validation` – creates booking with validation logic.
- **Data access:** Repository pattern (`web/src/lib/repositories/`) abstracts Supabase calls from UI components, enabling future migration to Edge Functions, caching, and logging.

The frontend talks directly to Supabase using the shared client in `web/src/lib/supabase-client.ts`.

---

## Features Overview

### Landing Page

Public marketing site describing TeqBook, built as `web/src/app/landing/page.tsx`:

- Serves as the root route (`/`) of the application.
- Premium SaaS design with modern gradients, glassmorphism, and smooth animations.
- Clear positioning around **pay‑in‑salon** booking.
- Modern, mobile‑first layout with responsive hamburger menu.
- **Pricing section** with three plans (USD pricing):
  - **TeqBook Starter** – $25/month for very small salons (1–2 staff).
  - **TeqBook Pro** – $50/month for salons with 3–6 staff that need more control and fewer no‑shows.
  - **TeqBook Business** – $75/month for larger/multi‑chair salons that need roles and reporting.
- **Add-ons section** with multilingual booking page ($10/month) and extra staff members ($5/month).
- Pricing copy and plan features are fully translated into all 15 supported languages.
- FAQ and stats sections tied to the same `copy` object per locale.
- Language selector with flags and translations for the entire page.
- Animated header that scales logo/text based on scroll position.
- Clickable logo that scrolls to top when on landing page.

### Dashboard (Internal App)

The authenticated salon owner & staff experience, built around a reusable layout:

- `DashboardShell` (`web/src/components/dashboard-shell.tsx`):
  - Desktop sidebar with navigation (Overview, Calendar, Employees, Services, Shifts, Customers, Bookings).
  - Mobile nav with slide‑in panel.
  - Integrated language selector with country flags (saves to `salons.preferred_language`).
  - Brand area showing the TeqBook logo (`Favikon.svg`) and translated tagline.
  - Logout button in header and mobile menu (redirects to landing page).
  - `CurrentUserBadge` and `CurrentSalonBadge` components show context for the current user/salon.

Per‑feature pages:

- `Dashboard Overview` (`web/src/app/dashboard/page.tsx`)
  - High‑level metrics (placeholder in MVP) and "next steps" explaining setup.
- `Employees` CRUD (`web/src/app/employees/page.tsx`)
  - Add/edit/delete staff with roles, languages, active status, and service assignments.
  - Responsive table + card layout using `employees` repository.
- `Services` CRUD (`web/src/app/services/page.tsx`)
  - Manage services with categories, estimated time, sort order, duration, and price.
  - Uses `services` repository.
- `Shifts & Opening Hours` (`web/src/app/shifts/page.tsx`)
  - Define per‑employee weekly availability using localized weekday labels.
  - Shifts are linked to employees for availability logic.
  - Uses `shifts` and `employees` repositories.
- `Customers` CRUD (`web/src/app/customers/page.tsx`)
  - Manage customer profiles with notes.
  - Uses `customers` repository.
- `Bookings` (`web/src/app/bookings/page.tsx`)
  - Internal list of bookings with statuses (pending, confirmed, no-show, completed, cancelled).
  - Walk-in vs online booking flag.
  - "New booking" flow that calls Supabase functions:
    - `generate_availability`
    - `create_booking_with_validation`
  - Uses `bookings`, `employees`, and `services` repositories.
- `Calendar` (`web/src/app/calendar/page.tsx`)
  - Day and week view with status colors.
  - Filter per employee.
  - Internal, per‑employee calendar view for bookings, localized date/time formatting.
  - Uses `employees` and `bookings` repositories.

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
  - `Locale` union type supporting 15 languages:
    - `"nb" | "en" | "ar" | "so" | "ti" | "am" | "tr" | "pl" | "vi" | "tl" | "zh" | "fa" | "dar" | "ur" | "hi"`
  - `useLocale()` hook providing `locale` and `setLocale`.
  - Default locale is `"en"` (English).

- **Translation namespaces**: `web/src/i18n/translations.ts`
  - `AppLocale` type matches the locales above.
  - Strongly typed namespaces:
    - `publicBooking`, `login`, `signup`, `onboarding`, `dashboard`, `home`,
      `calendar`, `employees`, `services`, `customers`, `bookings`, `shifts`.
  - All namespaces are fully typed and enforced across all language files.

- **Per‑language files** (one file per locale):
  - `nb.ts`, `en.ts`, `ar.ts`, `so.ts`, `ti.ts`, `am.ts`, `tr.ts`,
    `pl.ts`, `vi.ts`, `zh.ts`, `tl.ts`, `fa.ts`, `dar.ts`, `ur.ts`, `hi.ts`.
  - Each exports a `TranslationNamespaces` object for that locale.
  - All login/signup/onboarding/dashboard/home/calendar/CRUD texts are localized.

- **Usage pattern in pages/components**:
  - Derive an `appLocale` from the global `locale` (defaults to `"en"`).
  - Access translations via `translations[appLocale].<namespace>`.
  - Example (dashboard home):
    - `const t = translations[appLocale].home;`
  - The `SalonProvider` automatically sets the global locale based on `salons.preferred_language` when a salon is loaded.

The landing page uses its own `copy` object keyed by locale, but mirrors the same set of 15 languages and includes full translations for:

- Hero section (title, subtitle, CTAs, badge)
- Feature strip
- Pricing (plans, features, add‑ons, tagline)
- Add-ons section (multilingual booking, extra staff)
- Stats
- FAQ
- Footer messaging
- Header navigation (Sign up, Log in buttons)

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
  - Database tables and RLS policies as defined during setup (see `web/supabase/` for SQL scripts).
  - Auth configured for email/password sign‑in.
  - Required Postgres functions created:
    - `create_salon_for_current_user` (accepts salon type, preferred language, opening hours, etc.)
    - `generate_availability`
    - `create_booking_with_validation`
  - SQL scripts in `web/supabase/`:
    - `onboarding-schema-update.sql` – salon fields, opening hours table
    - `operations-module-enhancements.sql` – enhanced fields for employees, services, bookings
    - `opening-hours-schema.sql` – opening hours table structure

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

- Landing page: `/` (root route)
- Login: `/login`
- Sign up: `/signup`
- Onboarding: `/onboarding`
- Dashboard overview: `/dashboard`
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
  - `layout.tsx` – global layout, fonts, `LocaleProvider`, `SalonProvider`, background, metadata + icons.
  - `page.tsx` – re-exports landing page (root route).
  - `landing/page.tsx` – public marketing/landing page with pricing and multi‑language copy.
  - `(auth)/login/page.tsx` – login page with premium design matching landing page.
  - `(auth)/signup/page.tsx` – sign up page with premium design matching landing page.
  - `(onboarding)/onboarding/page.tsx` – 3-step onboarding wizard with opening hours configuration.
  - `dashboard/page.tsx` – dashboard overview (requires login + correct Supabase setup).
  - Feature routes: `employees`, `services`, `shifts`, `customers`, `bookings`, `calendar`.
  - Public booking: `book/[salon_slug]/page.tsx`.

- `components/`
  - `dashboard-shell.tsx` – main app shell (sidebar, header, language selector, logout).
  - `salon-provider.tsx` – salon context & `useCurrentSalon()` hook for centralized salon data.
  - `locale-provider.tsx` – global locale context & hook.
  - `public-booking-page.tsx` – full public booking UI and RPC integration.
  - `page-header.tsx`, `empty-state.tsx`, `section.tsx`, `stats-grid.tsx`, `table-toolbar.tsx`, `form-layout.tsx`.
  - `ui/` – shadcn/ui primitive wrappers (button, card, table, dialog, input, etc.) + custom components like `logo-loop.tsx`.

- `i18n/`
  - `translations.ts` – types and central export of the `translations` map.
  - One file per locale (`nb.ts`, `en.ts`, `ar.ts`, etc.) with full namespaced translations.

- `lib/`
  - `supabase-client.ts` – shared Supabase client.
  - `types.ts` – TypeScript types for entities (Employee, Service, Booking, Customer, Shift).
  - `repositories/` – repository layer abstracting data access:
    - `employees.ts` – CRUD operations for employees.
    - `services.ts` – CRUD operations for services.
    - `bookings.ts` – CRUD operations for bookings.
    - `customers.ts` – CRUD operations for customers.
    - `shifts.ts` – CRUD operations for shifts.
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


