import { Context, Data, type DateTime } from "effect";
import type { Effect } from "effect";

import type { HostedAccessDecision } from "../accessAllowlist";

export interface HostedUser {
  readonly id: string;
  readonly email: string;
  readonly createdAt: string;
}

export interface HostedProject {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly workspacePath: string;
  readonly createdAt: string;
}

export interface HostedSessionView {
  readonly authenticated: boolean;
  readonly user?: HostedUser;
}

export interface MagicLinkRequestResult {
  readonly ok: true;
  readonly devMagicLink?: string;
}

export class HostedControlPlaneError extends Data.TaggedError("HostedControlPlaneError")<{
  readonly message: string;
  readonly status?: number;
  readonly code?: string;
  readonly cause?: unknown;
}> {}

export interface HostedControlPlaneShape {
  readonly checkAccess: (email: string) => Effect.Effect<HostedAccessDecision, HostedControlPlaneError>;
  readonly requestMagicLink: (input: {
    readonly email: string;
    readonly redirectTo: string;
  }) => Effect.Effect<MagicLinkRequestResult, HostedControlPlaneError>;
  readonly consumeMagicLink: (token: string) => Effect.Effect<
    {
      readonly user: HostedUser;
      readonly sessionToken: string;
      readonly expiresAt: DateTime.DateTime;
    },
    HostedControlPlaneError
  >;
  readonly getSessionForRequest: (
    sessionToken: string | undefined,
  ) => Effect.Effect<HostedSessionView, HostedControlPlaneError>;
  readonly listProjects: (userId: string) => Effect.Effect<ReadonlyArray<HostedProject>, HostedControlPlaneError>;
  readonly createProject: (input: {
    readonly userId: string;
    readonly name: string;
  }) => Effect.Effect<HostedProject, HostedControlPlaneError>;
}

export class HostedControlPlane extends Context.Service<
  HostedControlPlane,
  HostedControlPlaneShape
>()("t3/hosted/HostedControlPlane") {}
