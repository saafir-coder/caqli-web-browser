-- Hosted control plane (Postgres on Caqli VPS)
-- Apply with your migration runner against DATABASE_URL (not SQLite dev DB).

CREATE TABLE IF NOT EXISTS hosted_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hosted_magic_link_tokens (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS hosted_magic_link_tokens_email_idx
  ON hosted_magic_link_tokens (email);

CREATE TABLE IF NOT EXISTS hosted_projects (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES hosted_users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  workspace_path TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS hosted_projects_user_id_idx ON hosted_projects (user_id);
