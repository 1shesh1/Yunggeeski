-- One-time backfill support: mark which posts have had their view count fetched
-- via insights, so the resumable backfill job doesn't re-spend API calls on them.
-- Append-only: adds one column with a safe default.

alter table public.social_posts
  add column if not exists views_backfilled boolean default false not null;
