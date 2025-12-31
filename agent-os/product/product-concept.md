# TeqBook Product Concept

## Product Idea

**TeqBook** is a production-ready, multi-tenant salon booking SaaS that helps salon owners manage their business operations efficiently. The core concept is to provide a comprehensive booking and management system designed specifically for salons that take **payment in the salon** (not online), with a strong focus on operational simplicity, multi-language support, and enterprise-grade security.

**Core Purpose:** Enable salon owners to manage bookings, staff, services, customers, and business operations through a modern, intuitive web application with multi-tenant data isolation and plan-based feature access.

---

## Key Features

### 1. **Multi-Tenant Salon Management**
- Complete salon setup and configuration
- Multi-tenant data isolation using Supabase Row Level Security (RLS)
- Salon-specific settings (name, type, preferred language, opening hours)
- Plan-based feature access (Starter, Pro, Business plans)

### 2. **Employee Management**
- Full CRUD operations for staff members
- Role-based access control (owner, manager, staff)
- Employee availability and shift management
- Service assignments per employee
- Multi-language support per employee

### 3. **Service Management**
- Create and manage services with categories
- Set duration, price, and estimated time
- Service-to-employee assignments
- Active/inactive status management
- Sort order configuration

### 4. **Booking System**
- Internal booking management (create, edit, cancel bookings)
- Public booking page for customers (`/book/[salon_slug]`)
- Booking status management (pending, confirmed, no-show, completed, cancelled)
- Walk-in vs online booking distinction
- Availability generation via Postgres functions
- Booking validation and conflict prevention

### 5. **Calendar View**
- Day and week calendar views
- Employee filtering
- Status-based color coding
- Localized date/time formatting
- Real-time booking display

### 6. **Customer Management**
- Customer profile management (CRUD)
- Customer notes and history
- GDPR consent tracking
- Automatic customer creation during booking
- Customer search and filtering

### 7. **Shift & Availability Management**
- Per-employee weekly availability configuration
- Shift planning and management
- Opening hours configuration
- Plan-based feature (Pro and Business plans)

### 8. **Products & Inventory** (Plan-based: Pro/Business)
- Lightweight inventory management
- Product tracking
- Stock level management
- Product-to-booking linkage

### 9. **Reports & Analytics** (Plan-based: Pro/Business)
- Revenue reports
- Capacity utilization metrics
- Bookings per service analytics
- CSV export functionality
- Advanced reporting features

### 10. **Public Booking Page**
- Customer-facing booking interface
- Service and staff selection
- Time slot availability
- Multi-language support (15 languages)
- Branded booking page (plan-based feature)
- Clear "Pay at the salon" messaging

### 11. **Authentication & Security**
- Email/password authentication via Supabase Auth
- Two-Factor Authentication (2FA) - TOTP-based
- Rate limiting for login attempts
- Session timeout management
- Role-based access control (RBAC)
- Superadmin access for system administration

### 12. **Settings & Configuration**
- **General Settings:** Salon name, type, WhatsApp, languages
- **Notifications:** Email notification preferences
- **Billing:** Subscription management, plan changes, Stripe integration
- **Security:** 2FA setup and management
- **Branding:** Customize booking page (plan-based feature)

### 13. **Admin Panel** (Superadmin Only)
- System-wide salon management
- User management across all salons
- Analytics and insights
- Salon statistics and overview

### 14. **Internationalization (i18n)**
- Support for 15 languages: Norwegian (nb), English (en), Arabic (ar), Somali (so), Tigrinya (ti), Amharic (am), Turkish (tr), Polish (pl), Vietnamese (vi), Tagalog (tl), Chinese (zh), Persian (fa), Dari (dar), Urdu (ur), Hindi (hi)
- Fully translated dashboard, booking pages, and landing page
- Locale-based date/time formatting
- Language selector with country flags

### 15. **SaaS Plans & Billing**
- Three pricing tiers: Starter ($25/month), Pro ($50/month), Business ($75/month)
- Stripe integration for subscription management
- Plan-based feature flags
- Add-ons support (extra staff, multilingual booking)
- Automatic plan updates via webhooks

### 16. **Landing Page**
- Public marketing site with modern design
- Pricing section with plan comparison
- Features showcase
- FAQ section
- Multi-language support
- Animated header and smooth transitions

---

## Target Users

### Primary Customers

1. **Salon Owners** (Primary)
   - **Role:** Business owners managing one or more salons
   - **Context:** Need to manage bookings, staff, services, and business operations efficiently
   - **Pain Points:**
     - Manual booking management is time-consuming and error-prone
     - Difficulty tracking customer history and preferences
     - Staff scheduling and availability management is complex
     - Need multi-language support for diverse customer base
     - Want to offer online booking without payment processing complexity
   - **Goals:**
     - Streamline booking operations
     - Reduce no-shows through better communication
     - Improve customer experience with online booking
     - Track business performance and revenue
     - Manage staff schedules efficiently

