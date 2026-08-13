import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Reads/writes auth cookies via Next's cookie store, so the
 * caller's session carries through automatically.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component during rendering, where cookies
          // can't be mutated. Safe to ignore once middleware (Phase 2) is
          // refreshing the session on every request.
        }
      },
    },
  });
}
