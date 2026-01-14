# TeqBook — Complete Implementation Instructions

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

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions include:
- Specific UI elements, button labels, and interactions to verify
- Expected success and failure behaviors
- Empty state handling (when no records exist yet)
- Data assertions and state validations

---

# Milestone 1: Foundation

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Colors:**
- Primary: `indigo` — Used for buttons, links, key accents
- Secondary: `slate` — Used for tags, highlights, secondary elements
- Neutral: `slate` — Used for backgrounds, text, borders

**Typography:**
- Heading: `Inter` — Used for all headings
- Body: `Inter` — Used for body text
- Mono: `IBM Plex Mono` — Used for code/technical text

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/README.md` for entity relationships
- See `product-plan/data-model/data-model.md` for entity descriptions

**Core Entities:**
- Salon, User, Role, Employee, Service, Booking, Customer, Shift, PaymentPlan, Subscription, Notification

### 3. Routing Structure

Create placeholder routes for each section:

- `/bookings` — Bookings section
- `/team` — Team section
- `/customers` — Customers section
- `/business` — Business section
- `/settings` — Settings section (optional, not designed yet)

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with avatar

**Wire Up Navigation:**

Connect navigation to your routing:

- Bookings → `/bookings`
- Team → `/team`
- Customers → `/customers`
- Business → `/business`
- Settings → `/settings` (if implemented)

**User Menu:**

The user menu expects:
- User name
- Avatar URL (optional)
- Logout callback

**UI Dependencies:**

The shell components depend on UI primitives:
- `@/components/ui/dropdown-menu` — Radix UI DropdownMenu components
- `@/components/ui/avatar` — Avatar component with Image and Fallback

You may need to install `@radix-ui/react-dropdown-menu` and `@radix-ui/react-avatar`, or update import paths to match your UI component library.

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation
- [ ] Navigation links to correct routes
- [ ] User menu shows user info
- [ ] Responsive on mobile

---

# Milestone 2: Bookings

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

See `product-plan/sections/bookings/tests.md` for detailed test-writing instructions.

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
- `onStatusChange` — Update booking status
- `onReschedule` — Update booking date/time (for drag and drop in calendar view)
- `onFilter` — Apply filters (employee, service, date range, status, customer)
- `onViewChange` — Switch between list and calendar views

### Empty States

Implement empty state UI for when no bookings exist yet:

- **No bookings yet:** Show a helpful message and call-to-action when the bookings list is empty
- **No filtered results:** Handle cases where filters return no matches
- **First-time user experience:** Guide users to create their first booking with clear CTAs

## Files to Reference

- `product-plan/sections/bookings/README.md` — Feature overview and design intent
- `product-plan/sections/bookings/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/bookings/components/` — React components
- `product-plan/sections/bookings/types.ts` — TypeScript interfaces
- `product-plan/sections/bookings/sample-data.json` — Test data

## Expected User Flows

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
2. User modifies booking details
3. User clicks "Save" to confirm changes
4. **Outcome:** Booking updates in place, changes persisted

### Flow 3: Update Booking Status

1. User clicks status badge or quick action button on a booking
2. User selects new status from dropdown
3. **Outcome:** Status updates immediately, badge color changes

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

---

# Milestone 3: Team

## Goal

Implement the Team feature — Employee management and shift scheduling to organize staff, availability, and coverage.

## Overview

The Team section provides comprehensive employee management with role-based access control. Users can view team members, invite new employees via email, manage roles and permissions, and view employee profiles with working hours and availability.

**Key Functionality:**
- View team list with all employees showing name, role, status, and contact information
- Invite new team member by entering email address and selecting role (Admin, Manager, Staff)
- View pending invitations with options to resend or revoke invite
- View employee profile with name, contact details, role, status, and working hours/availability
- Edit employee profile to update name, contact information, role, or status
- Manage roles and permissions by assigning Admin, Manager, or Staff roles to employees
- Filter team members by role or status
- Search team members by name or email

## Recommended Approach: Test-Driven Development

See `product-plan/sections/team/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/team/components/`:

- `TeamList.tsx` — Main component with team list and filters
- `TeamRow.tsx` — Individual employee row
- `TeamFilters.tsx` — Filter and search component
- `EmployeeDetailsDrawer.tsx` — Employee profile drawer
- `InviteModal.tsx` — Invite new team member modal
- `RoleBadge.tsx` — Role badge component
- `StatusBadge.tsx` — Status badge component

### Data Layer

The components expect these data shapes:

- `Employee` — Staff members with name, email, phone, role, status
- `Role` — Permission levels (Admin, Manager, Staff) with permission sets
- `PendingInvite` — Invitations that haven't been accepted yet

You'll need to:
- Create API endpoints for CRUD operations on employees
- Create endpoints for managing roles and permissions
- Create endpoints for sending, resending, and revoking invitations
- Connect real data to the components

### Callbacks

Wire up these user actions:

- `onView` — Open employee details drawer
- `onEdit` — Open edit employee form/modal
- `onInvite` — Send invitation email to new team member
- `onResendInvite` — Resend pending invitation
- `onRevokeInvite` — Cancel pending invitation
- `onUpdateRole` — Change employee's role
- `onUpdateStatus` — Change employee's status (active, invited, disabled)
- `onDelete` — Remove employee from team
- `onFilter` — Apply filters (role, status, search)
- `onViewShifts` — Navigate to shifts section for employee

### Empty States

Implement empty state UI for when no team members exist yet:

- **No team members yet:** Show a helpful message and "Invite Team Member" CTA when the team list is empty
- **No filtered results:** Handle cases where filters return no matches
- **First-time user experience:** Guide users to invite their first team member

## Files to Reference

- `product-plan/sections/team/README.md` — Feature overview and design intent
- `product-plan/sections/team/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/team/components/` — React components
- `product-plan/sections/team/types.ts` — TypeScript interfaces
- `product-plan/sections/team/sample-data.json` — Test data

## Expected User Flows

### Flow 1: Invite a New Team Member

1. User clicks "Invite Team Member" button
2. User enters email address
3. User selects role (Admin, Manager, Staff)
4. User clicks "Send Invitation"
5. **Outcome:** Invitation sent, appears in pending invites list, success message shown

### Flow 2: View Employee Profile

1. User clicks on an employee row
2. **Outcome:** Employee details drawer opens showing name, contact, role, status, working hours summary

### Flow 3: Update Employee Role

1. User opens employee details drawer
2. User clicks "Edit" or role badge
3. User selects new role from dropdown
4. User clicks "Save"
5. **Outcome:** Role updates, permissions change, badge updates

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no team members exist
- [ ] All user actions work (invite, edit, update role/status, delete, filter)
- [ ] Invitation system works (send, resend, revoke)
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

---

# Milestone 4: Customers

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

See `product-plan/sections/customers/tests.md` for detailed test-writing instructions.

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

## Files to Reference

- `product-plan/sections/customers/README.md` — Feature overview and design intent
- `product-plan/sections/customers/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/customers/components/` — React components
- `product-plan/sections/customers/types.ts` — TypeScript interfaces
- `product-plan/sections/customers/sample-data.json` — Test data

## Expected User Flows

### Flow 1: View Customer Profile

1. User clicks on a customer row
2. **Outcome:** Customer profile drawer opens showing contact info, booking history, tags, notes, marketing preferences

### Flow 2: Add Tag to Customer

1. User opens customer profile drawer
2. User clicks "Add Tag" or types in tag input
3. User enters tag name and presses Enter
4. **Outcome:** Tag appears in customer's tag list, saved to profile

### Flow 3: Search Customers

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

---

# Milestone 5: Business

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

See `product-plan/sections/business/tests.md` for detailed test-writing instructions.

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

## Files to Reference

- `product-plan/sections/business/README.md` — Feature overview and design intent
- `product-plan/sections/business/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/business/components/` — React components
- `product-plan/sections/business/types.ts` — TypeScript interfaces
- `product-plan/sections/business/sample-data.json` — Test data

## Expected User Flows

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

