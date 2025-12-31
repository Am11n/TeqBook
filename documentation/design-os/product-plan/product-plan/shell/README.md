# Application Shell

## Overview

The TeqBook application shell uses a modern sidebar navigation pattern with a top bar, providing persistent navigation across all sections. The design follows typical SaaS dashboard patterns with a clean, professional aesthetic.

## Navigation Structure

- Bookings → Bookings section
- Team → Team section
- Customers → Customers section
- Business → Business section
- Settings → Settings section

## User Menu

The user menu is located in the top right of the top bar. It displays the user's avatar (or initials if no avatar), name, and provides a logout option via dropdown menu.

## Layout Pattern

**Sidebar + Top Bar Layout:**
- Left sidebar: Fixed vertical navigation with section links
- Top bar: Logo on the left, user menu on the right
- Content area: Main content area that takes remaining space

## Responsive Behavior

- **Desktop:** Full sidebar visible (256px width), top bar spans full width, content area adjusts
- **Tablet:** Sidebar can be toggled with hamburger menu, collapses to overlay on smaller screens
- **Mobile:** Sidebar hidden by default, accessible via hamburger menu in top bar, becomes overlay drawer

## Components Provided

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with avatar

## UI Dependencies

These components depend on UI primitives that need to be available in your codebase:

- `@/components/ui/dropdown-menu` — Radix UI DropdownMenu components
- `@/components/ui/avatar` — Avatar component with Image and Fallback

You may need to:
1. Install `@radix-ui/react-dropdown-menu` and `@radix-ui/react-avatar`
2. Create wrapper components matching the import paths, or
3. Update the import paths to match your UI component library

## Design Notes

- Uses indigo as primary color for active states and accents
- Uses slate for neutral backgrounds, borders, and text
- Inter font family for all typography
- Supports light and dark mode
- Sidebar has subtle background separation from content area
- Active navigation item highlighted with primary color
- Hover states use secondary color for feedback

