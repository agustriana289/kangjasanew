-- ============================================================
-- 000029_add_link_generated_at_to_orders.sql
-- Tracking when testimonial link was generated for expiry logic
-- ============================================================

ALTER TABLE public.store_orders ADD COLUMN IF NOT EXISTS testimonial_link_generated_at TIMESTAMPTZ;
