import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";
import { seedActivities } from "@/lib/mock/seedData";
import type { ActivityItem, ActivityType } from "@/lib/store/types";

interface ActivityState {
  activities: ActivityItem[];
  addActivity: (
    activity: Partial<ActivityItem> & { type: ActivityType; description: string }
  ) => ActivityItem;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: seedActivities,
      addActivity: (activity) => {
        const newActivity: ActivityItem = {
          id: generateId("activity"),
          createdAt: new Date().toISOString(),
          ...activity,
        };
        set({ activities: [newActivity, ...get().activities] });
        return newActivity;
      },
    }),
    {
      name: "acc-activity-store",
      // v1 added taskId to ActivityItem and backfilled seed entries with it —
      // fall back to the current seed data instead of running with an older shape.
      version: 1,
      migrate: () => ({ activities: seedActivities }),
    }
  )
);
