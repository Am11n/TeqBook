# Milestone 4: Customers

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 2 (Bookings) complete, Milestone 3 (Team) complete

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

Implement the Customers feature — Customer database to track profiles, service history, and preferences for personalized experiences.

## Overview

The Customers section provides a comprehensive customer directory for managing customer profiles, viewing booking history, and tracking preferences. Users can search customers, view detailed profiles, manage tags and notes, and control marketing consent settings.

**Key Functionality:**
- View customer list with search functionality to find customers by name, email, or phone
- View customer profile in a drawer showing contact information, booking history, tags, notes, and preferences
- View booking history as a timeline or table showing past and upcoming appointments with service details
- Add and manage tags on customer profiles for categorization and quick identification
- Add and edit notes on customer profiles to track preferences, special requests, or important information
- Toggle marketing consent and communication preferences for each customer
- Filter customers by tags or other criteria
- Create new customer profile when needed

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/customers/tests.md` for detailed test-writing instructions including:
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

Copy the section components from `product-plan/sections/customers/components/`:

- `CustomersList.tsx` — Main component with customer list and search
- `CustomerRow.tsx` — Individual customer row
- `CustomerFilters.tsx` — Filter component
- `CustomerProfileDrawer.tsx` — Customer profile drawer with booking history, tags, notes
- `TagBadge.tsx` — Tag badge component

### Data Layer

The components expect these data shapes:

- `Customer` — Customer profiles with contact info, tags, notes, marketing consent
- `Booking` — Booking history associated with customers
- `CustomerNote` — Notes added to customer profiles
- `MarketingConsent` — Email/SMS preferences

You'll need to:
- Create API endpoints for CRUD operations on customers
- Create endpoints for managing customer tags and notes
- Create endpoints for updating marketing consent
- Fetch booking history for each customer
- Connect real data to the components

### Callbacks

Wire up these user actions:

- `onView` — Open customer profile drawer
- `onEdit` — Open edit customer form/modal
- `onCreate` — Open create customer form/modal
- `onDelete` — Delete customer with confirmation
- `onAddTag` — Add tag to customer profile
- `onRemoveTag` — Remove tag from customer profile
- `onAddNote` — Add note to customer profile
- `onEditNote` — Update existing note
- `onDeleteNote` — Remove note from customer profile
- `onUpdateMarketingConsent` — Update email/SMS preferences
- `onFilter` — Apply filters (search, tags)

### Empty States

Implement empty state UI for when no customers exist yet:

- **No customers yet:** Show a helpful message and "Create Customer" CTA when the customer list is empty
- **No filtered results:** Handle cases where search/filters return no matches
- **First-time user experience:** Guide users to create their first customer profile

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/customers/README.md` — Feature overview and design intent
- `product-plan/sections/customers/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/customers/components/` — React components
- `product-plan/sections/customers/types.ts` — TypeScript interfaces
- `product-plan/sections/customers/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: View Customer Profile

1. User clicks on a customer row
2. **Outcome:** Customer profile drawer opens showing contact info, booking history, tags, notes, marketing preferences

### Flow 2: Add Tag to Customer

1. User opens customer profile drawer
2. User clicks "Add Tag" or types in tag input
3. User enters tag name and presses Enter
4. **Outcome:** Tag appears in customer's tag list, saved to profile

### Flow 3: Add Note to Customer

1. User opens customer profile drawer
2. User clicks "Add Note" button
3. User enters note content
4. User clicks "Save Note"
5. **Outcome:** Note appears in notes list with timestamp, saved to profile

### Flow 4: Search Customers

1. User enters search query in search bar
2. **Outcome:** List updates to show only customers matching name, email, or phone

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no customers exist
- [ ] All user actions work (create, edit, delete, add tag/note, update consent, filter)
- [ ] Customer profile drawer shows booking history correctly
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

