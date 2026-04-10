create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('individual', 'broadcast')),
  recipient_to text not null,
  recipient_count integer not null default 1,
  subject text not null,
  template_id uuid references email_templates(id) on delete set null,
  template_name text,
  from_domain text,
  has_attachment boolean not null default false,
  attachment_name text,
  status text not null default 'success' check (status in ('success', 'failed')),
  error_message text,
  sent_at timestamptz not null default now()
);

alter table email_logs enable row level security;

create policy "Admin full access email_logs"
  on email_logs
  for all
  to authenticated
  using (public.get_user_role(auth.uid()) = 'admin');
