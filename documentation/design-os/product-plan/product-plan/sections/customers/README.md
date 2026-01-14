# Customers

## Overview

The Customers section provides a comprehensive customer directory for managing customer profiles, viewing booking history, and tracking preferences. Users can search customers, view detailed profiles, manage tags and notes, and control marketing consent settings.

## User Flows

- View customer list with search functionality to find customers by name, email, or phone
- View customer profile in a drawer or page showing contact information, booking history, tags, notes, and preferences
- View booking history as a timeline or table showing past and upcoming appointments with service details
- Add and manage tags on customer profiles for categorization and quick identification
- Add and edit notes on customer profiles to track preferences, special requests, or important information
- Toggle marketing consent and communication preferences for each customer
- Filter customers by tags or other criteria
- Create new customer profile when needed

## Design Decisions

- Customer list with search as primary interface
- Customer profile drawer with comprehensive information
- Booking history timeline for easy reference
- Tags for flexible categorization
- Notes system for tracking preferences and special requests
- Marketing consent toggles for compliance

## Data Used

**Entities:** Customer, Booking, CustomerNote, MarketingConsent

**From global model:** Customer, Booking entities

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Components Provided

- `CustomersList` — Main component with customer list and search
- `CustomerRow` — Individual customer row
- `CustomerFilters` — Filter component
- `CustomerProfileDrawer` — Customer profile drawer with booking history, tags, notes
- `TagBadge` — Tag badge component

## Callback Props

| Callback | Description |
|----------|-------------|
| `onView` | Called when user wants to view a customer's profile |
| `onEdit` | Called when user wants to edit a customer |
| `onCreate` | Called when user wants to create a new customer |
| `onDelete` | Called when user wants to delete a customer |
| `onAddTag` | Called when user adds a tag to a customer |
| `onRemoveTag` | Called when user removes a tag from a customer |
| `onAddNote` | Called when user adds a note to a customer |
| `onEditNote` | Called when user edits a note |
| `onDeleteNote` | Called when user deletes a note |
| `onUpdateMarketingConsent` | Called when user updates marketing consent |
| `onFilter` | Called when user applies filters |

