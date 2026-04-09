-- Add show_subscriber_email column to promos table
ALTER TABLE public.promos
ADD COLUMN IF NOT EXISTS show_subscriber_email BOOLEAN DEFAULT false;
