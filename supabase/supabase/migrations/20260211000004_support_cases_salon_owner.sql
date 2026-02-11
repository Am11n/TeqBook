-- =====================================================
-- Support Cases: Salon Owner Access
-- =====================================================
-- Extends support_cases for salon owner submissions:
-- 1. Add 'salon_request' to type CHECK
-- 2. Add 'waiting_on_salon' to status CHECK
-- 3. Add 'category' column
-- 4. Add RLS policies for salon owners (strict: user_id or salon owner)
-- 5. Create support_case_messages table with RLS
-- 6. Create support-attachments storage bucket
-- =====================================================

-- =====================================================
-- 1. Extend type CHECK to include salon_request
-- =====================================================
ALTER TABLE support_cases DROP CONSTRAINT IF EXISTS support_cases_type_check;
ALTER TABLE support_cases ADD CONSTRAINT support_cases_type_check
  CHECK (type IN (
    'onboarding_stuck', 'payment_issue', 'login_problems',
    'booking_errors', 'high_cancellation', 'audit_spike',
    'manual', 'salon_request'
  ));

-- =====================================================
-- 2. Extend status CHECK to include waiting_on_salon
-- =====================================================
ALTER TABLE support_cases DROP CONSTRAINT IF EXISTS support_cases_status_check;
ALTER TABLE support_cases ADD CONSTRAINT support_cases_status_check
  CHECK (status IN (
    'open', 'in_progress', 'waiting_on_salon', 'resolved', 'closed'
  ));

-- =====================================================
-- 3. Add category column
-- =====================================================
ALTER TABLE support_cases ADD COLUMN IF NOT EXISTS category TEXT;
COMMENT ON COLUMN support_cases.category IS 'Topic category: general, booking_issue, payment_issue, account_issue, feature_request, other';

-- =====================================================
-- 4. RLS policies for salon owners on support_cases
-- =====================================================

-- SELECT: salon owner can read cases they created OR cases for their salon if they are the owner
CREATE POLICY "Salon owners can read own support cases"
  ON support_cases
  FOR SELECT
  USING (
    -- Case was created by this user
    user_id = auth.uid()
    OR
    -- User is the owner of the salon linked to this case
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.salon_id = support_cases.salon_id
        AND p.role = 'owner'
    )
  );

-- No direct INSERT policy for salon owners -- they go through the RPC
-- No direct UPDATE policy for salon owners -- only admins change status

-- =====================================================
-- 5. Create support_case_messages table
-- =====================================================
CREATE TABLE IF NOT EXISTS support_case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scm_case_id ON support_case_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_scm_sender_id ON support_case_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_scm_created_at ON support_case_messages(case_id, created_at);

-- RLS
ALTER TABLE support_case_messages ENABLE ROW LEVEL SECURITY;

-- Superadmins can read all messages (including internal)
CREATE POLICY "Superadmins can read all case messages"
  ON support_case_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- Superadmins can insert any message (including internal notes)
CREATE POLICY "Superadmins can insert case messages"
  ON support_case_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- Salon owners can read non-internal messages on their own cases
CREATE POLICY "Salon owners can read public case messages"
  ON support_case_messages
  FOR SELECT
  USING (
    is_internal = false
    AND EXISTS (
      SELECT 1 FROM support_cases sc
      WHERE sc.id = support_case_messages.case_id
        AND (
          sc.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
              AND p.salon_id = sc.salon_id
              AND p.role = 'owner'
          )
        )
    )
  );

-- Salon owners can insert non-internal messages on their own cases
CREATE POLICY "Salon owners can reply to own cases"
  ON support_case_messages
  FOR INSERT
  WITH CHECK (
    is_internal = false
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM support_cases sc
      WHERE sc.id = support_case_messages.case_id
        AND (
          sc.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
              AND p.salon_id = sc.salon_id
              AND p.role = 'owner'
          )
        )
    )
  );

-- No deletes on messages
CREATE POLICY "No deletes on case messages"
  ON support_case_messages
  FOR DELETE
  USING (false);

-- =====================================================
-- 6. Create support-attachments storage bucket
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-attachments',
  'support-attachments',
  false,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: salon owners can upload to their salon's folder
DROP POLICY IF EXISTS "Salon owners can upload support attachments" ON storage.objects;
CREATE POLICY "Salon owners can upload support attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id::text = (storage.foldername(name))[1]
      AND p.role = 'owner'
  )
);

-- Salon owners can read their own salon's attachments
DROP POLICY IF EXISTS "Salon owners can read own support attachments" ON storage.objects;
CREATE POLICY "Salon owners can read own support attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments'
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

-- Comments
COMMENT ON TABLE support_case_messages IS 'Threaded messages on support cases. is_internal=true means admin-only notes.';
