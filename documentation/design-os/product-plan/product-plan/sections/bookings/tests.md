# Test Instructions: Bookings

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

The Bookings section manages appointments with list and calendar views. Key functionality includes creating, editing, filtering bookings, and updating booking statuses.

---

## User Flow Tests

### Flow 1: Create a New Booking

**Scenario:** User creates a new appointment booking

#### Success Path

**Setup:**
- User is logged in
- Services, employees, and customers exist in the system
- Sample data: services list, employees list, customers list

**Steps:**
1. User navigates to `/bookings`
2. User sees "New Booking" button
3. User clicks "New Booking" button
4. User selects customer from dropdown/search
5. User selects service from dropdown
6. User selects employee from dropdown
7. User picks date using date picker
8. User picks time using time picker
9. User optionally enters notes
10. User clicks "Create" or "Save" button

**Expected Results:**
- [ ] Success toast appears with message like "Booking created successfully"
- [ ] New booking appears in the bookings list
- [ ] Booking shows correct customer name, service, employee, date/time
- [ ] Form/modal closes after successful creation
- [ ] Booking status is "pending" by default

#### Failure Path: Validation Error

**Setup:**
- User attempts to create booking with missing required fields

**Steps:**
1. User clicks "New Booking" button
2. User leaves required fields empty (customer, service, employee, date, time)
3. User clicks "Create" button

**Expected Results:**
- [ ] Validation messages appear for each empty required field
- [ ] Form is not submitted
- [ ] Focus moves to first invalid field

#### Failure Path: Server Error

**Setup:**
- Server returns 500 error when creating booking

**Steps:**
1. User fills in all required fields
2. User clicks "Create" button
3. Server returns error

**Expected Results:**
- [ ] Error message appears: "Unable to create booking. Please try again."
- [ ] Form data is preserved, not cleared
- [ ] Submit button remains enabled for retry

---

### Flow 2: Update Booking Status

**Scenario:** User changes a booking's status

#### Success Path

**Setup:**
- Booking exists with status "pending"

**Steps:**
1. User navigates to `/bookings`
2. User sees booking row with status badge
3. User clicks status badge or quick action button
4. User selects new status from dropdown (e.g., "confirmed")
5. User clicks "Update" or status is updated immediately

**Expected Results:**
- [ ] Status badge updates to new status
- [ ] Badge color changes to match new status (confirmed=blue)
- [ ] Status change is persisted
- [ ] No page refresh required

---

### Flow 3: Filter Bookings

**Scenario:** User filters bookings by employee, service, or date range

#### Success Path

**Setup:**
- Multiple bookings exist with different employees, services, dates

**Steps:**
1. User navigates to `/bookings`
2. User sees filter bar
3. User selects employee from "Employee" dropdown
4. User selects service from "Service" dropdown
5. User selects date range from date picker
6. User clicks "Apply Filters" or filters apply automatically

**Expected Results:**
- [ ] List updates to show only bookings matching filters
- [ ] Filter indicators show active filters
- [ ] "Clear Filters" option is available
- [ ] Empty state appears if no bookings match

---

## Empty State Tests

### Primary Empty State

**Scenario:** User has no bookings yet (first-time or all deleted)

**Setup:**
- Bookings list is empty (`[]`)

**Expected Results:**
- [ ] Shows heading "No bookings yet" or similar
- [ ] Shows text "Create your first booking to get started" or similar
- [ ] Shows "New Booking" button prominently
- [ ] Clicking "New Booking" opens the create form/modal
- [ ] No blank screen or broken layout

### Filtered/Search Empty State

**Scenario:** User applies filters that return no results

**Setup:**
- Bookings exist but filter matches nothing

**Expected Results:**
- [ ] Shows "No results found" message
- [ ] Shows "Try adjusting your filters" or similar guidance
- [ ] Shows "Clear Filters" link/button
- [ ] Clicking "Clear Filters" resets filters and shows all bookings

---

## Component Interaction Tests

### BookingsList Component

**Renders correctly:**
- [ ] Displays list of bookings with customer name, service, employee, date/time, status
- [ ] Shows "New Booking" button
- [ ] Shows view toggle (List/Calendar) buttons
- [ ] Shows filter bar

**User interactions:**
- [ ] Clicking "New Booking" calls `onCreate` callback
- [ ] Clicking booking row calls `onView` with booking id
- [ ] Clicking "Edit" button calls `onEdit` with booking id
- [ ] Switching view toggle calls `onViewChange` with 'list' or 'calendar'

**Loading and error states:**
- [ ] Shows loading spinner while data is fetching
- [ ] Shows error message when data fails to load with retry button

---

## Edge Cases

- [ ] Handles very long customer names with text truncation
- [ ] Works correctly with 1 booking and 100+ bookings
- [ ] Preserves filters when navigating away and back
- [ ] Transition from empty to populated: After creating first booking, list renders correctly
- [ ] Transition from populated to empty: After deleting last booking, empty state appears

---

## Sample Test Data

```typescript
// Example test data - populated state
const mockBooking = {
  id: "booking-1",
  customerId: "customer-1",
  customerName: "John Doe",
  serviceId: "service-1",
  serviceName: "Haircut",
  employeeId: "employee-1",
  employeeName: "Jane Smith",
  date: "2024-01-15",
  time: "10:00",
  duration: 30,
  status: "pending" as const,
  notes: "",
  createdAt: "2024-01-01T00:00:00Z"
};

const mockBookings = [mockBooking, /* ... more bookings */];

// Example test data - empty states
const mockEmptyList = [];
```

---

## Notes for Test Implementation

- Mock API calls to test both success and failure scenarios
- Test each callback prop is called with correct arguments
- Verify UI updates optimistically where appropriate
- Test that loading states appear during async operations
- Ensure error boundaries catch and display errors gracefully
- **Always test empty states** — Pass empty arrays to verify helpful empty state UI appears (not blank screens)
- Test transitions: empty → first booking created, last booking deleted → empty state returns

