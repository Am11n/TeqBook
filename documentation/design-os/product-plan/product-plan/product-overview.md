# TeqBook — Product Overview

## Summary

TeqBook is a clean, modern management platform designed specifically for barbershops and beauty salons. It streamlines day-to-day operations by bringing booking, scheduling, employee management, and business insights together in one intuitive system.

## Planned Sections

1. **Bookings** — Core booking system with calendar view and services catalog for managing appointments and service offerings.
2. **Team** — Employee management and shift scheduling to organize staff, availability, and coverage.
3. **Customers** — Customer database to track profiles, service history, and preferences for personalized experiences.
4. **Business** — Billing, payments, and analytics to track revenue, service performance, and business insights.

## Data Model

**Core Entities:**
- Salon — The barbershop or beauty salon business that uses the platform
- User — People who log into the system, including owners, managers, and employees
- Role — Permission levels that determine what users can access and do within the system
- Employee — Staff members who work at the salon and can be assigned to bookings and shifts
- Service — Services offered by the salon, such as haircuts, styling, treatments, and other offerings
- Booking — Appointments scheduled between customers and employees for specific services at designated times
- Customer — People who book appointments and receive services at the salon
- Shift — Scheduled work periods for employees with specific start and end times
- PaymentPlan — Billing plans that salons can subscribe to, such as basic, premium, or enterprise tiers
- Subscription — Active subscription that a salon has to a payment plan, determining their access level and features
- Notification — Messages and alerts sent to users about bookings, shifts, system events, and important updates

**Key Relationships:**
- Salon has many Users, Employees, Services, Bookings, and Customers
- User has one Role
- Employee belongs to Salon and is linked to a User
- Booking belongs to Customer, Service, and Employee
- Employee has many Shifts
- Salon has one Subscription
- Subscription belongs to PaymentPlan
- User has many Notifications

## Design System

**Colors:**
- Primary: indigo — Used for buttons, links, key accents
- Secondary: slate — Used for tags, highlights, secondary elements
- Neutral: slate — Used for backgrounds, text, borders

**Typography:**
- Heading: Inter — Used for all headings
- Body: Inter — Used for body text
- Mono: IBM Plex Mono — Used for code/technical text

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, and application shell
2. **Bookings** — Core booking system with calendar view and services catalog
3. **Team** — Employee management and shift scheduling
4. **Customers** — Customer database with profiles and booking history
5. **Business** — Salon settings, billing, and subscription management

Each milestone has a dedicated instruction document in `product-plan/instructions/`.

