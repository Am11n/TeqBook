# Task Group 17: Notification System (Email + In-App + ICS)

**Source:** `agent-os/product/roadmap.md` - Task #17 (replaces SMS with free-first approach)  
**Goal:** Complete notification system with Email, In-App notifications, and Calendar Invites  
**Principle:** Free-first implementation - no paid services, use existing infrastructure  
**Cost:** $0 recurring (uses existing Resend email service and Supabase)

---

## Overview

This task group implements a comprehensive notification system that replaces the original SMS plan with a cost-effective approach using:

1. **Email** (existing Resend integration)
2. **In-App Notifications** (new, stored in Supabase)
3. **Calendar Invites (ICS)** (new, pure TypeScript generation)

The system builds on the existing `notification-service.ts` and `email-service.ts`, adding in-app notifications and ICS generation while maintaining the preference enforcement already in place.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Booking Events                               │
│         (Created, Updated, Cancelled, Reminder)                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Unified Notification Service                        │
│                   sendNotification()                             │
│         ┌───────────────────────────────────────┐               │
│         │     Check Preferences (existing)       │               │
│         └───────────────────────────────────────┘               │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│    ┌─────────┐    ┌───────────┐    ┌───────────┐               │
│    │  Email  │    │  In-App   │    │    ICS    │               │
│    │(Resend) │    │(Supabase) │    │(generate) │               │
│    └─────────┘    └───────────┘    └───────────┘               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer                                  │
│    ┌──────────────────────────────────────────────┐             │
│    │  NotificationCenter (existing, enhanced)      │             │
│    │  - Bell icon with unread badge                │             │
│    │  - Dropdown panel with notification list      │             │
│    │  - Mark as read / Mark all as read            │             │
│    └──────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Task List

### 17.1 Unified Notification Service ✅ COMPLETED

**Dependencies:** Existing `notification-service.ts`, `email-service.ts`  
**Effort:** 1 day

- [x] 17.1.0 Extend notification service to be channel-agnostic
  - [x] 17.1.1 Create unified notification interface
    - Location: `web/src/lib/services/unified-notification-service.ts`
    - Interface for routing notifications to appropriate channels
    - Support for multiple channels per notification (email + in-app)
  - [x] 17.1.2 Add `sendNotification()` function
    - Checks preferences before sending (uses existing logic)
    - Routes to email, in-app, or both based on type
    - Attaches ICS to booking confirmation emails
    - Returns combined result from all channels
  - [x] 17.1.3 Add `sendBookingNotification()` convenience function
    - Handles booking confirmed, changed, cancelled
    - Automatically includes ICS for confirmations
    - Creates both email and in-app notification
  - [x] 17.1.4 Add `sendReminderNotification()` function
    - Handles 24h and 2h reminders
    - Creates both email and in-app notification

**Files to Create/Modify:**
- `web/src/lib/services/unified-notification-service.ts` ✅ (new)
- `web/src/lib/types/notifications.ts` ✅ (new)

---

### 17.2 In-App Notification Center ✅ COMPLETED

**Dependencies:** None  
**Effort:** 2 days

- [x] 17.2.0 Complete in-app notification system
  - [x] 17.2.1 Create database migration for `notifications` table
    - Location: `web/supabase/migrations/20260121000001_create_notifications.sql`
    - Fields: `id`, `user_id`, `salon_id`, `type`, `title`, `body`, `read`, `metadata`, `action_url`, `created_at`
    - Add indexes: `user_id`, `user_id + read` (for unread count)
    - Add RLS policies: Users can only view/update own notifications
  - [x] 17.2.2 Create notifications repository
    - Location: `web/src/lib/repositories/notifications.ts`
    - `createNotification(input)` - create new notification
    - `getNotificationsForUser(userId, options)` - paginated list
    - `getUnreadCount(userId)` - count for badge
    - `markAsRead(notificationId, userId)` - mark single as read
    - `markAllAsRead(userId)` - mark all as read
    - `deleteNotification(notificationId, userId)` - optional cleanup
  - [x] 17.2.3 Create in-app notification service
    - Location: `web/src/lib/services/in-app-notification-service.ts`
    - Wrapper around repository with validation
    - Logging for notification creation
  - [x] 17.2.4 Create useNotifications hook
    - Location: `web/src/lib/hooks/notifications/useNotifications.ts`
    - Fetch notifications with pagination
    - Polling for new notifications (optional, every 60s)
    - Unread count state
    - Mark as read actions
  - [x] 17.2.5 Enhance existing NotificationCenter component
    - Update: `web/src/components/notification-center.tsx`
    - Replace mock data with real Supabase data
    - Use useNotifications hook
    - Keep existing UI design (bell, badge, dropdown)
    - Add real mark as read functionality
  - [x] 17.2.6 Create API routes for notifications
    - `web/src/app/api/notifications/route.ts` - GET notifications
    - `web/src/app/api/notifications/unread-count/route.ts` - GET unread count
    - `web/src/app/api/notifications/mark-all-read/route.ts` - POST mark all read
    - `web/src/app/api/notifications/[id]/read/route.ts` - POST mark single as read

