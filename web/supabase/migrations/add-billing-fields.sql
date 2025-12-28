-- =====================================================
-- Add Billing Fields to Salons Table
-- =====================================================
-- This SQL script adds billing-related fields to the salons table
-- for future Stripe integration.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add billing_customer_id
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salons' AND column_name = 'billing_customer_id'
  ) THEN
    ALTER TABLE salons ADD COLUMN billing_customer_id TEXT;

    COMMENT ON COLUMN salons.billing_customer_id IS
      'Stripe customer ID for this salon. Used to link salon to Stripe customer.';
  END IF;
END $$;

-- Step 2: Add billing_subscription_id
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salons' AND column_name = 'billing_subscription_id'
  ) THEN
    ALTER TABLE salons ADD COLUMN billing_subscription_id TEXT;

    COMMENT ON COLUMN salons.billing_subscription_id IS
      'Stripe subscription ID for this salon. Used to manage subscription lifecycle.';
  END IF;
END $$;

-- Step 3: Add current_period_end
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salons' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE salons ADD COLUMN current_period_end TIMESTAMPTZ;

    COMMENT ON COLUMN salons.current_period_end IS
      'End date of the current billing period. Updated via Stripe webhooks.';
  END IF;
END $$;

-- Step 4: Add trial_end
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salons' AND column_name = 'trial_end'
  ) THEN
    ALTER TABLE salons ADD COLUMN trial_end TIMESTAMPTZ;

    COMMENT ON COLUMN salons.trial_end IS
      'End date of the trial period (if applicable). Null if no trial.';
  END IF;
END $$;

-- Step 5: Create indexes for billing queries
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_salons_billing_customer_id 
  ON salons(billing_customer_id) 
  WHERE billing_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_salons_billing_subscription_id 
  ON salons(billing_subscription_id) 
  WHERE billing_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_salons_current_period_end 
  ON salons(current_period_end) 
  WHERE current_period_end IS NOT NULL;

-- =====================================================
-- Notes:
-- =====================================================
-- - billing_customer_id: Set when creating a Stripe customer
-- - billing_subscription_id: Set when creating a subscription
-- - current_period_end: Updated via Stripe webhooks (subscription.updated)
-- - trial_end: Set when starting a trial, cleared when trial ends
-- - plan: Already exists (from add-addons-and-plan-limits.sql)

