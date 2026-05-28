/**
 * Hosted (magic-link) auth is opt-in via Vite env. When unset, the app keeps
 * the default T3 pairing + server session flow unchanged.
 */
export function isHostedAuthConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
  return url.length > 0 && key.length > 0;
}

export function isPublicHostedAuthPath(pathname: string): boolean {
  return pathname === "/welcome" || pathname === "/check-email" || pathname.startsWith("/auth/");
}
