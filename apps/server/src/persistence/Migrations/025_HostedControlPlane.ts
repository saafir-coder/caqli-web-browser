import * as Effect from "effect/Effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* sql`
    CREATE TABLE IF NOT EXISTS hosted_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    )
  `;

  yield* sql`
    CREATE TABLE IF NOT EXISTS hosted_magic_link_tokens (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      consumed_at TEXT
    )
  `;

  yield* sql`
    CREATE INDEX IF NOT EXISTS idx_hosted_magic_link_tokens_email
    ON hosted_magic_link_tokens(email)
  `;

  yield* sql`
    CREATE TABLE IF NOT EXISTS hosted_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      workspace_path TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, name)
    )
  `;

  yield* sql`
    CREATE INDEX IF NOT EXISTS idx_hosted_projects_user_id
    ON hosted_projects(user_id)
  `;
});
