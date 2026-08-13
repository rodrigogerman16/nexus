import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId, toDateKey } from "@/lib/utils";
import { seedGoals, seedHabits } from "@/lib/mock/seedData";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { createClient } from "@/lib/supabase/client";
import { dbEventToEvent, eventPatchToDbUpdate, eventToDbRow } from "@/lib/supabase/mappers";
import { toast } from "@/lib/store/useToastStore";
import type { CalendarEvent, Goal, Habit } from "@/lib/store/types";

type SyncStatus = "idle" | "loading" | "ready" | "error";

interface LifeState {
  events: CalendarEvent[];
  eventsUserId: string | null;
  eventsStatus: SyncStatus;
  habits: Habit[];
  goals: Goal[];
  hydrateEvents: (userId: string | null) => Promise<void>;
  addEvent: (event: Partial<CalendarEvent> & { title: string }) => CalendarEvent;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addHabit: (habit: Partial<Habit> & { name: string }) => Habit;
  toggleHabitCompletion: (id: string, date?: Date) => void;
  deleteHabit: (id: string) => void;
  addGoal: (goal: Partial<Goal> & { title: string }) => Goal;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

/** Events are real Supabase-backed data (same optimistic-write pattern as
 * useTasksStore/useNotesStore), so they're deliberately left out of
 * `partialize` below — habits/goals are still local-only demo data and stay
 * on the old localStorage-persisted path. */
export const useLifeStore = create<LifeState>()(
  persist(
    (set, get) => ({
      events: [],
      eventsUserId: null,
      eventsStatus: "idle",
      habits: seedHabits,
      goals: seedGoals,

      hydrateEvents: async (userId) => {
        if (!userId) {
          set({ events: [], eventsUserId: null, eventsStatus: "idle" });
          return;
        }
        set({ eventsUserId: userId, eventsStatus: "loading" });
        const supabase = createClient();
        const { data, error } = await supabase
          .from("calendar_events")
          .select("*")
          .order("start_time", { ascending: true });
        if (error) {
          console.error(error);
          set({ eventsStatus: "error" });
          toast.error("Couldn't load your calendar.");
          return;
        }
        set({ events: data.map(dbEventToEvent), eventsStatus: "ready" });
      },

      addEvent: (event) => {
        const now = new Date();
        const newEvent: CalendarEvent = {
          id: crypto.randomUUID(),
          start: now.toISOString(),
          end: now.toISOString(),
          color: "#ff6b3d",
          ...event,
        };
        set({ events: [...get().events, newEvent] });
        useActivityStore.getState().addActivity({
          type: "event_created",
          description: `Scheduled "${newEvent.title}"`,
        });
        const userId = get().eventsUserId;
        if (userId) {
          createClient()
            .from("calendar_events")
            .insert(eventToDbRow(newEvent, userId))
            .then(({ error }) => {
              if (!error) return;
              console.error(error);
              toast.error(`Couldn't save "${newEvent.title}" — try again.`);
              set({ events: get().events.filter((e) => e.id !== newEvent.id) });
            });
        }
        return newEvent;
      },

      updateEvent: (id, patch) => {
        const previous = get().events;
        set({
          events: previous.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        });
        const userId = get().eventsUserId;
        if (userId) {
          createClient()
            .from("calendar_events")
            .update(eventPatchToDbUpdate(patch))
            .eq("id", id)
            .then(({ error }) => {
              if (!error) return;
              console.error(error);
              toast.error("Couldn't save that change — try again.");
              set({ events: previous });
            });
        }
      },

      deleteEvent: (id) => {
        const previous = get().events;
        set({ events: previous.filter((e) => e.id !== id) });
        const userId = get().eventsUserId;
        if (userId) {
          createClient()
            .from("calendar_events")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
              if (!error) return;
              console.error(error);
              toast.error("Couldn't delete that event — try again.");
              set({ events: previous });
            });
        }
      },

      addHabit: (habit) => {
        const newHabit: Habit = {
          id: generateId("habit"),
          color: "#ff6b3d",
          frequency: "daily",
          targetPerWeek: 5,
          completions: {},
          createdAt: new Date().toISOString(),
          ...habit,
        };
        set({ habits: [...get().habits, newHabit] });
        return newHabit;
      },
      toggleHabitCompletion: (id, date = new Date()) => {
        const key = toDateKey(date);
        set({
          habits: get().habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completions: {
                    ...h.completions,
                    [key]: !h.completions[key],
                  },
                }
              : h
          ),
        });
      },
      deleteHabit: (id) => {
        set({ habits: get().habits.filter((h) => h.id !== id) });
      },
      addGoal: (goal) => {
        const newGoal: Goal = {
          id: generateId("goal"),
          progress: 0,
          linkedHabitIds: [],
          ...goal,
        };
        set({ goals: [...get().goals, newGoal] });
        return newGoal;
      },
      updateGoal: (id, patch) => {
        set({
          goals: get().goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        });
      },
      deleteGoal: (id) => {
        set({ goals: get().goals.filter((g) => g.id !== id) });
      },
    }),
    {
      name: "acc-life-store",
      // v2 moves events off localStorage entirely (now Supabase-backed, see
      // hydrateEvents) — only habits/goals are still persisted locally.
      version: 2,
      migrate: () => ({ habits: seedHabits, goals: seedGoals }),
      partialize: (state) => ({ habits: state.habits, goals: state.goals }),
    }
  )
);
