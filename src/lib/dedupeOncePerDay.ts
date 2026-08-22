const SEEN_KEY_PREFIX = "nexus-notified";

/** Backs "don't repeat this today" checks (ambient notifications, the daily
 * briefing activity entry) with localStorage, keyed by a caller-chosen
 * `kind` plus the calendar day. */
export function getSeenIds(kind: string, dateKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${SEEN_KEY_PREFIX}:${kind}:${dateKey}`);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markSeen(kind: string, dateKey: string, id: string) {
  const seen = getSeenIds(kind, dateKey);
  seen.add(id);
  try {
    localStorage.setItem(`${SEEN_KEY_PREFIX}:${kind}:${dateKey}`, JSON.stringify([...seen]));
  } catch {
    // Best-effort — a full/unavailable localStorage just means this device
    // might see a duplicate, not a broken app.
  }
}
