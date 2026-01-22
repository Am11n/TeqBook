# Task Breakdown: Phase 5 (Premium SaaS Design)

**Source:** Design audit review (2026-01-23)  
**Goal:** Transform TeqBook from "template-clean" to "top 1% premium SaaS"  
**Total Tasks:** 12 task groups covering design system, UX, and visual polish

---

## Overview

This task breakdown addresses design and UX improvements to elevate TeqBook from a functional SaaS to a premium, polished product. All tasks focus on creating a cohesive, professional experience that builds trust and confidence.

**Design Principles:**
- Visual identity: One signature color, one signature form, one signature component
- Typography: Clear hierarchy, tabular numbers for data
- Information density: More signal per pixel without chaos
- Micro-interactions: Fast feedback, optimistic UI, consistent states
- Component system: Stram, reusable, token-based

**Execution Order:** Tasks should be implemented in phases. Critical features (command palette, tables, dashboard) come first, polish comes last.

---

## Progress Summary

| Category | Tasks | Status | Tests |
|----------|-------|--------|-------|
| Critical Features (48-50) | 3 | ⏳ Pending | 0/6-10 |
| Enhanced Features (51-53) | 3 | ⏳ Pending | 0/4-8 |
| Design System (54-56) | 3 | ⏳ Pending | 0/2-4 |
| Visual Polish (57-59) | 3 | ⏳ Pending | 0/0-2 |

**Total Tasks:** 12 (0 complete, 12 pending)

---

## Acceptance Criteria Summary

- [ ] Command palette with ⌘K working
- [ ] Tables with sticky headers and saved views
- [ ] Dashboard with clear KPI hierarchy
- [ ] Calendar with day view and drag-to-move
- [ ] Forms with smart defaults and validation
- [ ] Design tokens defined and used consistently
- [ ] Visual identity established
- [ ] Typography scale implemented
- [ ] Micro-interactions consistent across app

---

## Task List

### Critical Features (Priority 1)

#### Task Group 48: Command Palette & Global Search
**Dependencies:** None  
**Priority:** HIGH  
**Impact:** Power user navigation, reduces mouse dependency

- [ ] 48.0 Complete command palette and global search
  - [ ] 48.1 Enhance existing CommandPalette component
    - Location: `web/src/components/command-palette.tsx`
    - Add keyboard shortcut (⌘K / Ctrl+K)
    - Ensure shortcut works globally (not just when component mounted)
    - Add search input with focus management
  - [ ] 48.2 Implement global search service
    - Location: `web/src/lib/services/search-service.ts`
    - Add `searchGlobal(query: string)` function
    - Search across: bookings, customers, services, employees
    - Return categorized results with icons
    - Support fuzzy matching
  - [ ] 48.3 Add search categories
    - Bookings: search by customer name, service name, date
    - Customers: search by name, email, phone
    - Services: search by name, category
    - Employees: search by name
  - [ ] 48.4 Add quick actions
    - "New booking" → navigate to bookings page with new modal
    - "New customer" → open customer creation modal
    - "Go to Calendar" → navigate to calendar
    - "Go to Dashboard" → navigate to dashboard
  - [ ] 48.5 Add keyboard navigation
    - Arrow keys to navigate results
    - Enter to select
    - Escape to close
    - Tab to cycle through categories
  - [ ] 48.6 Write 4-6 focused tests
    - Test keyboard shortcut opens palette
    - Test search returns correct results
    - Test keyboard navigation works
    - Test quick actions navigate correctly
  - [ ] 48.7 Ensure command palette tests pass

**Acceptance Criteria:**
- [ ] ⌘K / Ctrl+K opens command palette globally
- [ ] Search finds bookings, customers, services, employees
- [ ] Quick actions work correctly
- [ ] Keyboard navigation smooth and intuitive
- [ ] All command palette tests pass

**Files to Modify:**
- `web/src/components/command-palette.tsx`
- `web/src/components/layout/dashboard-shell.tsx` (ensure ⌘K binding)

