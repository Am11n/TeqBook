-- No-show strike system: customer strike tracking + salon-level policy

-- Add no-show tracking columns to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS no_show_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;

-- Salon-level no-show policy table
CREATE TABLE IF NOT EXISTS no_show_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  max_strikes INTEGER NOT NULL DEFAULT 3,
  auto_block BOOLEAN NOT NULL DEFAULT false,
  warning_threshold INTEGER NOT NULL DEFAULT 2,
  reset_after_days INTEGER, -- null = never reset
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salon_id)
);

ALTER TABLE no_show_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view no-show policy for their salon"
  ON no_show_policies FOR SELECT
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert no-show policy for their salon"
  ON no_show_policies FOR INSERT
  WITH CHECK (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update no-show policy for their salon"
  ON no_show_policies FOR UPDATE
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_no_show_policies_salon_id ON no_show_policies(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_blocked ON customers(salon_id, is_blocked) WHERE is_blocked = true;
