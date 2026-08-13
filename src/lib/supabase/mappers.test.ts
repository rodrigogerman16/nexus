import { describe, expect, it } from "vitest";
import {
  dbProjectToProject,
  dbTaskToTask,
  projectPatchToDbUpdate,
  projectToDbRow,
  taskPatchToDbUpdate,
  taskToDbRow,
} from "@/lib/supabase/mappers";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

function makeTaskRow(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: "t1",
    owner_id: "u1",
    project_id: null,
    parent_task_id: null,
    title: "Task",
    description: null,
    status: "todo",
    priority: "medium",
    due_date: null,
    estimated_duration_minutes: null,
    tags: [],
    position: 0,
    completed_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeProjectRow(overrides: Partial<ProjectRow> = {}): ProjectRow {
  return {
    id: "p1",
    owner_id: "u1",
    name: "Project",
    description: null,
    status: "active",
    color: null,
    icon: "Folder",
    progress: 0,
    deadline: null,
    is_favorite: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("dbTaskToTask", () => {
  it("maps snake_case DB nulls to undefined optional fields", () => {
    const task = dbTaskToTask(makeTaskRow());
    expect(task.description).toBeUndefined();
    expect(task.projectId).toBeUndefined();
    expect(task.dueDate).toBeUndefined();
    expect(task.tags).toEqual([]);
  });

  it("carries through populated fields", () => {
    const task = dbTaskToTask(
      makeTaskRow({
        project_id: "p1",
        due_date: "2026-02-01T00:00:00.000Z",
        estimated_duration_minutes: 45,
        tags: ["urgent"],
        position: 3,
      })
    );
    expect(task).toMatchObject({
      projectId: "p1",
      dueDate: "2026-02-01T00:00:00.000Z",
      estimatedDurationMinutes: 45,
      tags: ["urgent"],
      position: 3,
    });
  });
});

describe("taskToDbRow", () => {
  it("maps app fields back to snake_case, defaulting undefineds to null", () => {
    const row = taskToDbRow(
      {
        id: "t1",
        title: "Ship it",
        status: "todo",
        priority: "high",
        tags: [],
        position: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      "u1"
    );
    expect(row).toMatchObject({
      id: "t1",
      owner_id: "u1",
      project_id: null,
      parent_task_id: null,
      due_date: null,
      estimated_duration_minutes: null,
    });
  });
});

describe("taskPatchToDbUpdate", () => {
  it("only includes keys present in the patch", () => {
    const update = taskPatchToDbUpdate({ title: "New title" });
    expect(update).toEqual({ title: "New title" });
  });

  it("nulls out an explicitly cleared optional field", () => {
    const update = taskPatchToDbUpdate({ dueDate: undefined });
    expect(update).toEqual({ due_date: null });
  });

  it("maps multiple patched fields at once", () => {
    const update = taskPatchToDbUpdate({ status: "completed", position: 2 });
    expect(update).toEqual({ status: "completed", position: 2 });
  });
});

describe("dbProjectToProject", () => {
  it("falls back to a default color and uses updated_at for lastAccessedAt", () => {
    const project = dbProjectToProject(makeProjectRow());
    expect(project.color).toBe("#ff6b3d");
    expect(project.lastAccessedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("carries through a populated color and deadline", () => {
    const project = dbProjectToProject(
      makeProjectRow({ color: "#22c55e", deadline: "2026-03-01T00:00:00.000Z" })
    );
    expect(project.color).toBe("#22c55e");
    expect(project.deadline).toBe("2026-03-01T00:00:00.000Z");
  });
});

describe("projectToDbRow", () => {
  it("maps app fields back to snake_case", () => {
    const row = projectToDbRow(
      {
        id: "p1",
        name: "Website Relaunch",
        color: "#ff6b3d",
        icon: "Folder",
        status: "active",
        isFavorite: true,
        lastAccessedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      "u1"
    );
    expect(row).toMatchObject({
      id: "p1",
      owner_id: "u1",
      name: "Website Relaunch",
      is_favorite: true,
      deadline: null,
    });
  });
});

describe("projectPatchToDbUpdate", () => {
  it("only includes keys present in the patch", () => {
    const update = projectPatchToDbUpdate({ isFavorite: true });
    expect(update).toEqual({ is_favorite: true });
  });

  it("maps a deadline update", () => {
    const update = projectPatchToDbUpdate({ deadline: "2026-05-01T00:00:00.000Z" });
    expect(update).toEqual({ deadline: "2026-05-01T00:00:00.000Z" });
  });
});
