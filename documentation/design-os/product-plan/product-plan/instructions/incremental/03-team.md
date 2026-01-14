# Milestone 3: Team

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 2 (Bookings) complete

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

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/team/tests.md` for detailed test-writing instructions including:
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

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/team/README.md` — Feature overview and design intent
- `product-plan/sections/team/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/team/components/` — React components
- `product-plan/sections/team/types.ts` — TypeScript interfaces
- `product-plan/sections/team/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

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

### Flow 4: Filter Team Members

1. User opens filter dropdowns
2. User selects role and/or status
3. User enters search query
4. **Outcome:** List updates to show only matching employees

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

