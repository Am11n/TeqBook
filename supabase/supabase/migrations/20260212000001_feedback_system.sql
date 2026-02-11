-- =====================================================
-- Migration: Feedback System – Schema + Comments + Bucket
-- =====================================================
-- Extends feedback_entries with new columns, creates
-- feedback_comments for conversation threads, and
-- creates the feedback-attachments storage bucket.
-- =====================================================

-- =====================================================
-- 1. Update status taxonomy
-- =====================================================
ALTER TABLE feedback_entries DROP CONSTRAINT IF EXISTS feedback_entries_status_check;
ALTER TABLE feedback_entries ADD CONSTRAINT feedback_entries_status_check
  CHECK (status IN ('new', 'planned', 'in_progress', 'delivered', 'rejected'));

-- Migrate existing rows from old statuses
UPDATE feedback_entries SET status = 'new'         WHERE status IN ('open', 'under_review');
UPDATE feedback_entries SET status = 'delivered'    WHERE status = 'completed';
UPDATE feedback_entries SET status = 'rejected'     WHERE status = 'declined';
-- 'planned' and 'in_progress' remain unchanged

-- Set default to 'new' instead of 'open'
ALTER TABLE feedback_entries ALTER COLUMN status SET DEFAULT 'new';

-- =====================================================
-- 2. New columns on feedback_entries
-- =====================================================

-- Priority (set by RPC from salon plan)
ALTER TABLE feedback_entries ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'feedback_entries' AND constraint_name = 'feedback_entries_priority_check'
  ) THEN
    ALTER TABLE feedback_entries ADD CONSTRAINT feedback_entries_priority_check
      CHECK (priority IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- Admin owner (which admin is working on this)
ALTER TABLE feedback_entries ADD COLUMN IF NOT EXISTS admin_owner_id UUID REFERENCES auth.users(id);

-- Timestamp tracking
ALTER TABLE feedback_entries ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE feedback_entries ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Metadata JSONB (page_url, browser, timezone, locale, etc.)
ALTER TABLE feedback_entries ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Link to changelog entry (for "we delivered this" tracking)
ALTER TABLE feedback_entries ADD COLUMN IF NOT EXISTS changelog_entry_id UUID REFERENCES public.changelog_entries(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_salon_id ON feedback_entries(salon_id);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback_entries(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_admin_owner ON feedback_entries(admin_owner_id);

-- =====================================================
-- 3. Create feedback_comments table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feedback_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id     UUID NOT NULL REFERENCES public.feedback_entries(id) ON DELETE CASCADE,
  author_user_id  UUID NOT NULL REFERENCES auth.users(id),
  author_role     TEXT NOT NULL DEFAULT 'salon' CHECK (author_role IN ('salon', 'admin')),
  message         TEXT NOT NULL,
  is_internal     BOOLEAN NOT NULL DEFAULT false,
  attachments     JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

-- Indexes for feedback_comments
CREATE INDEX IF NOT EXISTS idx_fc_feedback_id ON feedback_comments(feedback_id);
CREATE INDEX IF NOT EXISTS idx_fc_author ON feedback_comments(author_user_id);
CREATE INDEX IF NOT EXISTS idx_fc_created ON feedback_comments(feedback_id, created_at);

COMMENT ON TABLE feedback_comments IS 'Threaded comments on feedback entries. is_internal=true means admin-only notes.';

-- =====================================================
-- 4. Create feedback-attachments storage bucket
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-attachments',
  'feedback-attachments',
  false,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
