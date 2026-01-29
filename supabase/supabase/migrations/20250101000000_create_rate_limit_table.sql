-- =====================================================
-- Create Rate Limit Table
-- =====================================================
-- This table stores rate limit entries for server-side
-- rate limiting to prevent brute force attacks
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email, IP address, or other identifier
  identifier_type TEXT NOT NULL DEFAULT 'email', -- 'email', 'ip', 'user_id'
  endpoint_type TEXT NOT NULL DEFAULT 'login', -- 'login', 'api', 'booking', etc.
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ, -- NULL if not blocked
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one entry per identifier + endpoint_type combination
  UNIQUE(identifier, identifier_type, endpoint_type)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON rate_limit_entries(identifier, identifier_type, endpoint_type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window_start ON rate_limit_entries(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked_until ON rate_limit_entries(blocked_until) WHERE blocked_until IS NOT NULL;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rate_limit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER rate_limit_entries_updated_at
  BEFORE UPDATE ON rate_limit_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limit_updated_at();

-- RLS Policies
-- Rate limit entries should only be accessible by service role (Edge Functions)
-- Regular users should not be able to read or modify rate limit entries
ALTER TABLE rate_limit_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access rate limit entries
CREATE POLICY "Service role can manage rate limit entries"
  ON rate_limit_entries
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to clean up old rate limit entries (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_entries
  WHERE updated_at < NOW() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table
COMMENT ON TABLE rate_limit_entries IS 'Stores rate limit entries for server-side rate limiting';
COMMENT ON COLUMN rate_limit_entries.identifier IS 'The identifier being rate limited (email, IP, user_id, etc.)';
COMMENT ON COLUMN rate_limit_entries.identifier_type IS 'Type of identifier: email, ip, user_id';
COMMENT ON COLUMN rate_limit_entries.endpoint_type IS 'Type of endpoint: login, api, booking, etc.';
COMMENT ON COLUMN rate_limit_entries.attempts IS 'Number of attempts in current window';
COMMENT ON COLUMN rate_limit_entries.window_start IS 'Start of the rate limit window';
COMMENT ON COLUMN rate_limit_entries.blocked_until IS 'Timestamp when the identifier will be unblocked (NULL if not blocked)';

