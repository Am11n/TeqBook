-- =====================================================
-- Add SUPPORT feature to features table
-- =====================================================

INSERT INTO features (key, name, description)
VALUES ('SUPPORT', 'Support', 'Access to the support portal for creating and managing support cases')
ON CONFLICT (key) DO NOTHING;
