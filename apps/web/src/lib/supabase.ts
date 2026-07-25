import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-side Supabase client — used only for Google OAuth popup flow
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // we manage our own session via Zustand
    autoRefreshToken: false,
    detectSessionInUrl: true, // needed for OAuth callback detection
  },
});
