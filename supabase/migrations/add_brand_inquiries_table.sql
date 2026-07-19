-- Brand campaign inquiries submitted from /brands ("Work With Yung Geeski").
-- Append-only: creates a new table, no changes to existing schema.

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
