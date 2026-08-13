import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "@/lib/store/useNotesStore";
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
  useNotesStore.setState({ notes: [], userId: null, status: "idle" });
  useToastStore.setState({ toasts: [] });
  vi.mocked(createClient).mockReset();
});

describe("useNotesStore — signed-out (no network writes)", () => {
  it("addNote assigns a real UUID and defaults title/content", () => {
    const created = useNotesStore.getState().addNote();
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(created.title).toBe("Untitled");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("updateNote patches content and bumps updatedAt", () => {
    const created = useNotesStore.getState().addNote({ title: "Draft" });
    useNotesStore.getState().updateNote(created.id, { title: "Final" });
    expect(useNotesStore.getState().notes[0].title).toBe("Final");
  });

  it("deleteNote removes it from the list", () => {
    const created = useNotesStore.getState().addNote();
    useNotesStore.getState().deleteNote(created.id);
    expect(useNotesStore.getState().notes).toHaveLength(0);
  });

  it("togglePin flips pinned", () => {
    const created = useNotesStore.getState().addNote();
    useNotesStore.getState().togglePin(created.id);
    expect(useNotesStore.getState().notes[0].pinned).toBe(true);
  });
});

describe("useNotesStore — signed-in (persists to Supabase)", () => {
  it("rolls back the optimistic note and toasts on insert failure", async () => {
    vi.mocked(createClient).mockReturnValue(
      fakeSupabase({ insert: { message: "boom" } }) as unknown as ReturnType<typeof createClient>
    );
    useNotesStore.setState({ userId: "user-1" });
    useNotesStore.getState().addNote({ title: "Will fail" });
    await flush();
    expect(useNotesStore.getState().notes).toHaveLength(0);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ variant: "error" });
  });

  it("keeps the note on successful insert", async () => {
    vi.mocked(createClient).mockReturnValue(fakeSupabase() as unknown as ReturnType<typeof createClient>);
    useNotesStore.setState({ userId: "user-1" });
    const created = useNotesStore.getState().addNote({ title: "Synced" });
    await flush();
    expect(useNotesStore.getState().notes[0].id).toBe(created.id);
  });
});
