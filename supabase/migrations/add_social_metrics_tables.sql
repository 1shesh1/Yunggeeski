-- Live social-metrics cache for the /brands sponsor page.
-- Append-only: creates new tables only, no changes to existing schema.
--
-- The refresh job (app/api/cron/refresh-metrics) writes snapshots + posts from
-- the TikTok / Instagram APIs. The read service (lib/metrics/service.ts) reads
-- the latest snapshot per platform, applies any admin override, and otherwise
-- falls back to fixtures — so the page always renders.

-- Latest cached account-level metrics, one row per fetch per platform.
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

-- Per-post portfolio rows. Synced from the APIs and/or created manually by an
-- admin. `is_featured` + `sort_order` drive the six posts shown on /brands.
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
  fetched_at timestamptz
);

-- Unique so the refresh job can upsert on (platform, external_id). NULL
-- external_ids (manually-added posts) are treated as distinct by Postgres, so
-- multiple manual posts are still allowed.
create unique index if not exists social_posts_platform_external_idx
  on public.social_posts (platform, external_id);
create index if not exists social_posts_featured_idx
  on public.social_posts (is_featured, sort_order);

-- OAuth tokens, one row per platform. Service-role access only (never exposed
-- to the client). Refreshed by the cron job before expiry.
create table if not exists public.social_api_tokens (
  id uuid primary key default gen_random_uuid(),
  platform text unique not null check (platform in ('instagram', 'tiktok')),
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  updated_at timestamptz default now() not null
);

-- Single-row manual overrides for headline numbers. Any non-null column wins
-- over the computed snapshot value — the safety valve when a platform is down
-- or a figure can't be pulled via API.
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
