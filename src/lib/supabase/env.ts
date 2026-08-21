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

export function getSupabaseUrl(): string {
  const raw = required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  // Supabase's GoTrue API rejects requests with "Invalid path specified in
  // request URL" if the base URL carries a trailing slash or stray
  // whitespace/newline — an easy typo when pasting into a host's env var UI.
  // Normalizing here means a misformatted value can't silently break auth.
  return raw.trim().replace(/\/+$/, "");
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
