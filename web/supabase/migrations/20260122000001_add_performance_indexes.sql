-- =====================================================
-- Performance Indexes Migration
-- =====================================================
-- Task Group 22: Database Query Optimization
-- 
-- This migration adds indexes optimized for:
-- 1. Common query patterns in repositories
-- 2. RLS policy performance
-- 3. Calendar and booking lookups
-- 4. Search operations
-- =====================================================

-- =====================================================
-- ENABLE REQUIRED EXTENSIONS FIRST
-- =====================================================
-- pg_trgm is needed for trigram search indexes on text columns
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- PART 1: BOOKINGS INDEXES
-- =====================================================
-- Most queried table - calendar view, date range queries

-- Composite index for calendar date range queries (most common)
CREATE INDEX IF NOT EXISTS idx_bookings_salon_date_range
  ON bookings(salon_id, start_time, end_time);

-- Index for status filtering (common in list views)
CREATE INDEX IF NOT EXISTS idx_bookings_salon_status
  ON bookings(salon_id, status);

-- Index for customer lookup (booking history)
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id
  ON bookings(customer_id);

-- Index for employee lookup (performance metrics)
CREATE INDEX IF NOT EXISTS idx_bookings_employee_id
  ON bookings(employee_id);

-- Partial index for upcoming bookings only (very common query)
CREATE INDEX IF NOT EXISTS idx_bookings_upcoming
  ON bookings(salon_id, start_time)
  WHERE status IN ('pending', 'confirmed', 'scheduled');

-- =====================================================
-- PART 2: CUSTOMERS INDEXES
-- =====================================================

-- Index for name search (ILIKE optimization with gin trigram)
CREATE INDEX IF NOT EXISTS idx_customers_full_name_trgm
  ON customers USING gin (full_name gin_trgm_ops);

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_customers_email
  ON customers(salon_id, email)
  WHERE email IS NOT NULL;

-- Index for phone lookup
CREATE INDEX IF NOT EXISTS idx_customers_phone
  ON customers(salon_id, phone)
  WHERE phone IS NOT NULL;

-- =====================================================
-- PART 3: EMPLOYEES INDEXES
-- =====================================================

-- Index for active employees (common filter)
CREATE INDEX IF NOT EXISTS idx_employees_salon_active
  ON employees(salon_id, is_active)
  WHERE is_active = true;

-- Index for role filtering
CREATE INDEX IF NOT EXISTS idx_employees_salon_role
  ON employees(salon_id, role);

-- =====================================================
-- PART 4: SERVICES INDEXES
-- =====================================================

-- Index for active services (booking form)
CREATE INDEX IF NOT EXISTS idx_services_salon_active
  ON services(salon_id, is_active, sort_order)
  WHERE is_active = true;

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_services_category
  ON services(salon_id, category)
  WHERE category IS NOT NULL;

-- =====================================================
-- PART 5: EMPLOYEE_SERVICES INDEXES
-- =====================================================

-- Composite index for service lookup by employee
CREATE INDEX IF NOT EXISTS idx_employee_services_employee
  ON employee_services(employee_id, service_id);

-- Index for reverse lookup (which employees offer a service)
CREATE INDEX IF NOT EXISTS idx_employee_services_service
  ON employee_services(service_id, employee_id);

-- =====================================================
-- PART 6: NOTIFICATIONS INDEXES
-- =====================================================

-- Index for unread count (very frequent query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read)
  WHERE read = false;

-- Index for notification listing with date ordering
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- =====================================================
-- PART 7: PROFILES INDEXES
-- =====================================================

-- Index for salon_id lookup (used in all RLS policies)
CREATE INDEX IF NOT EXISTS idx_profiles_salon_id
  ON profiles(salon_id)
  WHERE salon_id IS NOT NULL;

-- Index for superadmin check (used in RLS policies)
CREATE INDEX IF NOT EXISTS idx_profiles_superadmin
  ON profiles(user_id)
  WHERE is_superadmin = true;

-- =====================================================
-- PART 8: SHIFTS INDEXES  
-- =====================================================
-- Note: idx_shifts_salon_id and idx_shifts_salon_employee_start 
-- already exist in supabase-foundation-complete.sql

-- =====================================================
-- PART 9: OPENING_HOURS INDEXES
-- =====================================================

-- Index for salon schedule lookup by day
CREATE INDEX IF NOT EXISTS idx_opening_hours_salon_day
  ON opening_hours(salon_id, day_of_week);

-- =====================================================
-- PART 10: AUDIT TABLES INDEXES
-- =====================================================

-- Email log - date range queries for reports
CREATE INDEX IF NOT EXISTS idx_email_log_created
  ON email_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_log_salon_created
  ON email_log(salon_id, created_at DESC)
  WHERE salon_id IS NOT NULL;

-- Reminders - processing lookup
CREATE INDEX IF NOT EXISTS idx_reminders_booking_type
  ON reminders(booking_id, reminder_type);

-- =====================================================
-- VERIFY INDEXES
-- =====================================================
-- Run this to verify all indexes were created:
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;
