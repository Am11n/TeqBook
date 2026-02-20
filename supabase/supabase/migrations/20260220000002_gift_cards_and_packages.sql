-- Gift cards, packages, and customer packages for the revenue/retention engine.
-- All payment is physical in salon — these track value, not process payments.

-- Gift cards
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  initial_value_cents INTEGER NOT NULL,
  remaining_value_cents INTEGER NOT NULL,
  purchased_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  recipient_name TEXT,
  recipient_email TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salon_id, code)
);

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gift cards for their salon"
  ON gift_cards FOR SELECT
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert gift cards for their salon"
  ON gift_cards FOR INSERT
  WITH CHECK (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update gift cards for their salon"
  ON gift_cards FOR UPDATE
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_gift_cards_salon_id ON gift_cards(salon_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(salon_id, code);

-- Service packages (templates)
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  included_services JSONB NOT NULL DEFAULT '[]', -- [{service_id, quantity}]
  price_cents INTEGER NOT NULL,
  validity_days INTEGER NOT NULL DEFAULT 365,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view packages for their salon"
  ON packages FOR SELECT
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert packages for their salon"
  ON packages FOR INSERT
  WITH CHECK (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update packages for their salon"
  ON packages FOR UPDATE
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_packages_salon_id ON packages(salon_id);

-- Sold packages (customer has purchased a package)
CREATE TABLE IF NOT EXISTS customer_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  remaining_services JSONB NOT NULL DEFAULT '[]', -- [{service_id, remaining}]
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE customer_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view customer packages for their salon"
  ON customer_packages FOR SELECT
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert customer packages for their salon"
  ON customer_packages FOR INSERT
  WITH CHECK (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update customer packages for their salon"
  ON customer_packages FOR UPDATE
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_customer_packages_salon_id ON customer_packages(salon_id);
CREATE INDEX IF NOT EXISTS idx_customer_packages_customer_id ON customer_packages(customer_id);

-- Add payment_source to bookings to track how the booking was paid
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_source TEXT NOT NULL DEFAULT 'cash';
-- Values: 'cash' | 'gift_card' | 'package'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS gift_card_id UUID REFERENCES gift_cards(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_package_id UUID REFERENCES customer_packages(id) ON DELETE SET NULL;
