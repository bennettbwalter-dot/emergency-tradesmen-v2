-- Platform-specific creative and schedule fields for approval-first publishing.

ALTER TABLE public.social_publications
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS content_format text NOT NULL DEFAULT 'image'
    CHECK (content_format IN ('image', 'carousel', 'reel', 'video')),
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS schedule_timezone text NOT NULL DEFAULT 'Europe/London';

ALTER TABLE public.social_publications
  DROP CONSTRAINT IF EXISTS social_publications_scheduled_at_check;

ALTER TABLE public.social_publications
  ADD CONSTRAINT social_publications_scheduled_at_check
  CHECK (status <> 'scheduled' OR scheduled_at IS NOT NULL);

CREATE INDEX IF NOT EXISTS social_publications_schedule_idx
  ON public.social_publications (status, scheduled_at)
  WHERE scheduled_at IS NOT NULL;
