-- Users extended profile (Supabase auth.users already exists)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text,
  country text default 'Somalia',
  source text, -- how they heard about it
  want_to_build text, -- what they want to build
  tier text default 'free' check (tier in ('free', 'paid')),
  created_at timestamptz default now()
);

-- Credits table
create table public.credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  balance integer default 0,
  total_purchased integer default 0,
  updated_at timestamptz default now()
);

-- Messages table (for history + analytics)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text not null,
  model_used text not null,
  tier text check (tier in ('free', 'paid')),
  created_at timestamptz default now()
);

-- Daily usage tracking (free tier limit)
create table public.daily_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date default current_date,
  message_count integer default 0,
  unique(user_id, date)
);

-- Waitlist (for people who hit the limit)
create table public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  country text,
  want_to_build text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.credits (user_id, balance)
  values (new.id, 0);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS policies
alter table public.profiles enable row level security;
alter table public.credits enable row level security;
alter table public.messages enable row level security;
alter table public.daily_usage enable row level security;

create policy "Users see own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users see own credits" on public.credits
  for select using (auth.uid() = user_id);

create policy "Users see own messages" on public.messages
  for select using (auth.uid() = user_id);

create policy "Users see own usage" on public.daily_usage
  for select using (auth.uid() = user_id);
