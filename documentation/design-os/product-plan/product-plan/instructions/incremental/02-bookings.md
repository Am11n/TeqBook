# Milestone 2: Bookings

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

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

Implement the Bookings feature — Core booking system with calendar view and services catalog for managing appointments and service offerings.

## Overview

The Bookings section provides a comprehensive appointment management system with both list and calendar views. Users can create, edit, filter, and manage booking statuses to handle all salon appointments efficiently.

**Key Functionality:**
- View bookings in list format with sortable columns and status indicators
- Switch to calendar view to see appointments in a weekly/monthly grid layout
- Create new booking by selecting customer, service, employee, date/time, and optional notes
- Edit existing booking to modify any details including rescheduling
- Filter bookings by employee, service, date range, status, or customer
- Update booking status (pending, confirmed, in-progress, completed, cancelled, no-show) via quick actions
- Drag and drop bookings in calendar view for rescheduling appointments

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/bookings/tests.md` for detailed test-writing instructions including:
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

Copy the section components from `product-plan/sections/bookings/components/`:

- `BookingsList.tsx` — Main component with list/calendar view toggle
- `BookingRow.tsx` — Individual booking row in list view
- `BookingFilters.tsx` — Filter bar component
- `StatusBadge.tsx` — Status badge with color coding

### Data Layer

The components expect these data shapes:

- `Booking` — Appointments with customer, service, employee, date/time, status
- `Service` — Services offered by the salon
- `Employee` — Staff members who can be assigned to bookings
- `Customer` — People who book appointments

You'll need to:
- Create API endpoints for CRUD operations on bookings
- Create endpoints to fetch services, employees, and customers
- Connect real data to the components

### Callbacks

Wire up these user actions:

- `onView` — Navigate to booking detail view or open detail modal
- `onCreate` — Open create booking form/modal
- `onEdit` — Open edit booking form/modal with booking data
- `onDelete` — Delete booking with confirmation
- `onStatusChange` — Update booking status (pending, confirmed, in-progress, completed, cancelled, no-show)
- `onReschedule` — Update booking date/time (for drag and drop in calendar view)
- `onFilter` — Apply filters (employee, service, date range, status, customer)
- `onViewChange` — Switch between list and calendar views

### Empty States

Implement empty state UI for when no bookings exist yet:

- **No bookings yet:** Show a helpful message and call-to-action when the bookings list is empty
- **No filtered results:** Handle cases where filters return no matches
- **First-time user experience:** Guide users to create their first booking with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/bookings/README.md` — Feature overview and design intent
- `product-plan/sections/bookings/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/bookings/components/` — React components
- `product-plan/sections/bookings/types.ts` — TypeScript interfaces
- `product-plan/sections/bookings/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Create a New Booking

1. User clicks "New Booking" button
2. User selects customer from dropdown/search
3. User selects service from dropdown
4. User selects employee from dropdown
5. User picks date and time
6. User optionally adds notes
7. User clicks "Create" to save
8. **Outcome:** New booking appears in the list, success message shown

### Flow 2: Edit an Existing Booking

1. User clicks on a booking row or "Edit" button
2. User modifies booking details (customer, service, employee, date/time, notes)
3. User clicks "Save" to confirm changes
4. **Outcome:** Booking updates in place, changes persisted

### Flow 3: Update Booking Status

1. User clicks status badge or quick action button on a booking
2. User selects new status from dropdown (confirmed, in-progress, completed, etc.)
3. **Outcome:** Status updates immediately, badge color changes

### Flow 4: Filter Bookings

1. User opens filter bar
2. User selects employee, service, status, or date range
3. User clicks "Apply Filters"
4. **Outcome:** List updates to show only matching bookings

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no bookings exist
- [ ] All user actions work (create, edit, delete, status change, filter)
- [ ] List and calendar views both functional
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

