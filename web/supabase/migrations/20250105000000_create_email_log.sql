-- Create email_log table for tracking email delivery status
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'booking_confirmation', 'booking_reminder', 'payment_failure', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
  provider_id TEXT, -- ID from email provider (e.g., Resend)
  error_message TEXT,
  metadata JSONB, -- Additional context (booking_id, reminder_type, etc.)
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_log_salon_id ON email_log (salon_id);
CREATE INDEX IF NOT EXISTS idx_email_log_recipient_email ON email_log (recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log (status);
CREATE INDEX IF NOT EXISTS idx_email_log_email_type ON email_log (email_type);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON email_log (created_at DESC);

-- RLS Policies
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view email logs for their salon
CREATE POLICY "Users can view email logs for their salon"
  ON email_log
  FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role can insert/update email logs (e.g., from Edge Functions)
CREATE POLICY "Service role can manage email logs"
  ON email_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated users can insert email logs (e.g., from services)
CREATE POLICY "Authenticated users can insert email logs"
  ON email_log
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_email_log_updated_at
  BEFORE UPDATE ON email_log
  FOR EACH ROW
  EXECUTE FUNCTION update_email_log_updated_at();

COMMENT ON TABLE email_log IS 'Tracks email delivery status for all sent emails';
COMMENT ON COLUMN email_log.email_type IS 'Type of email: booking_confirmation, booking_reminder, payment_failure, etc.';
COMMENT ON COLUMN email_log.status IS 'Delivery status: pending, sent, delivered, failed, bounced';
COMMENT ON COLUMN email_log.provider_id IS 'ID returned from email provider (e.g., Resend email ID)';

