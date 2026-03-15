-- Additional public social links for salon profile
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

COMMENT ON COLUMN public.salons.facebook_url IS 'Public Facebook URL for salon profile page.';
COMMENT ON COLUMN public.salons.twitter_url IS 'Public X/Twitter URL for salon profile page.';
COMMENT ON COLUMN public.salons.tiktok_url IS 'Public TikTok URL for salon profile page.';
