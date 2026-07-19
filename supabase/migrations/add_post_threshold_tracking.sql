-- High-water-mark tracking for the "videos above threshold" count.
-- Append-only: adds one column with a safe default.
--
-- When an admin sets the videos-above-threshold override (a baseline count),
-- all posts currently over the threshold are marked counted (already baked into
-- the baseline). The refresh job then increments the override by each NEWLY-seen
-- post that crosses the threshold, without double-counting the existing catalog.

alter table public.social_posts
  add column if not exists counted_over_threshold boolean default false not null;
