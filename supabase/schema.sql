-- Orders table for Data-Driven Financial Charts
-- Run this in your Supabase SQL editor to create the schema.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  tier text not null,
  addons jsonb,
  amount_total int not null,
  currency text default 'usd' not null,
  customer_email text,
  stripe_session_id text unique,
  stripe_payment_intent text,
  payment_status text default 'unpaid' not null,
  order_status text default 'awaiting_form' not null,
  scope_locked bool default false not null,
  form_data jsonb,
  logo_url text,
  resolution text,
  delivery_png_url text,
  delivery_csv_url text
);

-- Course purchases (workflow / digital tiers). Chart orders stay in `orders`.
create table if not exists public.course_purchases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  customer_email text not null,
  course_tier text not null check (course_tier in ('tier1', 'tier2', 'tier3')),
  stripe_session_id text not null unique,
  amount_total int not null default 0,
  currency text default 'usd' not null,
  payment_status text default 'paid' not null
);

create index if not exists course_purchases_customer_email_idx
  on public.course_purchases (customer_email);

-- Brand campaign inquiries submitted from /brands ("Work With Yung Geeski").
create table if not exists public.brand_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  status text default 'new' not null,
  name text not null,
  company text not null,
  work_email text not null,
  company_website text not null,
  product_or_service text not null,
  campaign_objective text not null,
  budget text not null,
  launch_date text not null,
  deliverables text not null,
  paid_ads_required boolean default false not null,
  category_exclusivity_required boolean default false not null,
  additional_info text
);

create index if not exists brand_inquiries_created_at_idx
  on public.brand_inquiries (created_at desc);

-- Live social-metrics cache for /brands (see migrations/add_social_metrics_tables.sql).
create table if not exists public.social_metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  platform text not null check (platform in ('instagram', 'tiktok')),
  followers int default 0 not null,
  reach_30d int,
  reach_90d int,
  best_video_views int,
  videos_above_threshold int,
  notable_views_threshold int,
  raw jsonb
);

create index if not exists social_metrics_snapshots_platform_created_idx
  on public.social_metrics_snapshots (platform, created_at desc);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  platform text not null check (platform in ('instagram', 'tiktok', 'cross')),
  external_id text,
  permalink text,
  thumbnail_url text,
  topic text default '' not null,
  why_it_worked text default '' not null,
  views int default 0 not null,
  likes int default 0 not null,
  comments int default 0 not null,
  shares int,
  saves int,
  is_featured boolean default false not null,
  sort_order int default 0 not null,
  fetched_at timestamptz,
  counted_over_threshold boolean default false not null,
  views_backfilled boolean default false not null
);

create unique index if not exists social_posts_platform_external_idx
  on public.social_posts (platform, external_id);
create index if not exists social_posts_featured_idx
  on public.social_posts (is_featured, sort_order);

create table if not exists public.social_api_tokens (
  id uuid primary key default gen_random_uuid(),
  platform text unique not null check (platform in ('instagram', 'tiktok')),
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  updated_at timestamptz default now() not null
);

create table if not exists public.social_metric_overrides (
  id text primary key default 'singleton',
  total_followers int,
  best_video_views int,
  videos_above_threshold int,
  notable_views_threshold int,
  monthly_reach int,
  category text,
  updated_at timestamptz default now() not null
);

-- Optional: RLS policies (enable if you use RLS)
-- alter table public.orders enable row level security;
-- create policy "Service role can do everything" on public.orders for all using (true);

-- Storage bucket for order assets (create in Supabase Dashboard > Storage or via API)
-- Bucket name: order-assets
-- Path for uploads: {orderId}/logo.{ext}
