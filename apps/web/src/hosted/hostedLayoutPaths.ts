/**
 * Routes that render without the main app chrome (sidebar, WS shell), even when
 * the user already has a Supabase session — same idea as `/pair`.
 */
export function isHostedMinimalChromePath(pathname: string): boolean {
  return (
    pathname === "/pair" ||
    pathname === "/welcome" ||
    pathname === "/check-email" ||
    pathname.startsWith("/auth/") ||
    pathname === "/onboarding"
  );
}
