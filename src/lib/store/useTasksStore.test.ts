import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
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
  useTasksStore.setState({ tasks: [], projects: [], userId: null, status: "idle" });
  useToastStore.setState({ toasts: [] });
  useNotificationsStore.setState({ notifications: [], userId: null, status: "idle" });
  vi.mocked(createClient).mockReset();
});

describe("useTasksStore — signed-out (no network writes)", () => {
  it("addTask assigns a real UUID and inserts optimistically", () => {
    const created = useTasksStore.getState().addTask({ title: "Write docs" });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(useTasksStore.getState().tasks[0]).toMatchObject({ title: "Write docs", status: "todo" });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("updateTask patches the task in place", () => {
    const created = useTasksStore.getState().addTask({ title: "Draft" });
    useTasksStore.getState().updateTask(created.id, { title: "Final draft" });
    expect(useTasksStore.getState().tasks[0].title).toBe("Final draft");
  });

  it("deleteTask removes the task and its subtasks", () => {
    const parent = useTasksStore.getState().addTask({ title: "Parent" });
    useTasksStore.getState().addTask({ title: "Child", parentTaskId: parent.id });
    useTasksStore.getState().deleteTask(parent.id);
    expect(useTasksStore.getState().tasks).toHaveLength(0);
  });

  it("setStatus marks a task completed and raises a task_completed notification", () => {
    const created = useTasksStore.getState().addTask({ title: "Ship it" });
    useTasksStore.getState().setStatus(created.id, "completed");
    expect(useTasksStore.getState().tasks[0].status).toBe("completed");
    expect(useNotificationsStore.getState().notifications[0]).toMatchObject({
      type: "task_completed",
      title: 'Completed "Ship it"',
    });
  });

  it("setStatus does not re-notify when the task is already completed", () => {
    const created = useTasksStore.getState().addTask({ title: "Already done" });
    useTasksStore.getState().setStatus(created.id, "completed");
    useTasksStore.getState().setStatus(created.id, "completed");
    expect(useNotificationsStore.getState().notifications).toHaveLength(1);
  });

  it("moveTask reorders and reindexes positions", () => {
    const a = useTasksStore.getState().addTask({ title: "A" });
    const b = useTasksStore.getState().addTask({ title: "B" });
    useTasksStore.getState().moveTask(a.id, "in_progress", b.id);
    const { tasks } = useTasksStore.getState();
    const moved = tasks.find((t) => t.id === a.id)!;
    expect(moved.status).toBe("in_progress");
    expect(tasks.every((t, i) => t.position === i)).toBe(true);
  });

  it("moveTask raises a task_completed notification when moved into completed", () => {
    const a = useTasksStore.getState().addTask({ title: "A" });
    useTasksStore.getState().moveTask(a.id, "completed");
    expect(useNotificationsStore.getState().notifications[0]).toMatchObject({ type: "task_completed" });
  });

  it("addProject assigns a real UUID and defaults color/icon", () => {
    const created = useTasksStore.getState().addProject({ name: "Website Relaunch" });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(created.color).toBeDefined();
    expect(created.icon).toBe("Folder");
  });

  it("toggleFavoriteProject flips isFavorite", () => {
    const created = useTasksStore.getState().addProject({ name: "Mobile App" });
    useTasksStore.getState().toggleFavoriteProject(created.id);
    expect(useTasksStore.getState().projects[0].isFavorite).toBe(true);
    useTasksStore.getState().toggleFavoriteProject(created.id);
    expect(useTasksStore.getState().projects[0].isFavorite).toBe(false);
  });

  it("deleteProject removes it from the list", () => {
    const created = useTasksStore.getState().addProject({ name: "Temp" });
    useTasksStore.getState().deleteProject(created.id);
    expect(useTasksStore.getState().projects).toHaveLength(0);
  });

  it("updateProject raises a project_update notification on status change", () => {
    const created = useTasksStore.getState().addProject({ name: "Rebrand" });
    useTasksStore.getState().updateProject(created.id, { status: "active" });
    expect(useTasksStore.getState().projects[0].status).toBe("active");
    expect(useNotificationsStore.getState().notifications[0]).toMatchObject({
      type: "project_update",
      title: '"Rebrand" marked as active',
    });
  });

  it("updateProject raises a project_update notification on deadline change", () => {
    const created = useTasksStore.getState().addProject({ name: "Rebrand" });
    useTasksStore.getState().updateProject(created.id, { deadline: "2026-12-01" });
    expect(useNotificationsStore.getState().notifications[0]).toMatchObject({ type: "project_update" });
  });
});

describe("useTasksStore — signed-in (persists to Supabase)", () => {
  it("addTask inserts via Supabase and keeps the optimistic row on success", async () => {
    vi.mocked(createClient).mockReturnValue(fakeSupabase() as unknown as ReturnType<typeof createClient>);
    useTasksStore.setState({ userId: "user-1" });
    const created = useTasksStore.getState().addTask({ title: "Sync me" });
    await flush();
    expect(useTasksStore.getState().tasks).toHaveLength(1);
    expect(useTasksStore.getState().tasks[0].id).toBe(created.id);
  });

  it("rolls back the optimistic task and toasts on insert failure", async () => {
    vi.mocked(createClient).mockReturnValue(
      fakeSupabase({ insert: { message: "boom" } }) as unknown as ReturnType<typeof createClient>
    );
    useTasksStore.setState({ userId: "user-1" });
    useTasksStore.getState().addTask({ title: "Will fail" });
    await flush();
    expect(useTasksStore.getState().tasks).toHaveLength(0);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ variant: "error" });
  });

  it("rolls back an updateTask patch on failure", async () => {
    vi.mocked(createClient).mockReturnValue(fakeSupabase() as unknown as ReturnType<typeof createClient>);
    useTasksStore.setState({ userId: "user-1" });
    const created = useTasksStore.getState().addTask({ title: "Original" });
    await flush();

    vi.mocked(createClient).mockReturnValue(
      fakeSupabase({ update: { message: "boom" } }) as unknown as ReturnType<typeof createClient>
    );
    useTasksStore.getState().updateTask(created.id, { title: "Changed" });
    expect(useTasksStore.getState().tasks[0].title).toBe("Changed");
    await flush();
    expect(useTasksStore.getState().tasks[0].title).toBe("Original");
  });
});
