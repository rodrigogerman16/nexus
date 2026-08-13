import { beforeEach, describe, expect, it, vi } from "vitest";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { createClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function fakeSupabase(errors: { insert?: object } = {}) {
  return {
    from: () => ({
      insert: async () => ({ error: errors.insert ?? null }),
    }),
  };
}

beforeEach(() => {
  useActivityStore.setState({ activities: [], userId: null, status: "idle" });
  vi.mocked(createClient).mockReset();
});

describe("useActivityStore — signed-out (no network writes)", () => {
  it("addActivity assigns a real UUID and prepends to the list", () => {
    const created = useActivityStore.getState().addActivity({
      type: "task_created",
      description: "Created a task",
    });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(useActivityStore.getState().activities[0].description).toBe("Created a task");
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe("useActivityStore — signed-in", () => {
  it("does not roll back the entry on a failed background insert", async () => {
    vi.mocked(createClient).mockReturnValue(
      fakeSupabase({ insert: { message: "boom" } }) as unknown as ReturnType<typeof createClient>
    );
    useActivityStore.setState({ userId: "user-1" });
    useActivityStore.getState().addActivity({
      type: "task_created",
      description: "Stays visible even if the write fails",
    });
    await flush();
    expect(useActivityStore.getState().activities).toHaveLength(1);
  });

  it("hydrate(null) clears local activities", async () => {
    useActivityStore.getState().addActivity({ type: "task_created", description: "Leftover" });
    await useActivityStore.getState().hydrate(null);
    expect(useActivityStore.getState().activities).toEqual([]);
  });
});
