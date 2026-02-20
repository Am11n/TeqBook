-- Commission rules for employee commission reports

CREATE TABLE IF NOT EXISTS commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE, -- null = salon-wide default
  commission_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' | 'fixed_per_booking'
  rate NUMERIC NOT NULL DEFAULT 0, -- decimal for %, cents for fixed
  applies_to TEXT NOT NULL DEFAULT 'services', -- 'services' | 'products' | 'both'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view commission rules for their salon"
  ON commission_rules FOR SELECT
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert commission rules for their salon"
  ON commission_rules FOR INSERT
  WITH CHECK (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update commission rules for their salon"
  ON commission_rules FOR UPDATE
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete commission rules for their salon"
  ON commission_rules FOR DELETE
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_commission_rules_salon_id ON commission_rules(salon_id);
CREATE INDEX IF NOT EXISTS idx_commission_rules_employee_id ON commission_rules(salon_id, employee_id);
