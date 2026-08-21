/**
 * Central place that resolves + validates the Supabase env vars. Every
 * client factory in this directory reads through here rather than reaching
 * into `process.env` directly, so a missing var fails fast with a clear
 * message instead of a cryptic runtime error deep inside a Supabase call.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and fill in your Supabase project credentials.`
    );
  }
  return value;
}

// Supabase's dashboard shows several ready-made URLs (REST, Auth, Storage,
// Functions) right next to the plain Project URL, so it's an easy mix-up to
// paste `.../rest/v1` instead of the bare origin. Every Supabase client
// (auth, REST, storage) appends its own API path on top of whatever base URL
// it's given, so a stray suffix here produces a nested, invalid path and
// GoTrue rejects it with "Invalid path specified in request URL".
const KNOWN_API_SUFFIXES = /\/(rest|auth|storage|functions)\/v1\/?$/;

export function getSupabaseUrl(): string {
  const raw = required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  return raw.trim().replace(KNOWN_API_SUFFIXES, "").replace(/\/+$/, "");
}

export function getSupabaseAnonKey(): string {
  const raw = required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return raw.trim();
}

export function getSupabaseServiceRoleKey(): string {
  const raw = required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  return raw.trim();
}
