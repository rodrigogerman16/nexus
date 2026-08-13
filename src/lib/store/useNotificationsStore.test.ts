import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
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
  useNotificationsStore.setState({ notifications: [], userId: null, status: "idle" });
  useToastStore.setState({ toasts: [] });
  vi.mocked(createClient).mockReset();
});

describe("useNotificationsStore — signed-out (no network writes)", () => {
  it("addNotification assigns a real UUID and defaults isRead to false", () => {
    const created = useNotificationsStore.getState().addNotification({
      type: "task_due",
      title: "Report due soon",
    });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(created.isRead).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("markRead flips isRead for just that notification", () => {
    const a = useNotificationsStore.getState().addNotification({ type: "task_due", title: "A" });
    useNotificationsStore.getState().addNotification({ type: "task_due", title: "B" });
    useNotificationsStore.getState().markRead(a.id);
    const notifications = useNotificationsStore.getState().notifications;
    expect(notifications.find((n) => n.id === a.id)?.isRead).toBe(true);
    expect(notifications.find((n) => n.title === "B")?.isRead).toBe(false);
  });

  it("markAllRead flips every notification", () => {
    useNotificationsStore.getState().addNotification({ type: "task_due", title: "A" });
    useNotificationsStore.getState().addNotification({ type: "task_due", title: "B" });
    useNotificationsStore.getState().markAllRead();
    expect(useNotificationsStore.getState().notifications.every((n) => n.isRead)).toBe(true);
  });

  it("deleteNotification removes just that one", () => {
    const a = useNotificationsStore.getState().addNotification({ type: "task_due", title: "A" });
    useNotificationsStore.getState().addNotification({ type: "task_due", title: "B" });
    useNotificationsStore.getState().deleteNotification(a.id);
    expect(useNotificationsStore.getState().notifications).toHaveLength(1);
  });

  it("clearAll empties the list", () => {
    useNotificationsStore.getState().addNotification({ type: "task_due", title: "A" });
    useNotificationsStore.getState().clearAll();
    expect(useNotificationsStore.getState().notifications).toHaveLength(0);
  });
});

describe("useNotificationsStore — signed-in (persists to Supabase)", () => {
  it("rolls back the optimistic notification and stays quiet (no toast) on insert failure", async () => {
    vi.mocked(createClient).mockReturnValue(
      fakeSupabase({ insert: { message: "boom" } }) as unknown as ReturnType<typeof createClient>
    );
    useNotificationsStore.setState({ userId: "user-1" });
    useNotificationsStore.getState().addNotification({ type: "task_due", title: "Will fail" });
    await flush();
    expect(useNotificationsStore.getState().notifications).toHaveLength(0);
  });

  it("rolls back and toasts when markAllRead fails", async () => {
    vi.mocked(createClient).mockReturnValue(fakeSupabase() as unknown as ReturnType<typeof createClient>);
    useNotificationsStore.setState({ userId: "user-1" });
    useNotificationsStore.getState().addNotification({ type: "task_due", title: "A" });
    await flush();

    vi.mocked(createClient).mockReturnValue(
      fakeSupabase({ update: { message: "boom" } }) as unknown as ReturnType<typeof createClient>
    );
    useNotificationsStore.getState().markAllRead();
    await flush();
    expect(useNotificationsStore.getState().notifications[0].isRead).toBe(false);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ variant: "error" });
  });
});
