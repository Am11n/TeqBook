# Business

## Overview

The Business section provides comprehensive salon settings management including business profile, opening hours, branding, billing and subscription plans, and notification preferences. Users can configure all aspects of their salon's business information and system settings in one centralized location.

## User Flows

- View and edit business profile with name, address, contact information, and organizational details
- Configure opening hours for each day of the week with ability to set different hours or mark days as closed
- Upload and manage business logo with preview
- View color palette preview showing current branding colors
- View current subscription plan with features and limits
- View billing history with invoices list and download options
- Upgrade or change subscription plan with clear CTA and feature comparison
- Configure notification preferences with email and SMS toggles for different event types
- Save changes with validation and confirmation

## Design Decisions

- Hub layout with left settings navigation and right content panel
- Tabbed sections for organized settings management
- Save/Cancel patterns for form changes
- Warning states for billing/plan limits
- Logo upload with preview
- Color palette preview for branding

## Data Used

**Entities:** Salon, OpeningHours, Branding, PaymentPlan, Subscription, Invoice, NotificationPreferences

**From global model:** Salon, PaymentPlan, Subscription entities

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Components Provided

- `BusinessSettings` — Main hub component with left nav and right content panel
- `SettingsNav` — Left navigation sidebar
- `ProfileSection` — Business profile form
- `HoursSection` — Opening hours editor
- `BrandingSection` — Logo upload and color palette preview
- `BillingSection` — Subscription plan and invoice history
- `NotificationsSection` — Notification preferences toggles

## Callback Props

| Callback | Description |
|----------|-------------|
| `onUpdateProfile` | Called when user updates business profile |
| `onUpdateOpeningHours` | Called when user updates opening hours |
| `onUploadLogo` | Called when user uploads a new logo |
| `onRemoveLogo` | Called when user removes logo |
| `onUpdateBranding` | Called when user updates branding colors |
| `onUpgradePlan` | Called when user upgrades or changes subscription plan |
| `onCancelSubscription` | Called when user cancels subscription |
| `onDownloadInvoice` | Called when user downloads an invoice |
| `onUpdateNotifications` | Called when user updates notification preferences |

