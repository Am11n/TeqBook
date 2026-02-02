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

## Quick Start

### Prerequisites

- **Node.js** 20+ and **pnpm**
- **Supabase project** with database schema and RLS policies (see [`supabase/`](supabase/) for migrations)
- **Environment variables** in repo root `.env` or `.env.local` (see [Development Setup](#development-setup) and [`docs/env/env-setup.md`](docs/env/env-setup.md))

### Installation

```bash
pnpm install
```

### Kjør appene

**Utvikling (med hot reload):** Start én app av gangen fra repo-rot:

```bash
pnpm run dev:public      # → http://localhost:3001
pnpm run dev:dashboard   # → http://localhost:3002
pnpm run dev:admin       # → http://localhost:3003
```

**Produksjon (etter build):** Bygg deretter start:

```bash
pnpm run build
pnpm run start:public    # → http://localhost:3001
# eller
pnpm run start:dashboard # → http://localhost:3002
pnpm run start:admin     # → http://localhost:3003
```

Du kan bare kjøre én app om gangen med `start`; for å kjøre flere samtidig, åpne flere terminaler.

For detaljert oppsett, se [`docs/onboarding.md`](docs/onboarding.md).

---

## Architecture

### Tech Stack

- **Frontend:** Next.js 16.1.1 (App Router) with React 19 and TypeScript
- **Styling & UI:** Tailwind CSS 4 + shadcn/ui component primitives
- **Backend & Data:** Supabase (Postgres, Auth, Row Level Security, RPC functions)
- **Authentication:** Supabase Auth with Two-Factor Authentication (2FA)
- **Billing:** Stripe integration for subscriptions
- **Error Tracking:** Sentry (optional)
- **Testing:** Vitest (unit tests) + Playwright (E2E tests)

### Multi-Tenancy

Achieved through Supabase Row Level Security (RLS) with:
- `salons` table as the core tenant entity
- `profiles` table linking users to salons and roles
- Automatic data scoping via RLS policies
- Feature flags system for plan-based access

For detailed architecture documentation, see [`docs/architecture/overview.md`](docs/architecture/overview.md).

---

## Features

### Core Features

- **Booking System** – Internal booking management and public booking page with atomic conflict prevention
- **Calendar** – Day/week views with employee filtering and status colors
- **Employee Management** – Staff CRUD with roles, languages, and service assignments
- **Service Management** – Services with categories, duration, pricing
- **Customer Management** – Customer profiles with booking history and CLV tracking
- **Shifts & Availability** – Per-employee weekly availability (Pro/Business plans)
- **Products & Inventory** – Lightweight inventory management (Pro/Business plans)
- **Reports & Analytics** – Revenue reports, capacity utilization, CSV exports (Pro/Business plans)

### Notifications

- **Email Notifications** – Booking confirmations, reminders, cancellations via Resend
- **In-App Notifications** – Notification center with unread counts
- **Push Notifications** – Web Push API support
- **Calendar Invites** – ICS file generation for booking confirmations
- **Reminders** – Automated booking reminders with configurable timing

### Integrations

- **Google Calendar** – OAuth integration with bidirectional sync
- **Outlook Calendar** – OAuth integration with bidirectional sync
- **Stripe** – Subscription management and billing

### Security

- **Authentication** – Email/password with 2FA (TOTP)
- **Role-Based Access Control** – Owner, manager, staff roles with database-level enforcement
- **Rate Limiting** – Server-side and client-side rate limiting
- **Security Headers** – HSTS, CSP, X-Frame-Options, etc.
- **RLS Hardening** – WITH CHECK clauses and salon_id immutability triggers
- **API Authentication** – All API routes require authentication
- **Audit Logging** – Security audit log and salon activity trail

For detailed security documentation, see [`docs/security/security-overview.md`](docs/security/security-overview.md).

---

## SaaS Plans

TeqBook offers three pricing tiers:

- **Starter** ($25/month) – Basic booking and calendar features
- **Pro** ($50/month) – Starter + shifts, advanced reports, inventory, branding
- **Business** ($75/month) – Pro + roles & access control, exports, customer history

Features are controlled via a plan-based feature flag system. For detailed billing documentation, see [`docs/backend/billing-and-plans.md`](docs/backend/billing-and-plans.md).

---

## Internationalization

TeqBook supports **15 languages**: Norwegian (nb), English (en), Arabic (ar), Somali (so), Tigrinya (ti), Amharic (am), Turkish (tr), Polish (pl), Vietnamese (vi), Tagalog (tl), Chinese (zh), Persian (fa), Dari (dar), Urdu (ur), Hindi (hi).

The i18n system is centralized and strongly typed. For implementation details, see [`docs/architecture/overview.md`](docs/architecture/overview.md#internationalization-i18n).

---

## Development Setup

### Environment Variables

Create `.env.local` in the app you run (e.g. **`apps/dashboard/.env.local`** for the dashboard):

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

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_DSN=<your-sentry-dsn>
```

**Important:** In production, the application will fail to start if Supabase credentials are missing.

### Database Setup

1. Create a Supabase project
2. Run migrations from `supabase/migrations/` in order
3. Configure Auth for email/password sign-in with MFA enabled
4. Create required Postgres functions (see migration files)

For detailed database setup, see [`docs/backend/rls-strategy.md`](docs/backend/rls-strategy.md).

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Check for linting errors
npm run format       # Format code with Prettier
```

---

## Code Structure

The codebase follows a **layered architecture**:

- **`app/`** – Next.js App Router pages and API routes
- **`components/`** – React components (layout, UI primitives, feature components)
- **`lib/services/`** – Business logic layer
- **`lib/repositories/`** – Data access layer
- **`lib/types/`** – TypeScript type definitions
- **`i18n/`** – Translation files (15 languages)

For detailed code structure documentation, see [`docs/architecture/folder-structure.md`](docs/architecture/folder-structure.md).

---

## Documentation

Comprehensive documentation is available in [`docs/`](docs/):

### Key Documents

- **[Onboarding Guide](docs/onboarding.md)** – Developer onboarding guide
- **[Architecture Overview](docs/architecture/overview.md)** – System architecture and design principles
- **[Security Overview](docs/security/security-overview.md)** – Security architecture and best practices
- **[Phase 3 Security Hardening](docs/security/phase3-implementation-status.md)** – Recent security improvements
- **[Coding Style](docs/standards/coding-style.md)** – Coding standards and best practices
- **[Billing & Plans](docs/backend/billing-and-plans.md)** – SaaS plan and billing documentation
- **[RLS Strategy](docs/backend/rls-strategy.md)** – Row Level Security documentation

### Documentation Structure

- `docs/architecture/` – System architecture and design principles
- `docs/backend/` – Backend documentation (database, RLS, billing)
- `docs/frontend/` – Frontend documentation (components, UI patterns)
- `docs/security/` – Security documentation and guides
- `docs/integrations/` – External integrations (Stripe, calendar sync)
- `docs/deployment/` – Deployment guides
- `docs/compliance/` – GDPR and compliance documentation

See [`docs/README.md`](docs/README.md) for a complete overview.

---

## Deployment

TeqBook is deployed on **Vercel** with automatic deployments from the `main` branch.

- **Production:** Automatically deployed from `main` branch
- **Preview:** Automatically created for pull requests

For detailed deployment information, see [`docs/deployment/vercel.md`](docs/deployment/vercel.md).

---

## Current Status

✅ **Production Ready** – All core features implemented and tested

### Implemented Features

- ✅ Core booking functionality with atomic conflict prevention
- ✅ Multi-tenant architecture with RLS hardening
- ✅ SaaS plans and billing (Stripe integration)
- ✅ Security features (2FA, rate limiting, API authentication, Phase 3 hardening)
- ✅ Notifications system (Email, In-App, Push, Calendar Invites)
- ✅ Calendar integrations (Google Calendar, Outlook)
- ✅ Audit logging (Security audit log, salon activity trail)
- ✅ Customer history and CLV tracking
- ✅ Multi-language support (15 languages)
- ✅ Role-based access control (database-level enforcement)
- ✅ Inventory management, advanced reports, branding customization (Pro/Business)

### Roadmap

Future phases include:
- SMS and WhatsApp notifications
- POS / card terminal integrations
- Accounting system integrations (QuickBooks, Xero)
- Native mobile apps
- AI-powered booking suggestions
- Advanced analytics and forecasting

---

## License

This project is licensed under the terms described in `LICENSE` at the repository root.

---

**Last Updated:** 2026-01-23  
**Version:** 2.1  
**Status:** Production Ready (Phase 3 Security Hardening Complete)
