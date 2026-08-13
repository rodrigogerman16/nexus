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
  useLifeStore.setState({ events: [], eventsUserId: null, eventsStatus: "idle" });
  useToastStore.setState({ toasts: [] });
  vi.mocked(createClient).mockReset();
});

describe("useLifeStore — events (Supabase-backed)", () => {
  it("addEvent assigns a real UUID and inserts optimistically without a signed-in user", () => {
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

  it("rolls back the optimistic event and toasts on insert failure", async () => {
    vi.mocked(createClient).mockReturnValue(
      fakeSupabase({ insert: { message: "boom" } }) as unknown as ReturnType<typeof createClient>
    );
    useLifeStore.setState({ eventsUserId: "user-1" });
    useLifeStore.getState().addEvent({ title: "Will fail" });
    await flush();
    expect(useLifeStore.getState().events).toHaveLength(0);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ variant: "error" });
  });

  it("hydrateEvents(null) clears local events (e.g. on sign-out)", async () => {
    useLifeStore.getState().addEvent({ title: "Leftover" });
    await useLifeStore.getState().hydrateEvents(null);
    expect(useLifeStore.getState().events).toEqual([]);
    expect(useLifeStore.getState().eventsStatus).toBe("idle");
  });
});

describe("useLifeStore — habits/goals stay local-only", () => {
  it("addHabit and toggleHabitCompletion work without touching Supabase", () => {
    const habit = useLifeStore.getState().addHabit({ name: "Read" });
    useLifeStore.getState().toggleHabitCompletion(habit.id, new Date(2026, 0, 5));
    const updated = useLifeStore.getState().habits.find((h) => h.id === habit.id)!;
    expect(updated.completions["2026-01-05"]).toBe(true);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("addGoal, updateGoal, and deleteGoal work locally", () => {
    const goal = useLifeStore.getState().addGoal({ title: "Ship v2" });
    useLifeStore.getState().updateGoal(goal.id, { progress: 50 });
    expect(useLifeStore.getState().goals.find((g) => g.id === goal.id)?.progress).toBe(50);
    useLifeStore.getState().deleteGoal(goal.id);
    expect(useLifeStore.getState().goals.find((g) => g.id === goal.id)).toBeUndefined();
  });

  it("persist only writes habits/goals to storage, not events", () => {
    const options = useLifeStore.persist.getOptions();
    const partialize = options.partialize as (state: ReturnType<typeof useLifeStore.getState>) => unknown;
    useLifeStore.getState().addEvent({ title: "Should not persist" });
    const persisted = partialize(useLifeStore.getState()) as Record<string, unknown>;
    expect(persisted).not.toHaveProperty("events");
    expect(persisted).toHaveProperty("habits");
    expect(persisted).toHaveProperty("goals");
  });
});
