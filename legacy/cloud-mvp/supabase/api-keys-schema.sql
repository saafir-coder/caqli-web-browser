-- API keys table for Continue.dev proxy
create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  key text unique not null,
  name text default 'Default',
  is_active boolean default true,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

-- Usage log for tracking per-request costs
create table public.usage_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  api_key_id uuid references public.api_keys(id) on delete cascade,
  model text not null,
  input_tokens integer default 0,
  output_tokens integer default 0,
  cost_credits numeric(10,4) default 0,
  created_at timestamptz default now()
);

-- Auto-generate API key on signup
create or replace function public.generate_api_key()
returns trigger as $$
begin
  insert into public.api_keys (user_id, key, name)
  values (new.id, 'caqli_' || encode(gen_random_bytes(24), 'hex'), 'Default');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_user_created_generate_key
  after insert on public.profiles
  for each row execute function public.generate_api_key();

-- RLS
alter table public.api_keys enable row level security;
alter table public.usage_log enable row level security;

create policy "Users see own keys" on public.api_keys
  for select using (auth.uid() = user_id);

create policy "Users see own usage" on public.usage_log
  for select using (auth.uid() = user_id);

-- Index for fast key lookup on every proxy request
create index idx_api_keys_key on public.api_keys(key);
create index idx_usage_log_user on public.usage_log(user_id, created_at desc);
