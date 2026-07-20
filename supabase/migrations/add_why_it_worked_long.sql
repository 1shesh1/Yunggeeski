-- Long-form "why it performed" analysis, shown in the /brands card modal.
-- `why_it_worked` stays the short hook rendered on the card overlay.
-- Append-only: adds one nullable column.

alter table public.social_posts
  add column if not exists why_it_worked_long text;
