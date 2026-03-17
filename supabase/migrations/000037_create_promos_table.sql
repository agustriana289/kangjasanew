create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  promo_code text,
  order_link text,
  expired_at timestamptz,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.promos enable row level security;

create policy "Public can read published promos"
  on public.promos
  for select
  using (is_published = true);

create policy "Admin can manage promos"
  on public.promos
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.is_admin = true
    )
  );
