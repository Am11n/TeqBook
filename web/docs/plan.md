# Eivo MVP – AI-Agent Ready Task Tree

**Prosjekt:** Eivo MVP
**Beskrivelse:** Full AI-agent ready roadmap for Eivo, Nordic-inspired salon booking SaaS with physical payment only.

---

## 🌟 PHASE 1 – FOUNDATION / AUTH / MULTI-TENANCY

**Mål:** Sørg for at repo og Supabase er klar for multi-tenancy og at grunnleggende RLS-policyer er på plass.

### Tasks

* **F1-1:** Verify GitHub repo structure (frontend + edge functions) – *not started*
* **F1-2:** Setup Next.js + TypeScript + TailwindCSS + shadcn/UI – ✅ *done*
* **F1-3:** Confirm Supabase Auth works, with JWT claims for salon_id – ✅ *done* (JWT-claims for `salon_id` gjenstår)
* **F1-4:** Create tables: `users`, `salons`, `employees` (if not exist) – ✅ *done* (`salons` + `profiles` + `employees` opprettet via Supabase)
* **F1-5:** Setup RLS policies for multi-tenancy – ✅ *done* (på `salons` + `profiles`)
* **F1-6:** Implement onboarding flow: create salon + default admin user – ✅ *done*

✅ **Output:** Repo + Supabase + multi-tenancy + RLS + onboarding klar.

---

## 🌟 PHASE 2 – SALON MANAGEMENT CORE

**Mål:** Salong kan administrere ansatte, tjenester og shifts.

### Tasks

* **S2-1:** Frontend CRUD for Employees (add, edit, delete) – ✅ *done* (side `/employees` med opprettelse, aktiv/inaktiv + sletting)
* **S2-2:** Frontend CRUD for Services (name, duration, price, active) – ✅ *done* (side `/services` med opprettelse, aktiv/inaktiv + sletting)
* **S2-3:** Implement Staff Shifts / Availability with validation – *not started*
* **S2-4:** Create Dashboard layout (Sidebar, Navbar, Cards, Tables, Dialogs) – ✅ *done* (gjenbrukbar `DashboardShell` + shadcn-ui `Table`, `Button`, `Dialog` m.m.)

✅ **Output:** Salong kan administrere ansatte, tjenester og åpningstider.

---

## 🌟 PHASE 3 – BOOKING ENGINE

**Mål:** Intern kalender, booking logikk, kunderegister.

### Tasks

* **B3-1:** Create `customers` table (id, salon_id, name, email, phone, created_at) – ✅ *done* (tabell + RLS opprettet i Supabase)
* **B3-2:** Create `bookings` table (id, salon_id, employee_id, service_id, customer_id, start_time, end_time, status) – ✅ *done* (tabell + RLS opprettet i Supabase)
* **B3-3:** Implement Internal Calendar (React, drag & drop, color-coded employees) – ✅ *done* (side `/calendar` med per-dag-visning gruppert på ansatte, mobil + desktop, klar for videre drag & drop)
* **B3-4:** Edge Function: generate-availability (validate shifts + bookings) – ✅ *done* (Postgres-funksjon `generate_availability` opprettet)
* **B3-5:** Implement Booking logic: validate overlapping times & service duration + auto-create/update `customers` on each booking – ✅ *done* (funksjon `create_booking_with_validation` + unik constraint på `customers(salon_id, email)`)
* **B3-6:** Customer CRUD module (notes, GDPR consent) – ✅ *done* (side `/customers` med CRUD, notater og GDPR-samtykke)

✅ **Output:** Salong kan booke kunder internt.

---

## 🌟 PHASE 4 – PUBLIC BOOKING PAGE (Physical Payment Only)

**Mål:** Kunde kan booke time → betaling skjer fysisk i salong.

### Tasks

* **P4-1:** Next.js dynamic route `/book/[salon_slug]` – ✅ *done* (route + komponent `PublicBookingPage` som henter salong/tjenester/ansatte via anon Supabase)
* **P4-2:** Implement booking flow: service → employee → time → customer info (auto-upsert to `customers` and link `customer_id` on booking) – ✅ *done* (full flow på `/book/[salon_slug]` som kaller `create_booking_with_validation`)
* **P4-3:** Edge Function: validate availability & create booking record – ✅ *done* (gjenbrukt `generate_availability` + `create_booking_with_validation` fra offentlig bookingside)
* **P4-4:** Frontend: show only 'Betal hos {salongnavn}' option – ✅ *done* (tydelig tekst + badge 'Betal i salong' på `/book/[salon_slug]`)
* **P4-5:** Edge Function: send-email confirmation with 'Pay at salon' message – ⏩ *moved to Phase 5* (samles med øvrige notifikasjoner)
* **P4-6:** UI Badge / Confirmation page shows 'Betal hos salong' – ✅ *done* (bekreftelsestekst med betaling i salong på offentlig bookingside)

✅ **Output:** Kunder kan booke timer, fysisk betaling kun.

---

## 🌟 PHASE 5 – NOTIFICATIONS & REMINDERS

### Tasks

* **N5-1:** Edge function: send-email for booking confirmations – *not started*
* **N5-2:** Edge function: send-sms reminders 24h before booking – *not started*
* **N5-3:** Ensure messages contain 'Pay at salon' – *not started*
* **N5-4:** Edge function: send-email confirmation with 'Pay at salon' message (moved from P4-5) – *not started*

✅ **Output:** Automatisk reminders klar.

---

## 🌟 PHASE 6 – MVP LAUNCH

### Tasks

* **M6-1:** QA: multi-tenancy & RLS testing – *not started*
* **M6-2:** QA: internal booking flow – *not started*
* **M6-3:** QA: public booking page with physical payment – *not started*
* **M6-4:** Deploy frontend to Vercel – *not started*
* **M6-5:** Deploy edge functions to Supabase – *not started*
* **M6-6:** Setup analytics tracking: bookings, services, employees – *not started*

✅ **Output:** MVP live, alt klar for kunder.

---

## 🌟 Future Phase – Kassasystem (Post-MVP)

### Tasks

* **F7-1:** Integrate Stripe Terminal per salon – *not started*
* **F7-2:** Implement Z-report and cash sales tracking – *not started*
* **F7-3:** Add product sales & transaction history in dashboard – *not started*

✅ **Output:** Kassasystem fases inn etter MVP.
