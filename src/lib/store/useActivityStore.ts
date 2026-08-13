import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { activityToDbRow, dbActivityToActivity } from "@/lib/supabase/mappers";
import type { ActivityItem, ActivityType } from "@/lib/store/types";

type SyncStatus = "idle" | "loading" | "ready" | "error";

interface ActivityState {
  activities: ActivityItem[];
  userId: string | null;
  status: SyncStatus;
  hydrate: (userId: string | null) => Promise<void>;
  addActivity: (
    activity: Partial<ActivityItem> & { type: ActivityType; description: string }
  ) => ActivityItem;
}

/** Unlike the other stores, a failed background insert here doesn't roll
 * the optimistic entry back — this is an append-only, informational log
 * (the Activity page), not data the rest of the app depends on, so
 * silently removing a just-created entry over a transient network blip
 * would be more confusing than leaving it displayed locally. */
export const useActivityStore = create<ActivityState>()((set, get) => ({
  activities: [],
  userId: null,
  status: "idle",

  hydrate: async (userId) => {
    if (!userId) {
      set({ activities: [], userId: null, status: "idle" });
      return;
    }
    set({ userId, status: "loading" });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error(error);
      set({ status: "error" });
      return;
    }
    set({ activities: data.map(dbActivityToActivity), status: "ready" });
  },

  addActivity: (activity) => {
    const newActivity: ActivityItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...activity,
    };
    set({ activities: [newActivity, ...get().activities] });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("activities")
        .insert(activityToDbRow(newActivity, userId))
        .then(({ error }) => {
          if (error) console.error(error);
        });
    }
    return newActivity;
  },
}));