**Files to Create:**
- `web/src/lib/services/search-service.ts` (if doesn't exist)
- `web/tests/unit/components/command-palette.test.ts`

---

#### Task Group 49: Table System Improvements
**Dependencies:** None  
**Priority:** HIGH  
**Impact:** Power users become faster, tables feel professional

- [ ] 49.0 Complete table system enhancements
  - [ ] 49.1 Add sticky header to table component
    - Location: `web/src/components/ui/table.tsx`
    - Make TableHeader sticky on scroll
    - Ensure proper z-index and background
    - Test with long lists
  - [ ] 49.2 Create TableWithViews component
    - Location: `web/src/components/tables/TableWithViews.tsx`
    - Wrapper around existing Table component
    - Adds column visibility toggle
    - Adds saved views functionality
    - Adds inline actions menu
  - [ ] 49.3 Create use-table-views hook
    - Location: `web/src/lib/hooks/use-table-views.ts`
    - Manage saved views per user
    - Store in user preferences or separate table
    - Support: filters, sort, column visibility
    - Load/save/delete views
  - [ ] 49.4 Add column visibility toggle
    - UI: dropdown menu with checkboxes
    - Persist visibility per user per table
    - Default visibility for new users
  - [ ] 49.5 Add saved views UI
    - "Save current view" button
    - "Load view" dropdown
    - "Delete view" option
    - View name input
  - [ ] 49.6 Add inline actions menu
    - Replace "Edit Delete" text buttons
    - Use dropdown menu with icons
    - Actions: Edit, Delete, View Details, Duplicate (context-dependent)
  - [ ] 49.7 Add row click to open details drawer
    - Click row opens details drawer (not new page)
    - Drawer shows full record details
    - Drawer has actions (Edit, Delete, etc.)
  - [ ] 49.8 Update all table pages
    - `web/src/app/employees/page.tsx`
    - `web/src/app/services/page.tsx`
    - `web/src/app/customers/page.tsx`
    - `web/src/app/bookings/page.tsx`
    - Replace with TableWithViews component
  - [ ] 49.9 Write 6-8 focused tests
    - Test sticky header works
    - Test column visibility toggle
    - Test saved views save/load
    - Test row click opens drawer
  - [ ] 49.10 Ensure table system tests pass

**Acceptance Criteria:**
- [ ] All tables have sticky headers
- [ ] Column visibility can be toggled
- [ ] Saved views work (save, load, delete)
- [ ] Row click opens details drawer
- [ ] Inline actions use menu, not text buttons
- [ ] All table system tests pass

**Files to Create:**
- `web/src/components/tables/TableWithViews.tsx`
- `web/src/lib/hooks/use-table-views.ts`
- `web/tests/unit/components/table-system.test.ts`

**Files to Modify:**
- `web/src/components/ui/table.tsx`
- `web/src/app/employees/page.tsx`
- `web/src/app/services/page.tsx`
- `web/src/app/customers/page.tsx`
- `web/src/app/bookings/page.tsx`

---

#### Task Group 50: Dashboard Hierarchy & KPI
**Dependencies:** None  
**Priority:** HIGH  
**Impact:** Dashboard feels intelligent, shows what matters

- [ ] 50.0 Complete dashboard redesign
  - [ ] 50.1 Create KPICard component
    - Location: `web/src/components/dashboard/KPICard.tsx`
    - Reusable card for metrics
    - Props: title, value, change, trend, icon
    - Visual hierarchy: large number, small label
    - Optional chart sparkline
  - [ ] 50.2 Create RevenueChart component
    - Location: `web/src/components/dashboard/RevenueChart.tsx`
    - Line or bar chart showing revenue trend
    - Time range selector (7d, 30d, 90d, 1y)
    - Tooltips with exact values
    - Proper labels and axis
  - [ ] 50.3 Add dashboard metrics to performance service
    - Location: `web/src/lib/services/performance-service.ts`
    - Add `getDashboardMetrics(salonId, timeRange)`
    - Calculate: upcoming today, no-show risk, capacity this week, revenue trend
    - Cache results (5 min TTL)
  - [ ] 50.4 Redesign dashboard layout
    - Location: `web/src/app/dashboard/page.tsx`
    - Row 1: Primary KPIs (4 cards: Upcoming today, No-show risk, Capacity, Revenue)
    - Row 2: Today's bookings (list with actions)
    - Row 3: Revenue trend chart
    - Row 4: Quick actions and announcements
    - Clear visual hierarchy
  - [ ] 50.5 Implement "Upcoming today" KPI
    - Count bookings today with status "confirmed" or "pending"
    - Show count and next booking time
    - Link to calendar view
  - [ ] 50.6 Implement "No-show risk" KPI
    - Identify bookings with high no-show probability
    - Based on: customer history, booking time, service type
    - Show count and warning indicator
  - [ ] 50.7 Implement "Capacity this week" KPI
    - Calculate: booked hours / available hours
    - Show percentage and trend
    - Color code: green (>80%), yellow (50-80%), red (<50%)
  - [ ] 50.8 Implement "Revenue trend" chart
    - Show revenue over time (line chart)
    - Group by day/week/month based on range
    - Show total and average
  - [ ] 50.9 Write 4-6 focused tests
    - Test KPI calculations are correct
    - Test dashboard metrics service
    - Test chart renders with data
  - [ ] 50.10 Ensure dashboard tests pass

**Acceptance Criteria:**
- [ ] Dashboard shows 4 primary KPIs clearly
- [ ] Revenue chart has proper labels and tooltips
- [ ] Visual hierarchy is clear (primary → secondary → tertiary)
- [ ] All KPIs are accurate and update correctly
- [ ] All dashboard tests pass

**Files to Create:**
- `web/src/components/dashboard/KPICard.tsx`
- `web/src/components/dashboard/RevenueChart.tsx`
- `web/tests/unit/components/dashboard.test.ts`

**Files to Modify:**
- `web/src/app/dashboard/page.tsx`
- `web/src/lib/services/performance-service.ts`

---

### Enhanced Features (Priority 2)

#### Task Group 51: Calendar Improvements
**Dependencies:** None  
**Priority:** MEDIUM  
**Impact:** Calendar feels like main product, not MVP

- [ ] 51.0 Complete calendar enhancements
  - [ ] 51.1 Create DayView component
    - Location: `web/src/components/calendar/DayView.tsx`
    - Time grid (30-min intervals)
    - "Now line" indicator (red line at current time)
    - Business hours shading (gray background outside hours)
    - Employee lanes (one row per employee)
  - [ ] 51.2 Create BookingEvent component
    - Location: `web/src/components/calendar/BookingEvent.tsx`
    - Draggable booking card
    - Shows: customer name, service, time, status color
    - Drag to move to different time/employee
    - Click to open details
  - [ ] 51.3 Implement drag-to-move functionality
    - Use react-dnd or similar library
    - Validate drop target (employee available, no conflict)
    - Update booking via API on drop
    - Show loading state during update
  - [ ] 51.4 Add conflict handling UI
    - When drag would create conflict, show warning
    - Suggest next available time
    - Allow user to confirm or cancel
  - [ ] 51.5 Update calendar page
    - Location: `web/src/app/calendar/page.tsx`
    - Add day view option (in addition to existing week view)
    - Add view switcher (Day / Week)
    - Integrate DayView and BookingEvent components
  - [ ] 51.6 Write 4-6 focused tests
    - Test day view renders correctly
    - Test drag-to-move works
    - Test conflict detection
  - [ ] 51.7 Ensure calendar tests pass

**Acceptance Criteria:**
- [ ] Day view with time grid works
- [ ] "Now line" shows current time
- [ ] Business hours are shaded
- [ ] Employee lanes visible in day view
- [ ] Drag-to-move bookings works
- [ ] Conflict handling shows warnings
- [ ] All calendar tests pass

**Files to Create:**
- `web/src/components/calendar/DayView.tsx`
- `web/src/components/calendar/BookingEvent.tsx`
- `web/tests/unit/components/calendar.test.ts`

**Files to Modify:**
- `web/src/app/calendar/page.tsx`

---

#### Task Group 52: Form Improvements
**Dependencies:** None  
**Priority:** MEDIUM  
**Impact:** Creating bookings feels frictionless

- [ ] 52.0 Complete form enhancements
  - [ ] 52.1 Create BookingForm component
    - Location: `web/src/components/forms/BookingForm.tsx`
    - Smart form with autoload and validation
    - Auto-load times when employee + service + date selected
    - Disable submit until all valid
    - Inline validation with short messages
  - [ ] 52.2 Add autoload times functionality
    - Location: `web/src/lib/hooks/bookings/useCreateBooking.ts`
    - When employee, service, and date are selected
    - Call `generate_availability` RPC
    - Populate time slots automatically
    - Show loading state during fetch
  - [ ] 52.3 Add inline validation
    - Validate each field as user types
    - Show short error messages below field
    - Green checkmark for valid fields
    - Disable submit button if any field invalid
  - [ ] 52.4 Add customer prefill
    - When email/phone entered, check if customer exists
    - If match found, prefill: name, phone, email, notes
    - Show "Existing customer" badge
    - Allow quick edit if needed
  - [ ] 52.5 Add quick create customer
    - In booking modal, if customer not found
    - Show "Create customer" button
    - Open inline customer form
    - Save customer, then continue with booking
  - [ ] 52.6 Update booking creation page
    - Location: `web/src/app/bookings/page.tsx` (or new booking modal)
    - Use new BookingForm component
    - Integrate all smart features
  - [ ] 52.7 Write 4-6 focused tests
    - Test autoload times works
    - Test inline validation
    - Test customer prefill
    - Test quick create customer
  - [ ] 52.8 Ensure form tests pass

**Acceptance Criteria:**
- [ ] Times autoload when employee + service + date selected
- [ ] Submit disabled until all fields valid
- [ ] Inline validation shows helpful messages
- [ ] Customer prefill works when email/phone matches
- [ ] Quick create customer works in booking flow
- [ ] All form tests pass

**Files to Create:**
- `web/src/components/forms/BookingForm.tsx`
- `web/tests/unit/components/booking-form.test.ts`

**Files to Modify:**
- `web/src/lib/hooks/bookings/useCreateBooking.ts`
- `web/src/app/bookings/page.tsx`

---

#### Task Group 53: Design Tokens & Component System
**Dependencies:** None  
**Priority:** MEDIUM  
**Impact:** Consistent design, easy to maintain and update

- [ ] 53.0 Complete design token system
  - [ ] 53.1 Create design tokens file
    - Location: `web/src/styles/design-tokens.ts`
    - Define spacing: 4, 8, 12, 16, 24, 32, 48
    - Define radius: 10, 16
    - Define shadows: sm, md (two levels)
    - Define border: 1px standard
    - Define focus ring: one consistent style
  - [ ] 53.2 Update Tailwind config
    - Location: `web/tailwind.config.ts`
    - Use design tokens for spacing scale
    - Use design tokens for border radius
    - Use design tokens for box shadows
  - [ ] 53.3 Standardize Button component
    - Location: `web/src/components/ui/button.tsx`
    - 3 variants: default, secondary, destructive
    - 3 sizes: sm, md, lg
    - 4 states: default, hover, active, disabled
    - Use design tokens for spacing/radius
  - [ ] 53.4 Standardize Input component
    - Location: `web/src/components/ui/input.tsx`
    - States: default, focus, error, success, loading
    - Label, hint text, error message
    - Use design tokens
  - [ ] 53.5 Create component contracts document
    - Location: `web/docs/design/component-system.md`
    - Document all component variants
    - Document all component states
    - Document usage guidelines
  - [ ] 53.6 Write 2-4 focused tests
    - Test design tokens are used consistently
    - Test components follow contracts
  - [ ] 53.7 Ensure design system tests pass

**Acceptance Criteria:**
- [ ] Design tokens defined and exported
- [ ] Tailwind config uses tokens
- [ ] Button component has 3 variants, 3 sizes, 4 states
- [ ] Input component has all states (label, hint, error, success, loading)
- [ ] Component contracts documented
- [ ] All design system tests pass

**Files to Create:**
- `web/src/styles/design-tokens.ts`
- `web/docs/design/component-system.md`
- `web/tests/unit/design/design-tokens.test.ts`

**Files to Modify:**
- `web/tailwind.config.ts`
- `web/src/components/ui/button.tsx`
- `web/src/components/ui/input.tsx`

---

### Visual Polish (Priority 3)

#### Task Group 54: Visual Identity
**Dependencies:** Task Group 53 (Design Tokens)  
**Priority:** LOW  
**Impact:** Product feels intentional and branded

- [ ] 54.0 Complete visual identity
  - [ ] 54.1 Choose signature color
    - One color for primary actions only
    - Use for: primary buttons, active states, "aha" signals
    - Document in design tokens
  - [ ] 54.2 Define signature form
    - Choose: border radius (10 or 16), line thickness (1px or 2px), shadow style
    - Apply consistently to cards, buttons, inputs
  - [ ] 54.3 Create signature component
    - Choose one: event chip, stat card, or command palette
    - Make it distinctive and reusable
    - Use across app consistently
  - [ ] 54.4 Apply visual identity
    - Update primary buttons to use signature color
    - Update active states to use signature color
    - Update cards to use signature form
    - Update signature component usage

**Acceptance Criteria:**
- [ ] Signature color chosen and documented
- [ ] Signature form defined and applied
- [ ] Signature component created and used
- [ ] Visual identity consistent across app

**Files to Create:**
- `web/docs/design/visual-identity.md`

**Files to Modify:**
- `web/src/styles/design-tokens.ts` (add signature color)
- Components using primary actions

---

#### Task Group 55: Typography & Spacing
**Dependencies:** Task Group 53 (Design Tokens)  
**Priority:** LOW  
**Impact:** Text hierarchy is clear, data is readable

- [ ] 55.0 Complete typography system
  - [ ] 55.1 Implement typography scale
    - H1: 28-32px, line-height: 1.2
    - H2: 18-20px, line-height: 1.3
    - Body: 14-16px, line-height: 1.5
    - Label: 12-13px, line-height: 1.4, font-weight: 500
  - [ ] 55.2 Use tabular numbers
    - For KPIs, tables, any numeric data
    - Use `font-variant-numeric: tabular-nums`
    - Apply via Tailwind class or CSS
  - [ ] 55.3 Update typography across app
    - Replace inconsistent font sizes
    - Ensure proper line-heights
    - Use typography scale consistently
  - [ ] 55.4 Document typography system
    - Add to `web/docs/design/typography.md`
    - Show examples of each level
    - Document when to use each

**Acceptance Criteria:**
- [ ] Typography scale implemented
- [ ] Tabular numbers used for all numeric data
- [ ] Line-heights appropriate (lower on headings, higher on body)
- [ ] Typography consistent across app

**Files to Create:**
- `web/docs/design/typography.md`

**Files to Modify:**
- `web/src/styles/globals.css` (add typography classes)
- Components with text (update to use typography scale)

---

#### Task Group 56: Micro-interactions
**Dependencies:** None  
**Priority:** LOW  
**Impact:** App feels fast and responsive

- [ ] 56.0 Complete micro-interactions
  - [ ] 56.1 Add skeleton loaders
    - Location: `web/src/components/ui/skeleton.tsx` (may already exist)
    - Create skeletons that match actual content layout
    - Use for: lists, cards, tables
    - Replace "Loading..." text with skeletons
  - [ ] 56.2 Implement optimistic UI
    - For create/update operations (when safe)
    - Show success immediately
    - Revert if API call fails
    - Apply to: bookings, customers, employees
  - [ ] 56.3 Standardize hover/focus states
    - Consistent across all interactive elements
    - Use design tokens for transitions
    - Ensure accessibility (keyboard focus visible)
  - [ ] 56.4 Add micro-animations
    - Dropdown: slide down with fade
    - Modal: scale up with fade
    - Toast: slide in from side
    - Use CSS transitions (not heavy libraries)
  - [ ] 56.5 Update all components
    - Add skeletons to loading states
    - Add optimistic UI where appropriate
    - Ensure hover/focus states consistent
    - Add micro-animations to dropdowns/modals/toasts

**Acceptance Criteria:**
- [ ] All loading states use skeletons (not "Loading..." text)
- [ ] Optimistic UI for safe operations
- [ ] Hover/focus states consistent
- [ ] Micro-animations smooth and subtle

**Files to Modify:**
- `web/src/components/ui/skeleton.tsx` (enhance if exists)
- All components with loading states
- All interactive components (buttons, inputs, etc.)
- Dropdown, modal, toast components

---

## Implementation Order

1. **Week 1:** Task Groups 48, 49, 50 (Critical Features)
2. **Week 2:** Task Groups 51, 52, 53 (Enhanced Features + Design System)
3. **Week 3:** Task Groups 54, 55, 56 (Visual Polish)

---

## Testing Strategy

- **Command Palette:** Test keyboard shortcuts, search accuracy, navigation
- **Tables:** Test sticky headers, column visibility, saved views, row clicks
- **Dashboard:** Test KPI calculations, chart rendering, data accuracy
- **Calendar:** Test day view, drag-to-move, conflict handling
- **Forms:** Test autoload, validation, prefill, quick create
- **Design System:** Test token usage, component contracts

---

## Success Criteria

- ✅ Command palette with ⌘K working globally
- ✅ Tables with sticky headers, saved views, inline actions
- ✅ Dashboard with clear KPI hierarchy and revenue chart
- ✅ Calendar with day view, drag-to-move, conflict handling
- ✅ Forms with autoload times, smart defaults, validation
- ✅ Design tokens defined and used consistently
- ✅ Visual identity established (signature color, form, component)
- ✅ Typography scale implemented with tabular numbers
- ✅ Micro-interactions consistent (skeletons, optimistic UI, animations)