2. **Salon Staff** (Secondary)
   - **Role:** Employees working in salons (managers, stylists, technicians)
   - **Context:** Need to view their schedule, manage bookings, and access customer information
   - **Pain Points:**
     - Need quick access to their schedule and bookings
     - Want to see customer history and preferences
     - Need to update booking statuses easily
   - **Goals:**
     - View personal calendar and bookings
     - Access customer information quickly
     - Update booking statuses
     - Manage their availability

3. **End Customers** (Tertiary)
   - **Role:** People booking salon services
   - **Context:** Want to book appointments online easily
   - **Pain Points:**
     - Phone booking is inconvenient
     - Want to see available time slots
     - Prefer booking in their native language
   - **Goals:**
     - Book appointments online easily
     - See real-time availability
     - Book in preferred language
     - Receive booking confirmations

---

## Implemented Routes/Modules

### Public Routes
- ✅ `/` (root) - Landing page (marketing site)
- ✅ `/landing` - Landing page (explicit route)
- ✅ `/book/[salon_slug]` - Public booking page
- ✅ `/book/[salon_slug]/confirmation` - Booking confirmation page

### Authentication Routes
- ✅ `/login` - Login page with rate limiting
- ✅ `/login-2fa` - Two-factor authentication page
- ✅ `/signup` - User registration page

### Onboarding
- ✅ `/onboarding` - 3-step onboarding wizard (salon setup, opening hours, preferences)

### Dashboard Routes (Authenticated)
- ✅ `/dashboard` - Dashboard overview with metrics and next steps
- ✅ `/calendar` - Calendar view (day/week) with employee filtering
- ✅ `/employees` - Employee management (CRUD)
- ✅ `/services` - Service management (CRUD)
- ✅ `/shifts` - Shift and availability management (Pro/Business plans)
- ✅ `/customers` - Customer management (CRUD)
- ✅ `/bookings` - Internal booking management
- ✅ `/products` - Product/inventory management (Pro/Business plans)
- ✅ `/reports` - Reports and analytics (Pro/Business plans)
- ✅ `/reports/export` - CSV export functionality

### Settings Routes
- ✅ `/settings/general` - General salon settings
- ✅ `/settings/notifications` - Notification preferences
- ✅ `/settings/billing` - Subscription and billing management
- ✅ `/settings/security` - Security settings (2FA)
- ✅ `/settings/branding` - Booking page branding (Pro/Business plans)

### Admin Routes (Superadmin Only)
- ✅ `/admin` - Admin dashboard
- ✅ `/admin/salons` - Salon management
- ✅ `/admin/users` - User management
- ✅ `/admin/analytics` - System-wide analytics

### Other Routes
- ✅ `/profile` - User profile page
- ✅ `/test-billing` - Billing testing page (development)

---

## Tech Stack

### Framework & Runtime
- **Application Framework:** Next.js 16.1.1 (App Router)
- **Language/Runtime:** Node.js 20.18.0+
- **Package Manager:** npm 10.0.0+

### Frontend
- **JavaScript Framework:** React 19.2.0
- **CSS Framework:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion 12.23.24
- **Icons:** Lucide React 0.555.0

### Database & Storage
- **Database:** PostgreSQL (via Supabase)
- **ORM/Query Builder:** Supabase JS Client 2.85.0
- **Backend-as-a-Service:** Supabase (Auth, Database, RLS, RPC functions)

### Authentication & Payments
- **Authentication:** Supabase Auth (email/password, 2FA/TOTP)
- **Payments:** Stripe (subscriptions, billing, webhooks)

### Testing & Quality
- **Test Framework:** Vitest 2.1.8 (unit tests)
- **E2E Testing:** Playwright 1.48.0
- **Linting/Formatting:** ESLint 9, Prettier 3.4.2
- **Type Checking:** TypeScript 5

### Deployment & Infrastructure
- **Hosting:** Vercel (automatic deployments from main branch)
- **CI/CD:** Vercel (automatic preview deployments for PRs)

### Third-Party Services
- **Error Tracking:** Sentry 10.32.1 (optional, configurable)
- **Monitoring:** Sentry for error tracking and security events

### Development Tools
- **TypeScript:** Full type safety throughout
- **Build Tool:** Next.js webpack
- **Scripts:** Type-check, lint, format, test, seed, migrate

---

## Product Status

**Current Status:** Production Ready

**Production URL:** https://teqbook.com

**Version:** 2.0

**Last Updated:** 2025-01-XX

---

## Notes

- All features follow a layered architecture (UI → Services → Repositories → Supabase)
- Multi-tenant isolation enforced via Row Level Security (RLS)
- Plan-based feature flags control access to advanced features
- Full internationalization support for 15 languages
- Enterprise-grade security with 2FA, rate limiting, and session management
- GDPR compliant with consent tracking and data minimization
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance

