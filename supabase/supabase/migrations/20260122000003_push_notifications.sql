-- =====================================================
-- Push Notifications Migration
-- =====================================================
-- Task Group 35: Push Notifications
-- Creates tables for push subscriptions and notification preferences

-- =====================================================
-- Push Subscriptions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  
  -- Unique constraint on user + endpoint
  CONSTRAINT push_subscriptions_user_endpoint_unique UNIQUE (user_id, endpoint)
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
  ON push_subscriptions(user_id);

-- =====================================================
-- Notification Preferences Table
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  new_booking BOOLEAN NOT NULL DEFAULT true,
  booking_reminder BOOLEAN NOT NULL DEFAULT true,
  booking_cancelled BOOLEAN NOT NULL DEFAULT true,
  booking_rescheduled BOOLEAN NOT NULL DEFAULT true,
  daily_summary BOOLEAN NOT NULL DEFAULT false,
  reminder_hours_before INTEGER NOT NULL DEFAULT 24 CHECK (reminder_hours_before >= 1 AND reminder_hours_before <= 168),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Push subscriptions: users can only manage their own
CREATE POLICY "Users can view their own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can access all subscriptions (for sending notifications)
CREATE POLICY "Service role can access all push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Notification preferences: users can only manage their own
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- Updated At Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- =====================================================
-- Helper Function: Get Users to Notify
-- =====================================================

CREATE OR REPLACE FUNCTION get_users_to_notify(
  p_notification_type TEXT,
  p_salon_id UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  endpoint TEXT,
  p256dh TEXT,
  auth TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.user_id,
    ps.endpoint,
    ps.p256dh,
    ps.auth
  FROM push_subscriptions ps
  JOIN notification_preferences np ON ps.user_id = np.user_id
  LEFT JOIN employees e ON ps.user_id = e.user_id
  WHERE 
    -- Check notification type preference
    CASE p_notification_type
      WHEN 'new_booking' THEN np.new_booking
      WHEN 'booking_reminder' THEN np.booking_reminder
      WHEN 'booking_cancelled' THEN np.booking_cancelled
      WHEN 'booking_rescheduled' THEN np.booking_rescheduled
      WHEN 'daily_summary' THEN np.daily_summary
      ELSE true
    END = true
    -- Check quiet hours (if set)
    AND (
      np.quiet_hours_start IS NULL 
      OR np.quiet_hours_end IS NULL
      OR NOT (
        CURRENT_TIME >= np.quiet_hours_start 
        AND CURRENT_TIME < np.quiet_hours_end
      )
    )
    -- Filter by salon if provided
    AND (p_salon_id IS NULL OR e.salon_id = p_salon_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE push_subscriptions IS 'Stores Web Push subscription data for users';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification types and timing';
COMMENT ON FUNCTION get_users_to_notify IS 'Returns push subscription data for users who should receive a notification';
