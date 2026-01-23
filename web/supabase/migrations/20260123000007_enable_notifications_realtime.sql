-- =====================================================
-- Enable Realtime for Notifications Table
-- =====================================================
-- This enables Supabase Realtime for the notifications table
-- so that clients can receive real-time updates when new notifications are created
-- =====================================================

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

COMMENT ON TABLE notifications IS 
  'In-app notifications. Realtime enabled for instant updates when new notifications are created.';
