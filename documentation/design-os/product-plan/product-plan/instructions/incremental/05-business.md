# Milestone 5: Business

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 2 (Bookings) complete, Milestone 3 (Team) complete, Milestone 4 (Customers) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Business feature — Billing, payments, and analytics to track revenue, service performance, and business insights.

## Overview

The Business section provides comprehensive salon settings management including business profile, opening hours, branding, billing and subscription plans, and notification preferences. Users can configure all aspects of their salon's business information and system settings in one centralized location.

**Key Functionality:**
- View and edit business profile with name, address, contact information, and organizational details
- Configure opening hours for each day of the week with ability to set different hours or mark days as closed
- Upload and manage business logo with preview
- View color palette preview showing current branding colors
- View current subscription plan with features and limits
- View billing history with invoices list and download options
- Upgrade or change subscription plan with clear CTA and feature comparison
- Configure notification preferences with email and SMS toggles for different event types

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/business/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

The test instructions are framework-agnostic — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/business/components/`:

- `BusinessSettings.tsx` — Main hub component with left nav and right content panel
- `SettingsNav.tsx` — Left navigation sidebar
- `ProfileSection.tsx` — Business profile form
- `HoursSection.tsx` — Opening hours editor
- `BrandingSection.tsx` — Logo upload and color palette preview
- `BillingSection.tsx` — Subscription plan and invoice history
- `NotificationsSection.tsx` — Notification preferences toggles

### Data Layer

The components expect these data shapes:

- `Salon` — Business profile with address and contact info
- `OpeningHours` — Weekly opening hours configuration
- `Branding` — Logo URL and color palette
- `PaymentPlan` — Available subscription plans
- `Subscription` — Current active subscription
- `Invoice` — Billing invoices
- `NotificationPreferences` — Email/SMS preferences for different event types

You'll need to:
- Create API endpoints for updating business profile
- Create endpoints for managing opening hours
- Create endpoints for logo upload and branding
- Create endpoints for subscription management
- Create endpoints for fetching invoices
- Create endpoints for updating notification preferences
- Connect real data to the components

### Callbacks

Wire up these user actions:

- `onUpdateProfile` — Save business profile changes
- `onUpdateOpeningHours` — Save opening hours configuration
- `onUploadLogo` — Upload business logo file
- `onRemoveLogo` — Remove business logo
- `onUpdateBranding` — Update branding colors
- `onUpgradePlan` — Upgrade or change subscription plan
- `onCancelSubscription` — Cancel active subscription
- `onDownloadInvoice` — Download invoice PDF
- `onUpdateNotifications` — Save notification preferences

### Empty States

Implement empty state UI for when no invoices exist yet:

- **No invoices yet:** Show a helpful message when the invoices list is empty
- **First-time user experience:** Guide users to configure their business settings

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/business/README.md` — Feature overview and design intent
- `product-plan/sections/business/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/business/components/` — React components
- `product-plan/sections/business/types.ts` — TypeScript interfaces
- `product-plan/sections/business/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Update Business Profile

1. User navigates to Business settings
2. User clicks "Profile" in left nav
3. User edits business name, address, contact info
4. User clicks "Save Changes"
5. **Outcome:** Profile updates saved, success message shown

### Flow 2: Configure Opening Hours

1. User clicks "Hours" in left nav
2. User toggles days open/closed
3. User sets open/close times for each day
4. User clicks "Save Changes"
5. **Outcome:** Opening hours saved, used for booking availability

### Flow 3: Upload Logo

1. User clicks "Branding" in left nav
2. User clicks "Upload Logo" button
3. User selects image file
4. User clicks "Save Logo"
5. **Outcome:** Logo preview updates, file uploaded

### Flow 4: Upgrade Subscription Plan

1. User clicks "Billing" in left nav
2. User views current plan and features
3. User clicks "Upgrade to Premium" button
4. User confirms upgrade
5. **Outcome:** Plan upgraded, features unlocked, billing updated

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no invoices exist
- [ ] All user actions work (update profile, hours, branding, subscription, notifications)
- [ ] Logo upload works correctly
- [ ] Subscription management works (upgrade, cancel)
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

