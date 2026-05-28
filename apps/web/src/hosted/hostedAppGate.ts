import { assertSessionMayEnterApp } from "./checkHostedAccess";
import {
  isHostedAuthConfigured,
  isHostedControlPlaneConfigured,
  isSupabaseHostedAuthConfigured,
} from "./config";
import { getHostedSession, signOutHostedSession } from "./hostedClient";
import { readHostedCodexConnected } from "./hostedCodexConnection";
import { readHostedProfileComplete } from "./onboardingStorage";
import { getSupabaseBrowserClient } from "./supabaseClient";
import { syncHostedActiveProjectForSessionResume } from "./sessionResume";

export type HostedRouteRedirect = {
  readonly to: string;
  readonly replace?: boolean;
  readonly search?: Record<string, string>;
};

type HostedSignedInContext =
  | {
      readonly kind: "control-plane";
      readonly email: string;
      readonly userId: string;
    }
  | {
      readonly kind: "supabase";
      readonly email: string;
      readonly userId: string;
      readonly supabase: ReturnType<typeof getSupabaseBrowserClient>;
    };

async function loadHostedSignedInContext(): Promise<HostedSignedInContext | null> {
  if (isHostedControlPlaneConfigured()) {
    const session = await getHostedSession();
    if (!session.authenticated || !session.user?.email || !session.user.id) {
      return null;
    }
    return {
      kind: "control-plane",
      email: session.user.email,
      userId: session.user.id,
    };
  }

  if (isSupabaseHostedAuthConfigured()) {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user.email || !session.user.id) {
      return null;
    }
    return {
      kind: "supabase",
      email: session.user.email,
      userId: session.user.id,
      supabase,
    };
  }

  return null;
}

async function accessDeniedRedirect(email: string): Promise<HostedRouteRedirect | null> {
  const access = await assertSessionMayEnterApp(email);
  if (access.ok) {
    return null;
  }
  return {
    to: "/access-denied",
    search: { message: access.userMessage },
    replace: true,
  };
}

function onboardingRedirect(): HostedRouteRedirect {
  return { to: "/onboarding", replace: true };
}

function connectProviderRedirect(): HostedRouteRedirect {
  return { to: "/connect-provider", replace: true };
}

function appHomeRedirect(): HostedRouteRedirect {
  return { to: "/", replace: true };
}

function welcomeRedirect(): HostedRouteRedirect {
  return { to: "/welcome", replace: true };
}

function pairRedirect(): HostedRouteRedirect {
  return { to: "/pair", replace: true };
}

/**
 * Hosted **Sign-in** screen: authenticated **Users** skip welcome.
 */
export async function resolveHostedWelcomeRedirect(): Promise<HostedRouteRedirect | null> {
  if (!isHostedAuthConfigured()) {
    return pairRedirect();
  }

  const signedIn = await loadHostedSignedInContext();
  if (!signedIn) {
    return null;
  }

  if (readHostedProfileComplete()) {
    return appHomeRedirect();
  }
  return onboardingRedirect();
}

/**
 * **App** chat shell: enforce invite gate, **Onboarding**, and **Connect provider** order.
 */
export async function resolveHostedChatRedirect(): Promise<HostedRouteRedirect | null> {
  if (!isHostedAuthConfigured()) {
    return null;
  }

  const signedIn = await loadHostedSignedInContext();
  if (!signedIn) {
    return welcomeRedirect();
  }

  const denied = await accessDeniedRedirect(signedIn.email);
  if (denied) {
    if (signedIn.kind === "supabase") {
      await signedIn.supabase.auth.signOut();
    } else if (signedIn.kind === "control-plane") {
      await signOutHostedSession();
    }
    return denied;
  }

  if (!readHostedProfileComplete()) {
    return onboardingRedirect();
  }

  if (!readHostedCodexConnected()) {
    return connectProviderRedirect();
  }

  await syncHostedActiveProjectForSessionResume();
  return null;
}

export async function resolveHostedOnboardingRedirect(
  authAuthenticated: boolean,
): Promise<HostedRouteRedirect | null> {
  if (!isHostedAuthConfigured()) {
    return pairRedirect();
  }
  if (!authAuthenticated) {
    return welcomeRedirect();
  }
  return null;
}

export async function resolveHostedConnectProviderRedirect(
  authAuthenticated: boolean,
): Promise<HostedRouteRedirect | null> {
  if (!isHostedAuthConfigured()) {
    return pairRedirect();
  }
  if (!authAuthenticated) {
    return welcomeRedirect();
  }
  if (!readHostedProfileComplete()) {
    return onboardingRedirect();
  }
  return null;
}

/**
 * After magic-link **Sign-in**, route to the next hosted step.
 */
export async function resolveHostedPostAuthRedirect(): Promise<HostedRouteRedirect> {
  if (readHostedProfileComplete()) {
    if (!readHostedCodexConnected()) {
      return connectProviderRedirect();
    }
    await syncHostedActiveProjectForSessionResume();
    return appHomeRedirect();
  }
  return onboardingRedirect();
}
