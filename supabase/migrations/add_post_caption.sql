-- Store the post's own caption (Instagram `caption`, TikTok `title`).
-- Free in the media list — no extra API calls. Used to identify posts in the
-- admin list, and as the /brands overlay text when no curated "why it worked"
-- copy has been written yet.
-- Append-only: adds one nullable column.

alter table public.social_posts
  add column if not exists caption text;
