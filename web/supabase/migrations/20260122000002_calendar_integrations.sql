-- =====================================================
-- Calendar Integrations
-- =====================================================
-- Task Group 28: Google Calendar Sync
-- Stores OAuth tokens and sync settings for calendar providers

-- Calendar provider enum
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'apple');

-- Calendar sync direction enum
CREATE TYPE sync_direction AS ENUM ('push', 'pull', 'bidirectional');

-- =====================================================
-- Calendar Connections Table
-- =====================================================
-- Stores OAuth tokens and connection status per user/salon

CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  provider calendar_provider NOT NULL,
  
  -- OAuth tokens (encrypted in application layer before storage)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Provider-specific data
  provider_user_id TEXT, -- e.g., Google user ID
  provider_email TEXT,   -- e.g., Google account email
  
  -- Selected calendar
  calendar_id TEXT,      -- e.g., primary, specific calendar ID
  calendar_name TEXT,
  
  -- Sync settings
  sync_direction sync_direction DEFAULT 'push',
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_sync_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one connection per user/salon/provider
  UNIQUE (user_id, salon_id, provider)
);

-- =====================================================
-- Calendar Events Mapping Table
-- =====================================================
-- Maps TeqBook bookings to external calendar events

CREATE TABLE IF NOT EXISTS calendar_event_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
  
  -- External event reference
  external_event_id TEXT NOT NULL,
  external_calendar_id TEXT NOT NULL,
  
  -- Sync status
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_hash TEXT, -- Hash of booking data to detect changes
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one mapping per booking/connection
  UNIQUE (booking_id, connection_id)
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_calendar_connections_user ON calendar_connections(user_id);
CREATE INDEX idx_calendar_connections_salon ON calendar_connections(salon_id);
CREATE INDEX idx_calendar_connections_provider ON calendar_connections(provider);
CREATE INDEX idx_calendar_connections_enabled ON calendar_connections(sync_enabled) WHERE sync_enabled = true;

CREATE INDEX idx_calendar_event_mappings_booking ON calendar_event_mappings(booking_id);
CREATE INDEX idx_calendar_event_mappings_connection ON calendar_event_mappings(connection_id);
CREATE INDEX idx_calendar_event_mappings_external ON calendar_event_mappings(external_event_id);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_mappings ENABLE ROW LEVEL SECURITY;

-- Calendar connections: Users can only see their own connections
CREATE POLICY "Users can view own calendar connections"
  ON calendar_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar connections"
  ON calendar_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar connections"
  ON calendar_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar connections"
  ON calendar_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Calendar event mappings: Based on connection ownership
CREATE POLICY "Users can view own event mappings"
  ON calendar_event_mappings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calendar_connections cc
      WHERE cc.id = calendar_event_mappings.connection_id
      AND cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own event mappings"
  ON calendar_event_mappings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM calendar_connections cc
      WHERE cc.id = calendar_event_mappings.connection_id
      AND cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own event mappings"
  ON calendar_event_mappings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM calendar_connections cc
      WHERE cc.id = calendar_event_mappings.connection_id
      AND cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own event mappings"
  ON calendar_event_mappings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM calendar_connections cc
      WHERE cc.id = calendar_event_mappings.connection_id
      AND cc.user_id = auth.uid()
    )
  );

-- =====================================================
-- Updated_at Trigger
-- =====================================================

CREATE TRIGGER set_calendar_connections_updated_at
  BEFORE UPDATE ON calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE calendar_connections IS 'OAuth tokens and settings for calendar provider connections';
COMMENT ON TABLE calendar_event_mappings IS 'Maps TeqBook bookings to external calendar events for sync tracking';
COMMENT ON COLUMN calendar_connections.access_token IS 'OAuth access token - should be encrypted before storage';
COMMENT ON COLUMN calendar_connections.refresh_token IS 'OAuth refresh token - should be encrypted before storage';
COMMENT ON COLUMN calendar_event_mappings.sync_hash IS 'Hash of booking data to detect changes needing sync';
