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

-- Optional: RLS policies (enable if you use RLS)
-- alter table public.orders enable row level security;
-- create policy "Service role can do everything" on public.orders for all using (true);

-- Storage bucket for order assets (create in Supabase Dashboard > Storage or via API)
-- Bucket name: order-assets
-- Path for uploads: {orderId}/logo.{ext}
