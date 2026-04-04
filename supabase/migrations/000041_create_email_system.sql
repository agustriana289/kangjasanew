CREATE TABLE IF NOT EXISTS public.email_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    gmail_address TEXT,
    gmail_app_password_encrypted TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT email_settings_single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS public.email_domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain TEXT NOT NULL,
    display_name TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to email_settings" ON public.email_settings;
CREATE POLICY "Admins have full access to email_settings" ON public.email_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true)
);

DROP POLICY IF EXISTS "Admins have full access to email_domains" ON public.email_domains;
CREATE POLICY "Admins have full access to email_domains" ON public.email_domains FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true)
);

DROP POLICY IF EXISTS "Admins have full access to email_templates" ON public.email_templates;
CREATE POLICY "Admins have full access to email_templates" ON public.email_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true)
);

INSERT INTO public.email_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
