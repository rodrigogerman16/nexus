import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId, toDateKey } from "@/lib/utils";
import { seedEvents, seedGoals, seedHabits } from "@/lib/mock/seedData";
import { useActivityStore } from "@/lib/store/useActivityStore";
import type { CalendarEvent, Goal, Habit } from "@/lib/store/types";

interface LifeState {
  events: CalendarEvent[];
  habits: Habit[];
  goals: Goal[];
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

export const useLifeStore = create<LifeState>()(
  persist(
    (set, get) => ({
      events: seedEvents,
      habits: seedHabits,
      goals: seedGoals,
      addEvent: (event) => {
        const now = new Date();
        const newEvent: CalendarEvent = {
          id: generateId("event"),
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
        return newEvent;
      },
      updateEvent: (id, patch) => {
        set({
          events: get().events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        });
      },
      deleteEvent: (id) => {
        set({ events: get().events.filter((e) => e.id !== id) });
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
    { name: "acc-life-store" }
  )
);
