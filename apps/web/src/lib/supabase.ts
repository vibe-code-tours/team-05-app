import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Get or create the browser-side Supabase client.
 *
 * Lazily initialized so importing this module doesn't crash at build time
 * when `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` aren't set (e.g. CI).
 * The caller is expected to check for a truthy client before using it.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase client not configured. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.",
    );
  }

  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // we manage our own session via Zustand
      autoRefreshToken: false,
      detectSessionInUrl: true, // needed for OAuth callback detection
    },
  });

  return _client;
}
