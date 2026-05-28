import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isHostedAuthConfigured } from "./config";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!isHostedAuthConfigured()) {
    throw new Error("Hosted auth is not configured (missing Supabase env).");
  }
  if (!browserClient) {
    browserClient = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: "pkce",
          detectSessionInUrl: true,
          persistSession: true,
        },
      },
    );
  }
  return browserClient;
}
