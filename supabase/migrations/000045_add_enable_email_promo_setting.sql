-- Add show_email_in_promo column to email_settings
ALTER TABLE public.email_settings
ADD COLUMN IF NOT EXISTS show_email_in_promo BOOLEAN DEFAULT false;

-- Update the existing row to have the default value
UPDATE public.email_settings SET show_email_in_promo = false WHERE id = 1;
