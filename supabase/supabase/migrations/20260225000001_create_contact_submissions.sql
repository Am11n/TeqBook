-- =====================================================
-- Contact submissions from public marketing site
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  email TEXT NOT NULL CHECK (char_length(email) <= 200),
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 2000),
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions (created_at DESC);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anonymous can insert contact submissions" ON contact_submissions;
CREATE POLICY "Anonymous can insert contact submissions"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (consent = true);

DROP POLICY IF EXISTS "Authenticated can insert contact submissions" ON contact_submissions;
CREATE POLICY "Authenticated can insert contact submissions"
  ON contact_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (consent = true);

COMMENT ON TABLE contact_submissions IS 'Public contact form submissions from the marketing site.';
