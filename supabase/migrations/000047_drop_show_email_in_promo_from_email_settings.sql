-- Revert: Drop the incorrect show_email_in_promo column from email_settings
ALTER TABLE public.email_settings
DROP COLUMN IF EXISTS show_email_in_promo;
