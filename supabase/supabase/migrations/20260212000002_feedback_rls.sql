-- =====================================================
-- Migration: Feedback System – RLS Policies
-- =====================================================
-- 1. feedback_entries: salon owner SELECT own, UPDATE own when new
-- 2. feedback_comments: salon owner read/write non-internal on own
-- 3. feedback-attachments: storage RLS
-- =====================================================

-- =====================================================
-- 1. RLS policies for feedback_entries
-- =====================================================
-- Note: superadmins already have full access via "superadmins_feedback" policy

-- Salon owners can read their own feedback entries
CREATE POLICY "Salon owners can read own feedback"
  ON feedback_entries
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.salon_id = feedback_entries.salon_id
        AND p.role = 'owner'
    )
  );

-- Salon owners can update their own feedback only when status is still 'new'
CREATE POLICY "Salon owners can update own feedback when new"
  ON feedback_entries
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND status = 'new'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'new'
  );

-- No direct INSERT policy — all inserts go through the RPC
-- No DELETE for salon owners — only superadmins can delete

-- =====================================================
-- 2. RLS policies for feedback_comments
-- =====================================================

-- Superadmins can read all comments (including internal notes)
CREATE POLICY "Superadmins can read all feedback comments"
  ON feedback_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- Superadmins can insert any comment (including internal notes)
CREATE POLICY "Superadmins can insert feedback comments"
  ON feedback_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- Salon owners can read non-internal comments on their own feedback entries
CREATE POLICY "Salon owners can read public feedback comments"
  ON feedback_comments
  FOR SELECT
  USING (
    is_internal = false
    AND EXISTS (
      SELECT 1 FROM feedback_entries fe
      WHERE fe.id = feedback_comments.feedback_id
        AND (
          fe.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
              AND p.salon_id = fe.salon_id
              AND p.role = 'owner'
          )
        )
    )
  );

-- Salon owners can insert non-internal comments on their own feedback entries
CREATE POLICY "Salon owners can reply to own feedback"
  ON feedback_comments
  FOR INSERT
  WITH CHECK (
    is_internal = false
    AND author_user_id = auth.uid()
    AND author_role = 'salon'
    AND EXISTS (
      SELECT 1 FROM feedback_entries fe
      WHERE fe.id = feedback_comments.feedback_id
        AND (
          fe.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
              AND p.salon_id = fe.salon_id
              AND p.role = 'owner'
          )
        )
    )
  );

-- No deletes on feedback comments
CREATE POLICY "No deletes on feedback comments"
  ON feedback_comments
  FOR DELETE
  USING (false);

-- =====================================================
-- 3. Storage RLS for feedback-attachments
-- =====================================================

-- Salon owners can upload to their salon's folder
DROP POLICY IF EXISTS "Salon owners can upload feedback attachments" ON storage.objects;
CREATE POLICY "Salon owners can upload feedback attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'feedback-attachments'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id::text = (storage.foldername(name))[1]
      AND p.role = 'owner'
  )
);

-- Salon owners can read their own salon's attachments; superadmins can read all
DROP POLICY IF EXISTS "Read feedback attachments" ON storage.objects;
CREATE POLICY "Read feedback attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'feedback-attachments'
  AND (
    -- Superadmins can read all
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
    OR
    -- Salon owners can read their salon's files
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.salon_id::text = (storage.foldername(name))[1]
        AND p.role = 'owner'
    )
  )
);
