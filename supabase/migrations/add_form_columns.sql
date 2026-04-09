-- Add separate columns for form data (so it's not all in one jsonb cell).
-- Run this in the Supabase SQL Editor. Safe to run multiple times (uses IF NOT EXISTS).

-- Add new columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS chart_title text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS date_start text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS date_end text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS units text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS background_color text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS logo_placement text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS concept_description text;

-- Backfill from existing form_data (logo_url column already exists)
UPDATE public.orders
SET
  chart_title       = form_data->>'chart_title',
  series           = form_data->'series',
  date_start       = form_data->>'date_start',
  date_end         = form_data->>'date_end',
  units            = form_data->>'units',
  currency_code    = form_data->>'currency_code',
  background_color = form_data->>'background_color',
  logo_placement   = form_data->>'logo_placement',
  concept_description = form_data->>'concept_description',
  logo_url         = COALESCE(form_data->>'logo_url', logo_url)
WHERE form_data IS NOT NULL;
