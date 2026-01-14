# Bookings

## Overview

The Bookings section provides a comprehensive appointment management system with both list and calendar views. Users can create, edit, filter, and manage booking statuses to handle all salon appointments efficiently.

## User Flows

- View bookings in list format with sortable columns and status indicators
- Switch to calendar view to see appointments in a weekly/monthly grid layout
- Create new booking by selecting customer, service, employee, date/time, and optional notes
- Edit existing booking to modify any details including rescheduling
- Filter bookings by employee, service, date range, status, or customer
- Update booking status (pending, confirmed, in-progress, completed, cancelled, no-show) via quick actions
- Drag and drop bookings in calendar view to reschedule appointments
- View booking details in a detail panel or modal

## Design Decisions

- List view as primary interface with calendar view toggle
- Status badges with color coding for quick visual identification
- Quick action buttons for common status changes
- Comprehensive filtering for large booking lists
- Empty states guide users to create first booking

## Data Used

**Entities:** Booking, Service, Employee, Customer

**From global model:** Booking, Service, Employee, Customer entities

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Components Provided

- `BookingsList` — Main component with list/calendar view toggle
- `BookingRow` — Individual booking row in list view
- `BookingFilters` — Filter bar component
- `StatusBadge` — Status badge with color coding

## Callback Props

| Callback | Description |
|----------|-------------|
| `onView` | Called when user wants to view a booking's details |
| `onCreate` | Called when user wants to create a new booking |
| `onEdit` | Called when user wants to edit a booking |
| `onDelete` | Called when user wants to delete a booking |
| `onStatusChange` | Called when user updates a booking's status |
| `onReschedule` | Called when user reschedules a booking via drag and drop |
| `onFilter` | Called when user applies filters |
| `onViewChange` | Called when user switches between list and calendar view |

