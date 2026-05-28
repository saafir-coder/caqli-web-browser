import { DateTime, Effect, Option, Schema } from "effect";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/unstable/http";

import { SessionCredentialService } from "../auth/Services/SessionCredentialService.ts";
import { HostedControlPlane, HostedControlPlaneError } from "./Services/HostedControlPlane.ts";

const MagicLinkRequestBody = Schema.Struct({
  email: Schema.String,
  redirectTo: Schema.String,
});

const AccessCheckBody = Schema.Struct({
  email: Schema.String,
});

const CreateProjectBody = Schema.Struct({
  name: Schema.String,
});

const respondToHostedError = (error: HostedControlPlaneError) =>
  Effect.succeed(
    HttpServerResponse.jsonUnsafe(
      {
        error: error.message,
        ...(error.code ? { code: error.code } : {}),
      },
      { status: error.status ?? 500 },
    ),
  );

export const hostedHealthRouteLayer = HttpRouter.add(
  "GET",
  "/api/health",
  Effect.succeed(HttpServerResponse.jsonUnsafe({ ok: true }, { status: 200 })),
);

export const hostedAccessCheckRouteLayer = HttpRouter.add(
  "POST",
  "/api/hosted/access/check",
  Effect.gen(function* () {
    const controlPlane = yield* HostedControlPlane;
    const body = yield* HttpServerRequest.schemaBodyJson(AccessCheckBody).pipe(
      Effect.mapError(
        () =>
          new HostedControlPlaneError({
            message: "Invalid access check payload.",
            status: 400,
          }),
      ),
    );
    const decision = yield* controlPlane.checkAccess(body.email);
    return HttpServerResponse.jsonUnsafe(decision, { status: 200 });
  }).pipe(Effect.catchTag("HostedControlPlaneError", respondToHostedError)),
);

export const hostedMagicLinkRouteLayer = HttpRouter.add(
  "POST",
  "/api/hosted/auth/magic-link",
  Effect.gen(function* () {
    const controlPlane = yield* HostedControlPlane;
    const body = yield* HttpServerRequest.schemaBodyJson(MagicLinkRequestBody).pipe(
      Effect.mapError(
        () =>
          new HostedControlPlaneError({
            message: "Invalid magic link payload.",
            status: 400,
          }),
      ),
    );
    const result = yield* controlPlane.requestMagicLink({
      email: body.email,
      redirectTo: body.redirectTo,
    });
    return HttpServerResponse.jsonUnsafe(result, { status: 200 });
  }).pipe(Effect.catchTag("HostedControlPlaneError", respondToHostedError)),
);

export const hostedAuthCallbackRouteLayer = HttpRouter.add(
  "GET",
  "/api/hosted/auth/callback",
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const url = HttpServerRequest.toURL(request);
    if (Option.isNone(url)) {
      return yield* respondToHostedError(
        new HostedControlPlaneError({ message: "Bad Request", status: 400 }),
      );
    }

    const token = url.value.searchParams.get("token") ?? "";
    const controlPlane = yield* HostedControlPlane;
    const sessions = yield* SessionCredentialService;
    const result = yield* controlPlane.consumeMagicLink(token);

    return yield* HttpServerResponse.jsonUnsafe(
      {
        ok: true,
        user: result.user,
        expiresAt: DateTime.formatIso(result.expiresAt),
      },
      { status: 200 },
    ).pipe(
      HttpServerResponse.setCookie(sessions.cookieName, result.sessionToken, {
        expires: DateTime.toDate(result.expiresAt),
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      }),
    );
  }).pipe(Effect.catchTag("HostedControlPlaneError", respondToHostedError)),
);

export const hostedSessionRouteLayer = HttpRouter.add(
  "GET",
  "/api/hosted/session",
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const sessions = yield* SessionCredentialService;
    const controlPlane = yield* HostedControlPlane;
    const token = request.cookies[sessions.cookieName];
    const session = yield* controlPlane.getSessionForRequest(token);
    return HttpServerResponse.jsonUnsafe(session, { status: 200 });
  }).pipe(Effect.catchTag("HostedControlPlaneError", respondToHostedError)),
);

const requireHostedUser = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const sessions = yield* SessionCredentialService;
  const controlPlane = yield* HostedControlPlane;
  const session = yield* controlPlane.getSessionForRequest(request.cookies[sessions.cookieName]);
  if (!session.authenticated || !session.user) {
    return yield* new HostedControlPlaneError({
      message: "Unauthorized.",
      status: 401,
    });
  }
  return session.user;
});

export const hostedProjectsRouteLayer = HttpRouter.add(
  "GET",
  "/api/hosted/projects",
  Effect.gen(function* () {
    const user = yield* requireHostedUser;
    const controlPlane = yield* HostedControlPlane;
    const projects = yield* controlPlane.listProjects(user.id);
    return HttpServerResponse.jsonUnsafe({ projects }, { status: 200 });
  }).pipe(Effect.catchTag("HostedControlPlaneError", respondToHostedError)),
);

export const hostedCreateProjectRouteLayer = HttpRouter.add(
  "POST",
  "/api/hosted/projects",
  Effect.gen(function* () {
    const user = yield* requireHostedUser;
    const body = yield* HttpServerRequest.schemaBodyJson(CreateProjectBody).pipe(
      Effect.mapError(
        () =>
          new HostedControlPlaneError({
            message: "Invalid project payload.",
            status: 400,
          }),
      ),
    );
    const controlPlane = yield* HostedControlPlane;
    const project = yield* controlPlane.createProject({
      userId: user.id,
      name: body.name,
    });
    return HttpServerResponse.jsonUnsafe({ project }, { status: 201 });
  }).pipe(Effect.catchTag("HostedControlPlaneError", respondToHostedError)),
);

export const hostedRouteLayers = [
  hostedHealthRouteLayer,
  hostedAccessCheckRouteLayer,
  hostedMagicLinkRouteLayer,
  hostedAuthCallbackRouteLayer,
  hostedSessionRouteLayer,
  hostedProjectsRouteLayer,
  hostedCreateProjectRouteLayer,
] as const;
