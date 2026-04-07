CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access app_settings" ON public.app_settings;
CREATE POLICY "Admins full access app_settings" ON public.app_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true)
    );

INSERT INTO public.app_settings (key, value) VALUES
    ('ticktick_access_token', NULL),
    ('ticktick_refresh_token', NULL),
    ('ticktick_token_expires_at', NULL),
    ('ticktick_project_id', NULL),
    ('ticktick_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
