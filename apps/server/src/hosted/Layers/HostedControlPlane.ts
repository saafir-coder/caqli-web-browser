import { DateTime, Duration, Effect, Layer } from "effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import { createHash, randomBytes } from "node:crypto";

import { ServerConfig } from "../../config.ts";
import { SessionCredentialService } from "../../auth/Services/SessionCredentialService.ts";
import {
  decideHostedAccess,
  normalizeHostedEmail,
  type HostedAccessMode,
} from "../accessAllowlist.ts";
import { provisionWorkspacePath } from "../poolWorkspace.ts";
import {
  HostedControlPlane,
  HostedControlPlaneError,
  type HostedControlPlaneShape,
  type HostedProject,
  type HostedUser,
} from "../Services/HostedControlPlane.ts";

const MAGIC_LINK_TTL = Duration.minutes(15);

type HostedUserRow = {
  readonly id: string;
  readonly email: string;
  readonly created_at: string;
};

type HostedProjectRow = {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly workspace_path: string;
  readonly created_at: string;
};

function toUser(row: HostedUserRow): HostedUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
  };
}

function toProject(row: HostedProjectRow): HostedProject {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    workspacePath: row.workspace_path,
    createdAt: row.created_at,
  };
}

function hashMagicLinkToken(secret: string, token: string): string {
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

function appendTokenToRedirect(redirectTo: string, token: string): string {
  const url = new URL(redirectTo);
  url.searchParams.set("token", token);
  return url.toString();
}

export const makeHostedControlPlane = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const config = yield* ServerConfig;
  const sessions = yield* SessionCredentialService;
  const hosted = config.hosted;

  if (!hosted.enabled) {
    return HostedControlPlane.of({
      checkAccess: () =>
        Effect.fail(
          new HostedControlPlaneError({
            message: "Hosted control plane is not enabled.",
            status: 503,
          }),
        ),
      requestMagicLink: () =>
        Effect.fail(
          new HostedControlPlaneError({
            message: "Hosted control plane is not enabled.",
            status: 503,
          }),
        ),
      consumeMagicLink: () =>
        Effect.fail(
          new HostedControlPlaneError({
            message: "Hosted control plane is not enabled.",
            status: 503,
          }),
        ),
      getSessionForRequest: () => Effect.succeed({ authenticated: false }),
      listProjects: () =>
        Effect.fail(
          new HostedControlPlaneError({
            message: "Hosted control plane is not enabled.",
            status: 503,
          }),
        ),
      createProject: () =>
        Effect.fail(
          new HostedControlPlaneError({
            message: "Hosted control plane is not enabled.",
            status: 503,
          }),
        ),
    } satisfies HostedControlPlaneShape);
  }

  const accessMode = hosted.accessMode satisfies HostedAccessMode;
  const allowlist = hosted.allowlistEmails;
  const magicLinkSecret = hosted.magicLinkSecret;

  const checkAccess = (email: string) =>
    Effect.sync(() => decideHostedAccess(email, allowlist, accessMode));

  const upsertUserByEmail = (email: string) =>
    Effect.gen(function* () {
      const normalized = normalizeHostedEmail(email);
      const existing = yield* sql<HostedUserRow>`
        SELECT id, email, created_at
        FROM hosted_users
        WHERE email = ${normalized}
        LIMIT 1
      `.pipe(Effect.map((rows) => rows[0]));

      if (existing) {
        return toUser(existing);
      }

      const id = crypto.randomUUID();
      const createdAt = DateTime.formatIso(yield* DateTime.now);
      yield* sql`
        INSERT INTO hosted_users (id, email, created_at)
        VALUES (${id}, ${normalized}, ${createdAt})
      `;
      return { id, email: normalized, createdAt } satisfies HostedUser;
    }).pipe(
      Effect.mapError(
        (cause) =>
          new HostedControlPlaneError({
            message: "Failed to persist hosted user.",
            status: 500,
            cause,
          }),
      ),
    );

  const requestMagicLink: HostedControlPlaneShape["requestMagicLink"] = ({ email, redirectTo }) =>
    Effect.gen(function* () {
      const decision = decideHostedAccess(email, allowlist, accessMode);
      if (!decision.allowed) {
        return yield* new HostedControlPlaneError({
          message:
            decision.reason === "not_on_allowlist"
              ? "This email is not on the dogfood access list."
              : "Invite-only access during dogfood.",
          status: 403,
          ...(decision.reason ? { code: decision.reason } : {}),
        });
      }

      const normalized = normalizeHostedEmail(email);
      const rawToken = randomBytes(32).toString("base64url");
      const tokenHash = hashMagicLinkToken(magicLinkSecret, rawToken);
      const issuedAt = yield* DateTime.now;
      const expiresAt = DateTime.formatIso(
        DateTime.add(issuedAt, { milliseconds: Duration.toMillis(MAGIC_LINK_TTL) }),
      );

      yield* sql`
        INSERT INTO hosted_magic_link_tokens (token_hash, email, expires_at, consumed_at)
        VALUES (${tokenHash}, ${normalized}, ${expiresAt}, NULL)
      `;

      const magicLink = appendTokenToRedirect(redirectTo, rawToken);
      if (hosted.magicLinkDevExpose) {
        yield* Effect.logInfo("Hosted magic link (dev expose)", { email: normalized, magicLink });
        return { ok: true as const, devMagicLink: magicLink };
      }

      yield* Effect.logInfo("Hosted magic link issued", { email: normalized });
      return { ok: true as const };
    }).pipe(
      Effect.mapError((error) =>
        error instanceof HostedControlPlaneError
          ? error
          : new HostedControlPlaneError({
              message: "Failed to issue magic link.",
              status: 500,
              cause: error,
            }),
      ),
    );

  const consumeMagicLink: HostedControlPlaneShape["consumeMagicLink"] = (token) =>
    Effect.gen(function* () {
      const trimmed = token.trim();
      if (!trimmed) {
        return yield* new HostedControlPlaneError({
          message: "Missing magic link token.",
          status: 400,
        });
      }

      const tokenHash = hashMagicLinkToken(magicLinkSecret, trimmed);
      const nowIso = DateTime.formatIso(yield* DateTime.now);
      const row = yield* sql<{
        readonly email: string;
        readonly expires_at: string;
        readonly consumed_at: string | null;
      }>`
        SELECT email, expires_at, consumed_at
        FROM hosted_magic_link_tokens
        WHERE token_hash = ${tokenHash}
        LIMIT 1
      `.pipe(Effect.map((rows) => rows[0]));

      if (!row) {
        return yield* new HostedControlPlaneError({
          message: "Invalid or expired magic link.",
          status: 401,
        });
      }
      if (row.consumed_at) {
        return yield* new HostedControlPlaneError({
          message: "Magic link was already used.",
          status: 401,
        });
      }
      if (row.expires_at <= nowIso) {
        return yield* new HostedControlPlaneError({
          message: "Magic link expired. Request a new one.",
          status: 401,
        });
      }

      yield* sql`
        UPDATE hosted_magic_link_tokens
        SET consumed_at = ${nowIso}
        WHERE token_hash = ${tokenHash}
      `;

      const user = yield* upsertUserByEmail(row.email);
      const issued = yield* sessions.issue({
        subject: user.id,
        method: "browser-session-cookie",
        role: "owner",
        client: {
          deviceType: "unknown",
          label: user.email,
        },
      });

      return {
        user,
        sessionToken: issued.token,
        expiresAt: issued.expiresAt,
      };
    }).pipe(
      Effect.mapError((error) =>
        error instanceof HostedControlPlaneError
          ? error
          : new HostedControlPlaneError({
              message: "Failed to complete sign-in.",
              status: 500,
              cause: error,
            }),
      ),
    );

  const getSessionForRequest: HostedControlPlaneShape["getSessionForRequest"] = (sessionToken) =>
    Effect.gen(function* () {
      if (!sessionToken?.trim()) {
        return { authenticated: false };
      }

      const verified = yield* sessions.verify(sessionToken).pipe(Effect.option);
      if (verified._tag === "None") {
        return { authenticated: false };
      }

      const userRow = yield* sql<HostedUserRow>`
        SELECT id, email, created_at
        FROM hosted_users
        WHERE id = ${verified.value.subject}
        LIMIT 1
      `.pipe(Effect.map((rows) => rows[0]));

      if (!userRow) {
        return { authenticated: false };
      }

      return {
        authenticated: true,
        user: toUser(userRow),
      };
    }).pipe(
      Effect.mapError(
        (cause) =>
          new HostedControlPlaneError({
            message: "Failed to load hosted session.",
            status: 500,
            cause,
          }),
      ),
    );

  const listProjects: HostedControlPlaneShape["listProjects"] = (userId) =>
    sql<HostedProjectRow>`
      SELECT id, user_id, name, workspace_path, created_at
      FROM hosted_projects
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `.pipe(
      Effect.map((rows) => rows.map(toProject)),
      Effect.mapError(
        (cause) =>
          new HostedControlPlaneError({
            message: "Failed to list hosted projects.",
            status: 500,
            cause,
          }),
      ),
    );

  const createProject: HostedControlPlaneShape["createProject"] = ({ userId, name }) =>
    Effect.gen(function* () {
      const trimmed = name.trim();
      if (!trimmed) {
        return yield* new HostedControlPlaneError({
          message: "Project name is required.",
          status: 400,
        });
      }

      const existing = yield* sql<HostedProjectRow>`
        SELECT id, user_id, name, workspace_path, created_at
        FROM hosted_projects
        WHERE user_id = ${userId} AND name = ${trimmed}
        LIMIT 1
      `.pipe(Effect.map((rows) => rows[0]));

      if (existing) {
        return toProject(existing);
      }

      const projectId = crypto.randomUUID();
      const workspacePath = provisionWorkspacePath(userId, projectId);
      const createdAt = DateTime.formatIso(yield* DateTime.now);

      const optimistic = {
        id: projectId,
        userId,
        name: trimmed,
        workspacePath,
        createdAt,
      } satisfies HostedProject;

      const inserted = yield* sql`
        INSERT INTO hosted_projects (id, user_id, name, workspace_path, created_at)
        VALUES (${projectId}, ${userId}, ${trimmed}, ${workspacePath}, ${createdAt})
      `.pipe(
        Effect.as(optimistic),
        Effect.catch(() =>
          sql<HostedProjectRow>`
            SELECT id, user_id, name, workspace_path, created_at
            FROM hosted_projects
            WHERE workspace_path = ${workspacePath}
               OR (user_id = ${userId} AND name = ${trimmed})
            LIMIT 1
          `.pipe(
            Effect.flatMap((rows) => {
              const row = rows[0];
              if (!row) {
                return Effect.fail(
                  new HostedControlPlaneError({
                    message: "Could not create hosted project.",
                    status: 500,
                  }),
                );
              }
              return Effect.succeed(toProject(row));
            }),
          ),
        ),
      );

      return inserted;
    }).pipe(
      Effect.mapError((error) =>
        error instanceof HostedControlPlaneError
          ? error
          : new HostedControlPlaneError({
              message: "Failed to create hosted project.",
              status: 500,
              cause: error,
            }),
      ),
    );

  return HostedControlPlane.of({
    checkAccess,
    requestMagicLink,
    consumeMagicLink,
    getSessionForRequest,
    listProjects,
    createProject,
  } satisfies HostedControlPlaneShape);
});

export const HostedControlPlaneLive = Layer.effect(HostedControlPlane, makeHostedControlPlane);
