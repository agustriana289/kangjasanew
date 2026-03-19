create table if not exists user_presence (
  session_id text primary key,
  user_id uuid references users(id) on delete set null,
  last_seen timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_presence enable row level security;

create policy "Anyone can upsert presence"
  on user_presence for all
  using (true)
  with check (true);

create or replace function cleanup_old_presence()
returns void language plpgsql as $$
begin
  delete from user_presence where last_seen < now() - interval '5 minutes';
end;
$$;
