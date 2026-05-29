-- Hosted control plane: project ↔ pool workspace mapping (issue 014)

create table public.hosted_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  workspace_path text not null,
  created_at timestamptz not null default now(),
  constraint hosted_projects_workspace_path_key unique (workspace_path),
  constraint hosted_projects_user_id_name_key unique (user_id, name)
);

create index hosted_projects_user_id_idx on public.hosted_projects (user_id);

alter table public.hosted_projects enable row level security;

create policy "hosted_projects_select_own"
  on public.hosted_projects
  for select
  using (auth.uid() = user_id);

create policy "hosted_projects_insert_own"
  on public.hosted_projects
  for insert
  with check (auth.uid() = user_id);

create policy "hosted_projects_update_own"
  on public.hosted_projects
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "hosted_projects_delete_own"
  on public.hosted_projects
  for delete
  using (auth.uid() = user_id);
