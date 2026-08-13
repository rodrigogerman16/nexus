import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser-side Supabase client, for use in Client Components. Safe to call
 * repeatedly — `createBrowserClient` reuses a single underlying instance.
 */
export function createClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