**Files to Create/Modify:**
- `web/supabase/migrations/20260121000001_create_notifications.sql` ✅ (new)
- `web/src/lib/repositories/notifications.ts` ✅ (new)
- `web/src/lib/services/in-app-notification-service.ts` ✅ (new)
- `web/src/lib/hooks/notifications/useNotifications.ts` ✅ (new)
- `web/src/components/notification-center.tsx` ✅ (update)
- `web/src/app/api/notifications/route.ts` ✅ (new)
- `web/src/app/api/notifications/unread-count/route.ts` ✅ (new)
- `web/src/app/api/notifications/mark-all-read/route.ts` ✅ (new)
- `web/src/app/api/notifications/[id]/read/route.ts` ✅ (new)

---

### 17.3 Calendar Invite (ICS) Generation ✅ COMPLETED

**Dependencies:** None  
**Effort:** 0.5 days

- [x] 17.3.0 Complete ICS generation and integration
  - [x] 17.3.1 Create calendar invite service
    - Location: `web/src/lib/services/calendar-invite-service.ts`
    - Pure TypeScript, no external libraries
    - `generateICS(booking)` - returns ICS string
    - Include: VEVENT, UID, DTSTAMP, DTSTART, DTEND, SUMMARY, DESCRIPTION, LOCATION
    - Include: VALARM for 1-hour reminder
    - Proper date formatting (UTC with TZID or floating)
    - Escape special characters in text fields
  - [x] 17.3.2 Add ICS attachment support to email service
    - Update: `web/src/lib/services/email-service.ts`
    - Add optional `attachments` to SendEmailInput
    - Support for ICS MIME type (text/calendar)
  - [x] 17.3.3 Integrate ICS with booking confirmation email
    - ICS generated in unified-notification-service
    - Attach ICS file to email via attachments

