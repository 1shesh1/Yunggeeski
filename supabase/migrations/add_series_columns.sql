-- Add separate columns for each series slot (up to 5). Each series has value, color, image_url.
-- Run this in the Supabase SQL Editor. Safe to run multiple times (IF NOT EXISTS).

-- Series 1
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_1_value text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_1_color text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_1_image_url text;
-- Series 2
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_2_value text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_2_color text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_2_image_url text;
-- Series 3
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_3_value text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_3_color text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_3_image_url text;
-- Series 4
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_4_value text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_4_color text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_4_image_url text;
-- Series 5
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_5_value text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_5_color text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS series_5_image_url text;

-- Backfill from existing series jsonb (array of { value, color, image_url })
UPDATE public.orders
SET
  series_1_value     = series->0->>'value',
  series_1_color     = series->0->>'color',
  series_1_image_url = series->0->>'image_url',
  series_2_value     = series->1->>'value',
  series_2_color     = series->1->>'color',
  series_2_image_url = series->1->>'image_url',
  series_3_value     = series->2->>'value',
  series_3_color     = series->2->>'color',
  series_3_image_url = series->2->>'image_url',
  series_4_value     = series->3->>'value',
  series_4_color     = series->3->>'color',
  series_4_image_url = series->3->>'image_url',
  series_5_value     = series->4->>'value',
  series_5_color     = series->4->>'color',
  series_5_image_url = series->4->>'image_url'
WHERE series IS NOT NULL AND jsonb_typeof(series) = 'array';
