import { createClient } from "@/lib/supabase/client";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";

/** Every Supabase table that stores per-user content, keyed by `owner_id`.
 * Kept in one place so export and delete can't silently drift apart and
 * miss a table one of them covers. */
const OWNED_TABLES = [
  "tasks",
  "projects",
  "notes",
  "calendar_events",
  "habits",
  "goals",
  "activities",
  "notifications",
] as const;

/** Gathers everything currently loaded in the client-side stores into one
 * JSON file and triggers a browser download. Reads from the stores rather
 * than re-querying Supabase since the stores are already the hydrated,
 * up-to-date source of truth for what the signed-in user can see. */
export function exportUserDataToFile() {
  const data = {
    exportedAt: new Date().toISOString(),
    tasks: useTasksStore.getState().tasks,
    projects: useTasksStore.getState().projects,
    notes: useNotesStore.getState().notes,
    events: useLifeStore.getState().events,
    habits: useLifeStore.getState().habits,
    goals: useLifeStore.getState().goals,
    activities: useActivityStore.getState().activities,
    notifications: useNotificationsStore.getState().notifications,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexus-export-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Permanently deletes every row the user owns across all tables, then
 * re-hydrates the stores (from the now-empty tables) so the UI reflects it
 * immediately without a full page reload. */
export async function deleteAllUserData(userId: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  for (const table of OWNED_TABLES) {
    const { error } = await supabase.from(table).delete().eq("owner_id", userId);
    if (error) return { error: error.message };
  }
  await Promise.all([
    useTasksStore.getState().hydrate(userId),
    useNotesStore.getState().hydrate(userId),
    useLifeStore.getState().hydrate(userId),
    useActivityStore.getState().hydrate(userId),
    useNotificationsStore.getState().hydrate(userId),
  ]);
  return { error: null };
}
