import { create } from "zustand";
import { toDateKey } from "@/lib/utils";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { createClient } from "@/lib/supabase/client";
import {
  dbEventToEvent,
  dbGoalToGoal,
  dbHabitToHabit,
  eventPatchToDbUpdate,
  eventToDbRow,
  goalPatchToDbUpdate,
  goalToDbRow,
  habitPatchToDbUpdate,
  habitToDbRow,
} from "@/lib/supabase/mappers";
import { toast } from "@/lib/store/useToastStore";
import type { CalendarEvent, Goal, Habit } from "@/lib/store/types";

type SyncStatus = "idle" | "loading" | "ready" | "error";

interface LifeState {
  events: CalendarEvent[];
  habits: Habit[];
  goals: Goal[];
  userId: string | null;
  status: SyncStatus;
  hydrate: (userId: string | null) => Promise<void>;
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

/** Same optimistic-write pattern as useTasksStore/useNotesStore for all
 * three entities here — events, habits, and goals are all Supabase-backed
 * now, so this store no longer needs zustand's `persist` middleware at all. */
export const useLifeStore = create<LifeState>()((set, get) => ({
  events: [],
  habits: [],
  goals: [],
  userId: null,
  status: "idle",

  hydrate: async (userId) => {
    if (!userId) {
      set({ events: [], habits: [], goals: [], userId: null, status: "idle" });
      return;
    }
    set({ userId, status: "loading" });
    const supabase = createClient();
    const [eventsRes, habitsRes, goalsRes] = await Promise.all([
      supabase.from("calendar_events").select("*").order("start_time", { ascending: true }).limit(500),
      supabase.from("habits").select("*").order("created_at", { ascending: true }).limit(500),
      supabase.from("goals").select("*").order("created_at", { ascending: true }).limit(500),
    ]);
    if (eventsRes.error || habitsRes.error || goalsRes.error) {
      console.error(eventsRes.error ?? habitsRes.error ?? goalsRes.error);
      set({ status: "error" });
      toast.error("Couldn't load your calendar, habits, and goals.", {
        label: "Retry",
        onClick: () => get().hydrate(userId),
      });
      return;
    }
    set({
      events: eventsRes.data.map(dbEventToEvent),
      habits: habitsRes.data.map(dbHabitToHabit),
      goals: goalsRes.data.map(dbGoalToGoal),
      status: "ready",
    });
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
    const userId = get().userId;
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
    const userId = get().userId;
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
    const userId = get().userId;
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
      id: crypto.randomUUID(),
      color: "#ff6b3d",
      frequency: "daily",
      targetPerWeek: 5,
      completions: {},
      createdAt: new Date().toISOString(),
      ...habit,
    };
    set({ habits: [...get().habits, newHabit] });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("habits")
        .insert(habitToDbRow(newHabit, userId))
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error(`Couldn't save "${newHabit.name}" — try again.`);
          set({ habits: get().habits.filter((h) => h.id !== newHabit.id) });
        });
    }
    return newHabit;
  },

  toggleHabitCompletion: (id, date = new Date()) => {
    const key = toDateKey(date);
    const previous = get().habits;
    const habit = previous.find((h) => h.id === id);
    if (!habit) return;
    const completions = { ...habit.completions, [key]: !habit.completions[key] };
    set({ habits: previous.map((h) => (h.id === id ? { ...h, completions } : h)) });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("habits")
        .update(habitPatchToDbUpdate({ completions }))
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't save that change — try again.");
          set({ habits: previous });
        });
    }
  },

  deleteHabit: (id) => {
    const previous = get().habits;
    set({ habits: previous.filter((h) => h.id !== id) });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("habits")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't delete that habit — try again.");
          set({ habits: previous });
        });
    }
  },

  addGoal: (goal) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      progress: 0,
      linkedHabitIds: [],
      ...goal,
    };
    set({ goals: [...get().goals, newGoal] });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("goals")
        .insert(goalToDbRow(newGoal, userId))
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error(`Couldn't save "${newGoal.title}" — try again.`);
          set({ goals: get().goals.filter((g) => g.id !== newGoal.id) });
        });
    }
    return newGoal;
  },

  updateGoal: (id, patch) => {
    const previous = get().goals;
    set({
      goals: previous.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("goals")
        .update(goalPatchToDbUpdate(patch))
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't save that change — try again.");
          set({ goals: previous });
        });
    }
  },

  deleteGoal: (id) => {
    const previous = get().goals;
    set({ goals: previous.filter((g) => g.id !== id) });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("goals")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't delete that goal — try again.");
          set({ goals: previous });
        });
    }
  },
}));
