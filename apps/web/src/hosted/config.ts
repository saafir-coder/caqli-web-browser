function isSupabaseHostedConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
  return url.length > 0 && key.length > 0;
}

function isHostedApiBaseConfigured(): boolean {
  const apiUrl = import.meta.env.VITE_API_URL?.trim() ?? "";
  const httpUrl = import.meta.env.VITE_HTTP_URL?.trim() ?? "";
  return apiUrl.length > 0 || httpUrl.length > 0;
}

/**
 * VPS control plane auth (magic link via apps/server). Preferred over Supabase.
 */
export function isHostedControlPlaneConfigured(): boolean {
  if (isSupabaseHostedConfigured()) {
    return false;
  }
  return isHostedApiBaseConfigured();
}

/**
 * Hosted (magic-link) auth is opt-in via Vite env. When unset, the app keeps
 * the default T3 pairing + server session flow unchanged.
 */
export function isHostedAuthConfigured(): boolean {
  return isHostedControlPlaneConfigured() || isSupabaseHostedConfigured();
}

export function isSupabaseHostedAuthConfigured(): boolean {
  return isSupabaseHostedConfigured();
}

export function isPublicHostedAuthPath(pathname: string): boolean {
  return (
    pathname === "/welcome" ||
    pathname === "/check-email" ||
    pathname === "/access-denied" ||
    pathname.startsWith("/auth/")
  );
}

/**
 * Hosted routes that must not hit the T3 HTTP API until the user has a Supabase
 * session (or we're on a public magic-link screen). Otherwise `fetch` targets
 * fall through to Vite's SPA HTML and blow up on `response.json()`.
 */
export function isHostedT3DeferredPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/onboarding" ||
    pathname === "/connect-provider" ||
    pathname.startsWith("/settings") ||
    isPublicHostedAuthPath(pathname)
  );
}
