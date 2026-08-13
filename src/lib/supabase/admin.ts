import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client — bypasses Row Level Security entirely. The
 * `server-only` import makes any accidental client-component import a build
 * error. Use only in trusted server contexts (Route Handlers, Server
 * Actions) that have already authorized the request themselves, e.g.
 * webhook handlers or scheduled jobs — never for ordinary per-user reads,
 * which should go through `lib/supabase/server.ts` so RLS still applies.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
