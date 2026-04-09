-- Add order_notes column to orders (optional field from checkout form).
-- Run this in the Supabase SQL Editor. Safe to run multiple times.

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_notes text;
