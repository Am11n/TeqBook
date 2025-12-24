# TeqBook – Multi-tenant Salon Booking SaaS

TeqBook is a production-ready, multi-tenant salon booking SaaS built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**.  
It is designed for salons that take **payment in the salon**, not online, with a strong focus on:

- **Operational simplicity** for salon owners
- **Multi-language UX** for both staff and end-clients
- **Clean multi-tenant data isolation** using Supabase Row Level Security
- **Enterprise-grade security** with rate limiting, 2FA, and session management
- **SaaS features** with plan-based feature flags and billing integration

**🌐 Production:** [https://teqbook.com](https://teqbook.com)

---

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [Deployment](#deployment)
3. [High-level Architecture](#high-level-architecture)
4. [Features Overview](#features-overview)
5. [Security Features](#security-features)
6. [SaaS Plans & Features](#saas-plans--features)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Development Setup](#development-setup)
9. [Code Structure](#code-structure)
10. [Quality & Standards](#quality--standards)
11. [Documentation](#documentation)
12. [Roadmap](#roadmap)

---

## Repository Structure

This repository contains:

- `web/` – the Next.js + Supabase web application (dashboard, public booking, landing page, admin panel)
- `web/supabase/` – SQL scripts for database schema, RLS policies, and migrations
- `web/docs/` – comprehensive documentation (architecture, security, integrations, deployment)
- SQL / schema and RLS logic managed directly in Supabase

---

## Deployment

TeqBook is deployed on **Vercel** with automatic deployments from the `main` branch. Each push to `main` triggers a new deployment.

- **Production:** Automatically deployed from `main` branch
- **Preview:** Automatically created for pull requests
- **Build:** `npm run build` (handled automatically by Vercel)
- **Domain:** Custom domain configured via Vercel

For detailed deployment information and migration notes, see [`web/docs/deployment/vercel.md`](web/docs/deployment/vercel.md).

---

## High-level Architecture

### Tech Stack

- **Frontend:** Next.js 16.1.1 (App Router) with React 19 and TypeScript
- **Styling & UI:** Tailwind CSS 4 + shadcn/ui component primitives
- **Backend & Data:** Supabase (Postgres, Auth, Row Level Security, RPC/Postgres functions, Edge Functions)
- **Authentication:** Supabase Auth (email/password) with Two-Factor Authentication (2FA)
- **Billing:** Stripe integration for subscriptions and payments
- **Error Tracking:** Sentry (optional, configurable)
- **Testing:** Vitest (unit tests) + Playwright (E2E tests)

### Multi-Tenancy

Achieved through:
- A `salons` table, owned by a Supabase user
- A `profiles` table, linking Supabase auth users to a current `salon_id` and role
- RLS policies that ensure every query is automatically scoped to the current salon
- `SalonProvider` context (`web/src/components/salon-provider.tsx`) centralizes salon data fetching
- Feature flags system that restricts features based on subscription plan

### Domain Model

- `salons` – the core tenant entity (includes `preferred_language`, `salon_type`, `plan`, `billing_customer_id`, etc.)
- `profiles` – per-user profile, salon linkage, role, and `is_superadmin` flag
- `features` – available features in the system
- `plan_features` – mapping of plans to features with limits
- `opening_hours` – salon opening hours per day of week
- `employees` – staff with roles, languages, and service assignments
- `services` – services with categories, estimated time, and sort order
- `shifts` – staff availability and opening hours (linked to employees)
- `customers` – customer profiles with notes and GDPR consent
- `bookings` – bookings with status, walk-in flag, and employee/service linkage
- `products` – inventory items (plan-based feature)
- `addons` – subscription add-ons (extra staff, multilingual booking)

### Business Logic

Implemented in multiple layers:
- **Postgres functions** (called via Supabase RPC):
  - `create_salon_for_current_user` – creates salon with opening hours, preferred language, salon type, etc.
  - `generate_availability` – generates available time slots for booking
  - `create_booking_with_validation` – creates booking with validation logic
- **Service layer** (`web/src/lib/services/`) – business logic and validation:
  - Feature flag validation
  - Role-based access control
  - Input validation
  - Error handling
- **Repository layer** (`web/src/lib/repositories/`) – data access abstraction

The frontend talks directly to Supabase using the shared client in `web/src/lib/supabase-client.ts`.

---

## Features Overview

### Landing Page

Public marketing site describing TeqBook, built as `web/src/app/landing/page.tsx`:

- Serves as the root route (`/`) of the application
- Premium SaaS design with modern gradients, glassmorphism, and smooth animations
- Clear positioning around **pay-in-salon** booking
- Modern, mobile-first layout with responsive hamburger menu
- **Pricing section** with three plans (USD pricing):
  - **TeqBook Starter** – $25/month for very small salons (1–2 staff)
  - **TeqBook Pro** – $50/month for salons with 3–6 staff that need more control and fewer no-shows
  - **TeqBook Business** – $75/month for larger/multi-chair salons that need roles and reporting
- **Add-ons section** with multilingual booking page ($10/month) and extra staff members ($5/month)
- Pricing copy and plan features are fully translated into all 15 supported languages
- FAQ and stats sections tied to the same `copy` object per locale
- Language selector with flags and translations for the entire page
- Animated header that scales logo/text based on scroll position

### Dashboard (Internal App)

The authenticated salon owner & staff experience, built around a reusable layout:

- `DashboardShell` (`web/src/components/layout/dashboard-shell.tsx`):
  - Desktop sidebar with navigation (Overview, Calendar, Employees, Services, Shifts, Customers, Bookings, Products, Reports)
  - Mobile nav with slide-in panel matching desktop sidebar
  - Integrated language selector with country flags (saves to `salons.preferred_language`)
  - Brand area showing the TeqBook logo (`Favikon.svg`)
  - Global search with command palette (⌘K)
  - Notification center
  - User profile dropdown with logout
  - Session timeout warning and management
  - Feature-based navigation (items hidden based on plan)

**Per-feature pages:**

- **Dashboard Overview** (`web/src/app/dashboard/page.tsx`)
  - High-level metrics and "next steps" explaining setup
  - Performance snapshot (plan-based feature)
  - Uses `PageLayout` component for consistent structure

- **Employees** CRUD (`web/src/app/employees/page.tsx`)
  - Add/edit/delete staff with roles, languages, active status, and service assignments
  - Role-based access control (only managers/owners can manage)
  - Responsive table + card layout using `employees` repository

- **Services** CRUD (`web/src/app/services/page.tsx`)
  - Manage services with categories, estimated time, sort order, duration, and price
  - Uses `services` repository
  - Role-based access control

- **Shifts & Opening Hours** (`web/src/app/shifts/page.tsx`)
  - Define per-employee weekly availability using localized weekday labels
  - Shifts are linked to employees for availability logic
  - Plan-based feature (Pro and Business plans)
  - Uses `shifts` and `employees` repositories

- **Customers** CRUD (`web/src/app/customers/page.tsx`)
  - Manage customer profiles with notes
  - GDPR consent tracking
  - Uses `customers` repository
  - All roles can view customers

- **Bookings** (`web/src/app/bookings/page.tsx`)
  - Internal list of bookings with statuses (pending, confirmed, no-show, completed, cancelled)
  - Walk-in vs online booking flag
  - Products integration (plan-based feature)
  - "New booking" flow that calls Supabase functions:
    - `generate_availability`
    - `create_booking_with_validation`
  - Uses `bookings`, `employees`, `services`, and `products` repositories

- **Calendar** (`web/src/app/calendar/page.tsx`)
  - Day and week view with status colors
  - Filter per employee
  - Internal, per-employee calendar view for bookings, localized date/time formatting
  - Uses `employees` and `bookings` repositories

- **Products** (`web/src/app/products/page.tsx`)
  - Lightweight inventory management
  - Plan-based feature (Pro and Business plans)
  - Track products, stock levels, and link to bookings

- **Reports** (`web/src/app/reports/page.tsx`)
  - Advanced reporting and analytics
  - Plan-based feature (Pro and Business plans)
  - Revenue reports, capacity utilization, bookings per service
  - CSV export functionality

- **Settings** (`web/src/app/settings/`)
  - **General** – salon settings (name, type, WhatsApp, languages)
  - **Notifications** – email notification preferences
  - **Billing** – subscription management, plan changes, Stripe integration
  - **Security** – Two-Factor Authentication (2FA) setup and management
  - **Branding** – customize booking page (plan-based feature)

Every page is mobile-first and uses shared building blocks:
- `DashboardShell`, `PageLayout`, `PageHeader`, `EmptyState`, `TableToolbar`
- `ErrorBoundary` for error handling
- `ErrorMessage` component for consistent error display
- shadcn/ui primitives: `Button`, `Card`, `Table`, `Dialog`, `Badge`, `Input`, `Textarea`, etc.

### Admin Panel (Superadmin Only)

Dedicated admin interface for superadmins, built with `AdminShell`:

- **Admin Dashboard** (`web/src/app/admin/page.tsx`)
  - Overview of all salons and users
  - System-wide statistics
  - Quick actions for managing salons

- **Salons Management** (`web/src/app/admin/salons/page.tsx`)
  - View all salons
  - Manage salon plans and settings
  - View salon statistics

- **Users Management** (`web/src/app/admin/users/page.tsx`)
  - View all users across all salons
  - Manage user roles and permissions

- **Analytics** (`web/src/app/admin/analytics/page.tsx`)
  - System-wide analytics and insights

### Public Booking Page

Path: `web/src/app/book/[salon_slug]/page.tsx` + `web/src/components/public-booking-page.tsx`

- Public booking URL per salon – typically shared on web, Instagram, Google profile, etc.
- Flow:
  1. Resolve `salon_slug` and ensure the salon is public
  2. Let end-users select service, staff (optional) and time
  3. Generate availability via `generate_availability`
  4. Create a booking via `create_booking_with_validation`, auto-creating/updating the `customers` row
  5. Confirm booking with a clear **"Pay at the salon"** message and badge
- Public language selector with the same set of supported locales as the dashboard
- Branded booking page (plan-based feature)

---

## Security Features

TeqBook implements enterprise-grade security measures:

### Authentication & Authorization

- **Supabase Auth** with email/password authentication
- **Two-Factor Authentication (2FA)** – TOTP-based via authenticator apps
- **Role-Based Access Control (RBAC)** – owner, manager, staff roles
- **Superadmin** access for system administration
- **Session timeout** – automatic logout after inactivity (30 min default, 7 days with "Keep me logged in")
- **Route protection** – unauthenticated users redirected to login

### Security Measures

- **Rate limiting** – client-side rate limiting for login attempts (5 attempts per 15 minutes, 30-minute block)
- **Password policy** – minimum 8 characters, uppercase, number, special character
- **Security headers** – HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc.
- **Input validation** – server-side validation for all inputs
- **SQL injection protection** – parameterized queries via Supabase client
- **XSS protection** – React escaping, no `dangerouslySetInnerHTML`
- **Error handling** – generic error messages, no sensitive data exposure
- **Structured logging** – Sentry integration for error tracking and security events

### Data Protection

- **Row Level Security (RLS)** – database-level multi-tenant isolation
- **GDPR compliance** – data minimization, consent tracking, right to deletion
- **Encryption** – data encrypted in transit (HTTPS) and at rest (Supabase)
- **Audit logging** – security events logged to Sentry

For detailed security documentation, see [`web/docs/security/security-overview.md`](web/docs/security/security-overview.md).

---

## SaaS Plans & Features

TeqBook uses a plan-based feature flag system:

### Plans

- **Starter** ($25/month) – Basic booking and calendar features
- **Pro** ($50/month) – Starter + shifts, advanced reports, inventory, branding
- **Business** ($75/month) – Pro + roles & access control, exports, customer history

### Feature Flags

Features are controlled via the `features` and `plan_features` tables:
- `BOOKINGS`, `CALENDAR` – Core features (all plans)
- `SHIFTS` – Shift planning (Pro, Business)
- `ADVANCED_REPORTS` – Advanced analytics (Pro, Business)
- `INVENTORY` – Product management (Pro, Business)
- `BRANDING` – Custom booking page (Pro, Business)
- `ROLES_ACCESS` – Advanced RBAC (Business)
- `EXPORTS` – CSV exports (Business)
- `CUSTOMER_HISTORY` – Customer booking history (Business)
- `MULTILINGUAL` – Multi-language support (all plans, with limits)
- `SMS_NOTIFICATIONS`, `EMAIL_NOTIFICATIONS`, `WHATSAPP` – Notification features

### Billing Integration

- **Stripe** integration for subscription management
- Automatic plan updates via webhooks
- Plan change flow with prorated billing
- Add-ons support (extra staff, multilingual booking)

For detailed billing documentation, see [`web/docs/backend/billing-and-plans.md`](web/docs/backend/billing-and-plans.md).

---

## Internationalization (i18n)

TeqBook is intentionally built for multi-lingual salons.  
The i18n system is centralized and strongly typed:

- **Locale context**: `web/src/components/locale-provider.tsx`
  - `Locale` union type supporting 15 languages:
    - `"nb" | "en" | "ar" | "so" | "ti" | "am" | "tr" | "pl" | "vi" | "tl" | "zh" | "fa" | "dar" | "ur" | "hi"`
  - `useLocale()` hook providing `locale` and `setLocale`
  - Default locale is `"en"` (English)

- **Translation namespaces**: `web/src/i18n/translations.ts`
  - `AppLocale` type matches the locales above
  - Strongly typed namespaces:
    - `publicBooking`, `login`, `signup`, `onboarding`, `dashboard`, `home`,
      `calendar`, `employees`, `services`, `customers`, `bookings`, `shifts`, `settings`, `admin`
  - All namespaces are fully typed and enforced across all language files

- **Per-language files** (one file per locale):
  - `nb.ts`, `en.ts`, `ar.ts`, `so.ts`, `ti.ts`, `am.ts`, `tr.ts`,
    `pl.ts`, `vi.ts`, `zh.ts`, `tl.ts`, `fa.ts`, `dar.ts`, `ur.ts`, `hi.ts`
  - Each exports a `TranslationNamespaces` object for that locale
  - All login/signup/onboarding/dashboard/home/calendar/CRUD texts are localized

- **Usage pattern in pages/components**:
  - Derive an `appLocale` from the global `locale` (defaults to `"en"`)
  - Access translations via `translations[appLocale].<namespace>`
  - Example: `const t = translations[appLocale].home;`
  - The `SalonProvider` automatically sets the global locale based on `salons.preferred_language` when a salon is loaded

The landing page uses its own `copy` object keyed by locale, but mirrors the same set of 15 languages and includes full translations for hero, features, pricing, add-ons, stats, FAQ, and footer.

---

## Development Setup

### Prerequisites

- **Node.js** 18+ (or the version used by your environment)
- **npm** (or `pnpm`/`yarn`, but the repo ships with `package-lock.json`)
- **Supabase project** with:
  - Database tables and RLS policies as defined during setup (see `web/supabase/` for SQL scripts)
  - Auth configured for email/password sign-in
  - MFA enabled for 2FA support
  - Required Postgres functions created:
    - `create_salon_for_current_user` (accepts salon type, preferred language, opening hours, etc.)
    - `generate_availability`
    - `create_booking_with_validation`
  - SQL scripts in `web/supabase/`:
    - `onboarding-schema-update.sql` – salon fields, opening hours table
    - `operations-module-enhancements.sql` – enhanced fields for employees, services, bookings
    - `opening-hours-schema.sql` – opening hours table structure
    - `add-features-system.sql` – features and plan_features tables
    - `add-products-table.sql` – products and inventory tables
    - `add-addons-and-plan-limits.sql` – addons and plan limits

### Environment Variables

In `web/.env.local` (not committed), set:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Stripe (required for billing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
NEXT_PUBLIC_APP_URL=<your-app-url>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PRICE_STARTER=<price-id-for-starter>
STRIPE_PRICE_PRO=<price-id-for-pro>
STRIPE_PRICE_BUSINESS=<price-id-for-business>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# Sentry (optional - for error tracking)
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_DSN=<your-sentry-dsn>
```

If Supabase variables are missing, `supabase-client.ts` logs a warning.

### Installing and Running Locally

From the repo root:

```bash
cd web
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Available Routes

- Landing page: `/` (root route)
- Login: `/login`
- Login with 2FA: `/login-2fa`
- Sign up: `/signup`
- Onboarding: `/onboarding`
- Dashboard overview: `/dashboard`
- Employees: `/employees`
- Services: `/services`
- Shifts: `/shifts` (Pro/Business plans)
- Customers: `/customers`
- Bookings: `/bookings`
- Calendar: `/calendar`
- Products: `/products` (Pro/Business plans)
- Reports: `/reports` (Pro/Business plans)
- Settings:
  - General: `/settings/general`
  - Notifications: `/settings/notifications`
  - Billing: `/settings/billing`
  - Security: `/settings/security`
  - Branding: `/settings/branding` (Pro/Business plans)
- Admin (superadmin only):
  - Dashboard: `/admin`
  - Salons: `/admin/salons`
  - Users: `/admin/users`
  - Analytics: `/admin/analytics`
- Public booking: `/book/[salon_slug]`

> **Note:** Make sure your Supabase tables, RLS policies and functions are in place before exercising the onboarding flow and booking logic, otherwise you will see backend errors from the RPC calls.

---

## Code Structure (Web App)

Key directories under `web/src`:

### `app/`

- `layout.tsx` – global layout, fonts, `LocaleProvider`, `SalonProvider`, `ErrorBoundary`, metadata + icons
- `page.tsx` – re-exports landing page (root route)
- `landing/page.tsx` – public marketing/landing page with pricing and multi-language copy
- `(auth)/login/page.tsx` – login page with rate limiting and 2FA support
- `(auth)/login-2fa/page.tsx` – 2FA verification page
- `(auth)/signup/page.tsx` – sign up page with password policy validation
- `(onboarding)/onboarding/page.tsx` – 3-step onboarding wizard with opening hours configuration
- `dashboard/page.tsx` – dashboard overview (requires login + correct Supabase setup)
- Feature routes: `employees`, `services`, `shifts`, `customers`, `bookings`, `calendar`, `products`, `reports`
- Settings routes: `settings/general`, `settings/notifications`, `settings/billing`, `settings/security`, `settings/branding`
- Admin routes: `admin`, `admin/salons`, `admin/users`, `admin/analytics`
- Public booking: `book/[salon_slug]/page.tsx`

### `components/`

- `layout/`:
  - `dashboard-shell.tsx` – main app shell (sidebar, header, language selector, logout, session timeout)
  - `admin-shell.tsx` – admin app shell (separate from dashboard)
  - `page-layout.tsx` – reusable page layout component
  - `page-header.tsx` – page header component
- `salon-provider.tsx` – salon context & `useCurrentSalon()` hook for centralized salon data
- `locale-provider.tsx` – global locale context & hook
- `public-booking-page.tsx` – full public booking UI and RPC integration
- `error-boundary.tsx` – React Error Boundary for error handling
- `feedback/error-message.tsx` – reusable error message component
- `empty-state.tsx`, `section.tsx`, `stats-grid.tsx`, `table-toolbar.tsx`, `form-layout.tsx`
- `command-palette.tsx` – global search and command palette
- `notification-center.tsx` – notification center component
- `ui/` – shadcn/ui primitive wrappers (button, card, table, dialog, input, etc.) + custom components

### `i18n/`

- `translations.ts` – types and central export of the `translations` map
- One file per locale (`nb.ts`, `en.ts`, `ar.ts`, etc.) with full namespaced translations

### `lib/`

- `supabase-client.ts` – shared Supabase client
- `types/` – TypeScript types for entities and DTOs:
  - `domain.ts` – core domain types (Booking, Employee, Service, Customer, etc.)
  - `dto.ts` – data transfer objects
  - `index.ts` – central export
- `repositories/` – repository layer abstracting data access:
  - `employees.ts`, `services.ts`, `bookings.ts`, `customers.ts`, `shifts.ts`, `products.ts`, `reports.ts`, `features.ts`, `admin.ts`
- `services/` – service layer with business logic:
  - `auth-service.ts` – authentication with 2FA support
  - `billing-service.ts` – Stripe integration
  - `feature-flags-service.ts` – feature flag checking
  - `rate-limit-service.ts` – rate limiting for login
  - `session-service.ts` – session timeout management
  - `two-factor-service.ts` – 2FA management
  - `logger.ts` – structured logging with Sentry
  - Plus services for employees, services, bookings, customers, shifts, products, reports, etc.
- `hooks/`:
  - `use-features.ts` – React hook for feature flags
  - `use-session-timeout.ts` – React hook for session timeout
- `utils/`:
  - `access-control.ts` – role-based access control utilities
- `validation/` – input validation schemas:
  - `bookings.ts`, `customers.ts`, `employees.ts`, `services.ts`
- `config/`:
  - `feature-flags.ts` – internal feature flags (for A/B testing, etc.)

---

## Quality & Standards

### Type Safety

- The project is fully typed with **TypeScript**
- Types for translation namespaces enforce that every locale implements the same shape
- Pages use explicit type guards and casts around Supabase responses to keep the compiler honest
- Domain types are centralized in `lib/types/domain.ts`

### Code Quality

- **ESLint** configured in `web/eslint.config.mjs`
- **Prettier** for code formatting
- **Cursor AI Standards** – follows `web/docs/cursor-rule.md` for development standards
- Consistent error handling with `ErrorBoundary` and `ErrorMessage` components
- Input validation at service layer
- Feature validation before operations

### Testing

- **Vitest** for unit tests
- **Playwright** for E2E tests
- Test scripts:
  - `npm run test` – run unit tests
  - `npm run test:ui` – run tests with UI
  - `npm run test:e2e` – run E2E tests

### Linting & Formatting

Run from the `web/` directory:

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without changing files
```

---

## Documentation

Comprehensive documentation is available in `web/docs/`:

### Key Documents

- **[Security Overview](web/docs/security/security-overview.md)** – Complete security architecture and best practices
- **[Implemented Security Features](web/docs/security/implemented-features.md)** – Detailed documentation of security implementations
- **[Sentry Setup Guide](web/docs/security/sentry-setup-guide.md)** – Step-by-step guide for setting up error tracking
- **[Architecture Overview](web/docs/architecture/overview.md)** – System architecture and design principles
- **[Onboarding Guide](web/docs/onboarding.md)** – Developer onboarding guide
- **[Coding Style](web/docs/coding-style.md)** – Coding standards and best practices
- **[Cursor AI Standards](web/docs/cursor-rule.md)** – Development standards for AI-assisted development
- **[Billing & Plans](web/docs/backend/billing-and-plans.md)** – SaaS plan and billing documentation
- **[RLS Strategy](web/docs/backend/rls-strategy.md)** – Row Level Security documentation
- **[Data Lifecycle & GDPR](web/docs/compliance/data-lifecycle.md)** – GDPR compliance documentation

### Documentation Structure

- `/architecture/` – System architecture and design principles
- `/backend/` – Backend documentation (database, RLS, billing)
- `/frontend/` – Frontend documentation (components, UI patterns)
- `/security/` – Security documentation and guides
- `/integrations/` – External integrations (Stripe, Edge Functions)
- `/deployment/` – Deployment guides
- `/compliance/` – GDPR and compliance documentation
- `/testing/` – Testing strategy and guides

See [`web/docs/README.md`](web/docs/README.md) for a complete overview.

---

## Roadmap

The current codebase is a production-ready SaaS with a clear path forward. Future phases include:

### Planned Features

- **Notifications:**
  - SMS / email reminders for bookings
  - No-show handling and re-engagement flows
  - WhatsApp notifications
- **Advanced Reporting:**
  - Revenue forecasting
  - Customer lifetime value
  - Employee performance metrics
- **Integrations:**
  - POS / card terminals
  - Accounting and invoicing systems
  - Calendar sync (Google Calendar, Outlook)
- **Mobile App:**
  - Native mobile apps for iOS and Android
  - Push notifications
- **Multi-salon owner experience:**
  - Better cross-salon dashboards
  - Shared staff / service templates
  - Centralized reporting

### Current Status

- ✅ Core booking functionality
- ✅ Multi-tenant architecture
- ✅ SaaS plans and billing
- ✅ Security features (2FA, rate limiting, session timeout)
- ✅ Admin panel
- ✅ Feature flags system
- ✅ Error tracking (Sentry)
- ✅ GDPR compliance
- ✅ Multi-language support (15 languages)
- ✅ Role-based access control
- ✅ Inventory management (Pro/Business)
- ✅ Advanced reports (Pro/Business)
- ✅ Branding customization (Pro/Business)

TeqBook is intentionally kept well-structured and strongly typed to make future phases easy to implement on top of the current foundation.

---

## License

This project is licensed under the terms described in `LICENSE` at the repository root.

---

**Last Updated:** 2025-01-XX  
**Version:** 2.0  
**Status:** Production Ready