**ICS Format Example:**
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TeqBook//Booking//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:booking-uuid@teqbook.com
DTSTAMP:20250121T120000Z
DTSTART:20250122T140000Z
DTEND:20250122T150000Z
SUMMARY:Haircut - Salon Name
DESCRIPTION:Your appointment is confirmed
LOCATION:123 Main St, City
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Appointment reminder
END:VALARM
END:VEVENT
END:VCALENDAR
```

**Files to Create/Modify:**
- `web/src/lib/services/calendar-invite-service.ts` ✅ (new)
- `web/src/lib/services/email-service.ts` ✅ (update - added EmailAttachment type and attachments support)

---

### 17.4 Email Delivery Tracking (SKIPPED)

**Status:** Postponed to future iteration  
**Reason:** Requires webhook setup and additional infrastructure

This task is explicitly out of scope for the free-first implementation. Basic email logging already exists via `email_log` table.

---

### 17.5 Notification Preferences (Enhanced) ✅ COMPLETED

**Dependencies:** Existing notification preferences system  
**Effort:** 0.5 days

- [x] 17.5.0 Enhance notification preferences
  - [x] 17.5.1 Add in-app notification preferences
    - Update: `web/src/lib/services/notification-service.ts`
    - Add `inApp` to NotificationPreferences type
    - Add preference checks for in-app notifications
    - Added `InAppNotificationPreferenceType` type
    - Updated `getDefaultPreferences()` with inApp defaults
    - Updated `shouldSendNotification()` to check inApp preferences
    - Updated `getNotificationPreferences()` to merge inApp preferences
  - [ ] 17.5.2 Add salon-level reminder toggle (DEFERRED)
    - Check existing salon settings for `reminders_enabled`
    - If column doesn't exist, add migration
    - Enforce salon preference in notification service
  - [ ] 17.5.3 Update settings UI (DEFERRED)
    - Update: `web/src/app/settings/notifications/page.tsx`
    - Add toggle for in-app notifications
    - Ensure all preference types are saved correctly

**Files to Create/Modify:**
- `web/src/lib/services/notification-service.ts` ✅ (update - added inApp preferences)

---

### 17.6 Notification Templates ✅ COMPLETED

**Dependencies:** Existing email templates, i18n system  
**Effort:** 0.5 days

- [x] 17.6.0 Complete notification templates
  - [x] 17.6.1 Create booking cancellation email template
    - Location: `web/src/lib/templates/email/booking-cancellation.tsx`
    - Include: salon name, service, date/time, reason (if provided)
    - Support i18n via existing translations (en, nb, ar, so, ti, am)
  - [x] 17.6.2 Add in-app notification templates to translations
    - Updated ALL 15 language files with `notifications` section:
      - en, nb, ar, so, ti, am, tr, pl, vi, zh, tl, fa, dar, ur, hi
    - Added `NotificationsMessages` type to `translations.ts`
    - Includes: booking_confirmed, booking_changed, booking_cancelled, reminder_24h, reminder_2h, new_booking
  - [x] 17.6.3 Create template renderer for in-app notifications
    - Location: `web/src/lib/templates/in-app/notification-templates.ts`
    - Functions to render notification title/body with dynamic data
    - Support for variable interpolation with {{variable}} syntax
    - Date/time formatting per locale

**Files to Create/Modify:**
- `web/src/lib/templates/email/booking-cancellation.tsx` ✅ (new)
- `web/src/lib/templates/in-app/notification-templates.ts` ✅ (new)
- `web/src/i18n/translations.ts` ✅ (update - added NotificationsMessages type)
- `web/src/i18n/en.ts` ✅ (update)
- `web/src/i18n/nb.ts` ✅ (update)
- `web/src/i18n/ar.ts` ✅ (update)
- `web/src/i18n/so.ts` ✅ (update)
- `web/src/i18n/ti.ts` ✅ (update)
- `web/src/i18n/am.ts` ✅ (update)
- `web/src/i18n/tr.ts` ✅ (update)
- `web/src/i18n/pl.ts` ✅ (update)
- `web/src/i18n/vi.ts` ✅ (update)
- `web/src/i18n/zh.ts` ✅ (update)
- `web/src/i18n/tl.ts` ✅ (update)
- `web/src/i18n/fa.ts` ✅ (update)
- `web/src/i18n/dar.ts` ✅ (update)
- `web/src/i18n/ur.ts` ✅ (update)
- `web/src/i18n/hi.ts` ✅ (update)

---

### 17.7 Tests ✅ COMPLETED

**Dependencies:** All other 17.x tasks  
**Effort:** 0.5 days

- [x] 17.7.0 Write 4-6 focused tests
  - [x] 17.7.1 Test unified notification service
    - Test preference enforcement blocks notifications when disabled
    - Test routing to correct channels
    - Test ICS attachment on booking confirmation
    - Test error handling for email and in-app failures
  - [x] 17.7.2 Test ICS generation
    - Test ICS output format is valid
    - Test date formatting (UTC conversion)
    - Test special character escaping
    - Test VALARM reminder is included
    - Test CRLF line endings
  - [x] 17.7.3 Test notifications repository
    - Test createNotification with correct fields
    - Test getNotificationsForUser with pagination
    - Test unread count query
    - Test mark as read updates correctly
    - Test mark all as read
    - Test deleteNotification

**Files Created:**
- `web/tests/unit/services/unified-notification-service.test.ts` ✅
- `web/tests/unit/services/calendar-invite-service.test.ts` ✅
- `web/tests/unit/repositories/notifications.test.ts` ✅

---

## Acceptance Criteria

- [x] In-app notifications are stored in database and displayed in UI
- [x] Booking confirmations include ICS calendar invite attachment
- [x] Notification preferences are enforced for all channels
- [x] Existing NotificationCenter shows real data instead of mock
- [x] All 4-6 tests pass (3 test files created)
- [x] No new paid services or dependencies added

---

## Files Summary

### New Files
| File | Description |
|------|-------------|
| `web/supabase/migrations/[timestamp]_create_notifications.sql` | Notifications table |
| `web/src/lib/repositories/notifications.ts` | CRUD for notifications |
| `web/src/lib/services/in-app-notification-service.ts` | In-app notification logic |
| `web/src/lib/services/unified-notification-service.ts` | Channel-agnostic notification router |
| `web/src/lib/services/calendar-invite-service.ts` | ICS generator |
| `web/src/lib/hooks/useNotifications.ts` | React hook for notifications |
| `web/src/lib/types/notifications.ts` | TypeScript types |
| `web/src/lib/templates/email/booking-cancellation.tsx` | Cancellation email template |
| `web/src/lib/templates/in-app/notification-templates.ts` | In-app templates |
| `web/tests/unit/services/unified-notification-service.test.ts` | Tests |
| `web/tests/unit/services/calendar-invite-service.test.ts` | Tests |
| `web/tests/unit/repositories/notifications.test.ts` | Tests |

### Modified Files
| File | Changes |
|------|---------|
| `web/src/components/notification-center.tsx` | Replace mock with real data |
| `web/src/lib/services/email-service.ts` | Add attachment support |
| `web/src/lib/services/notification-service.ts` | Add in-app preferences |
| `web/src/lib/templates/email/booking-confirmation.tsx` | Add ICS |
| `web/src/i18n/en.ts` | Add notification templates |
| `web/src/i18n/nb.ts` | Add notification templates |
| `web/src/app/settings/notifications/page.tsx` | Add in-app toggle |

---

## Estimated Effort

| Sub-task | Estimate |
|----------|----------|
| 17.1 Unified Notification Service | 1 day |
| 17.2 In-App Notification Center | 2 days |
| 17.3 ICS Generator | 0.5 day |
| 17.5 Preferences | 0.5 day |
| 17.6 Templates | 0.5 day |
| 17.7 Tests | 0.5 day |
| **Total** | **~5 days** |

---

## Cost Analysis

| Component | Cost |
|-----------|------|
| Email (Resend) | Existing - free tier (100 emails/day) |
| In-App (Supabase) | Existing - included in plan |
| ICS Generation | $0 - pure TypeScript |
| **Total Recurring** | **$0** |

---

## Integration Points

### Booking Service
Update `bookings-service.ts` to call unified notification service:
- On booking creation: send confirmation + ICS
- On booking update: send change notification
- On booking cancellation: send cancellation notification

### Reminder System
Update existing reminder cron/API to use unified notification service:
- 24h reminder: send email + in-app
- 2h reminder: send email + in-app

---

## Progress Tracking

| Task | Status | Tests |
|------|--------|-------|
| 17.1 Unified Service | ✅ Complete | unified-notification-service.test.ts |
| 17.2 In-App Notifications | ✅ Complete | notifications.test.ts |
| 17.3 ICS Generator | ✅ Complete | calendar-invite-service.test.ts |
| 17.4 Delivery Tracking | 🔵 Skipped | - |
| 17.5 Preferences | ✅ Complete (partial - UI deferred) | notification-service.test.ts (existing) |
| 17.6 Templates | ✅ Complete | - |
| 17.7 Tests | ✅ Complete | 3/3 test files |

---

## Implementation Summary

**Completed on:** 2026-01-21

### New Files Created (12 files):
| File | Description |
|------|-------------|
| `web/supabase/migrations/20260121000001_create_notifications.sql` | Notifications table with RLS |
| `web/src/lib/types/notifications.ts` | TypeScript types for notification system |
| `web/src/lib/repositories/notifications.ts` | CRUD operations for notifications |
| `web/src/lib/services/in-app-notification-service.ts` | In-app notification service |
| `web/src/lib/services/unified-notification-service.ts` | Channel-agnostic notification router |
| `web/src/lib/services/calendar-invite-service.ts` | Pure TypeScript ICS generator |
| `web/src/lib/hooks/notifications/useNotifications.ts` | React hook with polling |
| `web/src/lib/templates/email/booking-cancellation.tsx` | Cancellation email template |
| `web/src/lib/templates/in-app/notification-templates.ts` | In-app notification renderer |
| `web/src/app/api/notifications/route.ts` | GET notifications API |
| `web/src/app/api/notifications/unread-count/route.ts` | GET unread count API |
| `web/src/app/api/notifications/mark-all-read/route.ts` | POST mark all read API |
| `web/src/app/api/notifications/[id]/read/route.ts` | POST mark single as read API |
| `web/tests/unit/services/unified-notification-service.test.ts` | Tests |
| `web/tests/unit/services/calendar-invite-service.test.ts` | Tests |
| `web/tests/unit/repositories/notifications.test.ts` | Tests |

### Modified Files (18 files):
| File | Changes |
|------|---------|
| `web/src/components/notification-center.tsx` | Replace mock with real Supabase data |
| `web/src/lib/services/email-service.ts` | Add EmailAttachment type and attachments support |
| `web/src/lib/services/notification-service.ts` | Add inApp preferences and checks |
| `web/src/i18n/translations.ts` | Add NotificationsMessages type |
| `web/src/i18n/en.ts` | Add notifications section |
| `web/src/i18n/nb.ts` | Add notifications section |
| `web/src/i18n/ar.ts` | Add notifications section |
| `web/src/i18n/so.ts` | Add notifications section |
| `web/src/i18n/ti.ts` | Add notifications section |
| `web/src/i18n/am.ts` | Add notifications section |
| `web/src/i18n/tr.ts` | Add notifications section |
| `web/src/i18n/pl.ts` | Add notifications section |
| `web/src/i18n/vi.ts` | Add notifications section |
| `web/src/i18n/zh.ts` | Add notifications section |
| `web/src/i18n/tl.ts` | Add notifications section |
| `web/src/i18n/fa.ts` | Add notifications section |
| `web/src/i18n/dar.ts` | Add notifications section |
| `web/src/i18n/ur.ts` | Add notifications section |
| `web/src/i18n/hi.ts` | Add notifications section |
