import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { createClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function fakeSupabase(errors: { insert?: object; update?: object; delete?: object } = {}) {
  return {
    from: () => ({
      insert: async () => ({ error: errors.insert ?? null }),
      update: () => ({ eq: async () => ({ error: errors.update ?? null }) }),
      delete: () => ({ eq: async () => ({ error: errors.delete ?? null }) }),
    }),
  };
}

beforeEach(() => {
  useLifeStore.setState({ events: [], habits: [], goals: [], userId: null, status: "idle" });
  useToastStore.setState({ toasts: [] });
  vi.mocked(createClient).mockReset();
});

describe("useLifeStore — events, signed-out (no network writes)", () => {
  it("addEvent assigns a real UUID and inserts optimistically", () => {
    const created = useLifeStore.getState().addEvent({ title: "Standup" });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(useLifeStore.getState().events[0].title).toBe("Standup");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("updateEvent patches the event in place", () => {
    const created = useLifeStore.getState().addEvent({ title: "Draft" });
    useLifeStore.getState().updateEvent(created.id, { title: "Final" });
    expect(useLifeStore.getState().events[0].title).toBe("Final");
  });

  it("deleteEvent removes it from the list", () => {
    const created = useLifeStore.getState().addEvent({ title: "Temp" });
    useLifeStore.getState().deleteEvent(created.id);
    expect(useLifeStore.getState().events).toHaveLength(0);
  });
});

describe("useLifeStore — habits, signed-out (no network writes)", () => {
  it("addHabit assigns a real UUID and defaults", () => {
    const created = useLifeStore.getState().addHabit({ name: "Read" });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(created.frequency).toBe("daily");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("toggleHabitCompletion flips the day's entry", () => {
    const habit = useLifeStore.getState().addHabit({ name: "Read" });
    useLifeStore.getState().toggleHabitCompletion(habit.id, new Date(2026, 0, 5));
    const updated = useLifeStore.getState().habits.find((h) => h.id === habit.id)!;
    expect(updated.completions["2026-01-05"]).toBe(true);
    useLifeStore.getState().toggleHabitCompletion(habit.id, new Date(2026, 0, 5));
    expect(
      useLifeStore.getState().habits.find((h) => h.id === habit.id)!.completions["2026-01-05"]
    ).toBe(false);
  });

  it("deleteHabit removes it from the list", () => {
    const habit = useLifeStore.getState().addHabit({ name: "Temp" });
    useLifeStore.getState().deleteHabit(habit.id);
    expect(useLifeStore.getState().habits).toHaveLength(0);
  });
});

describe("useLifeStore — goals, signed-out (no network writes)", () => {
  it("addGoal, updateGoal, and deleteGoal work locally", () => {
    const goal = useLifeStore.getState().addGoal({ title: "Ship v2" });
    useLifeStore.getState().updateGoal(goal.id, { progress: 50 });
    expect(useLifeStore.getState().goals.find((g) => g.id === goal.id)?.progress).toBe(50);
    useLifeStore.getState().deleteGoal(goal.id);
    expect(useLifeStore.getState().goals.find((g) => g.id === goal.id)).toBeUndefined();
  });
});

describe("useLifeStore — signed-in (persists to Supabase)", () => {
  it("rolls back the optimistic event and toasts on insert failure", async () => {
    vi.mocked(createClient).mockReturnValue(
      fakeSupabase({ insert: { message: "boom" } }) as unknown as ReturnType<typeof createClient>
    );
    useLifeStore.setState({ userId: "user-1" });
    useLifeStore.getState().addEvent({ title: "Will fail" });
    await flush();
    expect(useLifeStore.getState().events).toHaveLength(0);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ variant: "error" });
  });

  it("rolls back the optimistic habit on insert failure", async () => {
    vi.mocked(createClient).mockReturnValue(
      fakeSupabase({ insert: { message: "boom" } }) as unknown as ReturnType<typeof createClient>
    );
    useLifeStore.setState({ userId: "user-1" });
    useLifeStore.getState().addHabit({ name: "Will fail" });
    await flush();
    expect(useLifeStore.getState().habits).toHaveLength(0);
  });

  it("hydrate(null) clears events, habits, and goals (e.g. on sign-out)", async () => {
    useLifeStore.getState().addEvent({ title: "Leftover event" });
    useLifeStore.getState().addHabit({ name: "Leftover habit" });
    useLifeStore.getState().addGoal({ title: "Leftover goal" });
    await useLifeStore.getState().hydrate(null);
    const { events, habits, goals, status } = useLifeStore.getState();
    expect(events).toEqual([]);
    expect(habits).toEqual([]);
    expect(goals).toEqual([]);
    expect(status).toBe("idle");
  });
});
