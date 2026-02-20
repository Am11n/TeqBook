-- Import system for competitor migration tool

CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  import_type TEXT NOT NULL, -- 'customers' | 'services' | 'employees' | 'bookings'
  file_name TEXT,
  total_rows INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  column_mapping JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed' | 'rolled_back'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view import batches for their salon"
  ON import_batches FOR SELECT
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert import batches for their salon"
  ON import_batches FOR INSERT
  WITH CHECK (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update import batches for their salon"
  ON import_batches FOR UPDATE
  USING (salon_id IN (SELECT salon_id FROM profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_import_batches_salon_id ON import_batches(salon_id);

-- Extend tables with import tracking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_imported BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_import_batch ON bookings(import_batch_id) WHERE import_batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_import_batch ON customers(import_batch_id) WHERE import_batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_is_imported ON bookings(salon_id, is_imported) WHERE is_imported = true;
