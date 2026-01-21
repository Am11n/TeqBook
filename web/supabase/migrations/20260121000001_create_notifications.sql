-- =====================================================
-- Create Notifications Table
-- =====================================================
-- In-app notification system for TeqBook
-- Stores notifications that users can view in the notification center

-- Create notifications table
-- Using TEXT for type instead of enum for flexibility
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('booking', 'system', 'staff', 'info')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT NULL,
  action_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT notifications_title_length CHECK (char_length(title) <= 200),
  CONSTRAINT notifications_body_length CHECK (char_length(body) <= 1000)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, read) 
  WHERE read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_salon_id 
  ON notifications(salon_id) 
  WHERE salon_id IS NOT NULL;

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can insert notifications (for background jobs)
-- Note: Application code uses service role to create notifications for users
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get unread count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM notifications
  WHERE user_id = p_user_id AND read = FALSE;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Only allow users to mark their own notifications
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE notifications
  SET read = TRUE
  WHERE user_id = p_user_id AND read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.user_id IS 'The user who should see this notification';
COMMENT ON COLUMN notifications.salon_id IS 'Optional salon context for the notification';
COMMENT ON COLUMN notifications.type IS 'Category of notification (booking, system, staff, info)';
COMMENT ON COLUMN notifications.title IS 'Short notification title (max 200 chars)';
COMMENT ON COLUMN notifications.body IS 'Full notification message (max 1000 chars)';
COMMENT ON COLUMN notifications.read IS 'Whether the user has read/dismissed this notification';
COMMENT ON COLUMN notifications.metadata IS 'Additional JSON data (booking_id, event_type, etc.)';
COMMENT ON COLUMN notifications.action_url IS 'URL to navigate to when notification is clicked';
