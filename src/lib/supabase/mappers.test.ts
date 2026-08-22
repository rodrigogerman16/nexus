import { describe, expect, it } from "vitest";
import {
  activityToDbRow,
  dbActivityToActivity,
  dbEventToEvent,
  dbGoalToGoal,
  dbHabitToHabit,
  dbNoteToNote,
  dbNotificationToNotification,
  dbProjectToProject,
  dbTaskToTask,
  eventPatchToDbUpdate,
  eventToDbRow,
  goalPatchToDbUpdate,
  goalToDbRow,
  habitPatchToDbUpdate,
  habitToDbRow,
  notePatchToDbUpdate,
  noteToDbRow,
  notificationToDbRow,
  projectPatchToDbUpdate,
  projectToDbRow,
  taskPatchToDbUpdate,
  taskToDbRow,
} from "@/lib/supabase/mappers";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
type EventRow = Database["public"]["Tables"]["calendar_events"]["Row"];
type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

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

function makeNoteRow(overrides: Partial<NoteRow> = {}): NoteRow {
  return {
    id: "n1",
    owner_id: "u1",
    project_id: null,
    title: "Note",
    content: "Some content",
    tags: [],
    is_favorite: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeEventRow(overrides: Partial<EventRow> = {}): EventRow {
  return {
    id: "e1",
    owner_id: "u1",
    project_id: null,
    title: "Event",
    description: null,
    start_time: "2026-01-01T09:00:00.000Z",
    end_time: "2026-01-01T10:00:00.000Z",
    all_day: false,
    color: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeHabitRow(overrides: Partial<HabitRow> = {}): HabitRow {
  return {
    id: "h1",
    owner_id: "u1",
    name: "Habit",
    color: null,
    frequency: "daily",
    target_per_week: 5,
    completions: {},
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeGoalRow(overrides: Partial<GoalRow> = {}): GoalRow {
  return {
    id: "g1",
    owner_id: "u1",
    title: "Goal",
    description: null,
    progress: 0,
    target_date: null,
    linked_habit_ids: [],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeNotificationRow(overrides: Partial<NotificationRow> = {}): NotificationRow {
  return {
    id: "notif1",
    owner_id: "u1",
    type: "task_due",
    title: "Notification",
    body: null,
    is_read: false,
    related_entity_type: null,
    related_entity_id: null,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeActivityRow(overrides: Partial<ActivityRow> = {}): ActivityRow {
  return {
    id: "a1",
    owner_id: "u1",
    project_id: null,
    type: "task_created",
    description: "Created a task",
    related_entity_type: null,
    related_entity_id: null,
    created_at: "2026-01-01T00:00:00.000Z",
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

describe("dbNoteToNote", () => {
  it("maps is_favorite to pinned and nulls to undefined", () => {
    const note = dbNoteToNote(makeNoteRow({ is_favorite: true, project_id: null }));
    expect(note.pinned).toBe(true);
    expect(note.projectId).toBeUndefined();
  });

  it("carries through tags and a populated project_id", () => {
    const note = dbNoteToNote(makeNoteRow({ tags: ["ideas"], project_id: "p1" }));
    expect(note.tags).toEqual(["ideas"]);
    expect(note.projectId).toBe("p1");
  });
});

describe("noteToDbRow", () => {
  it("maps pinned back to is_favorite", () => {
    const row = noteToDbRow(
      {
        id: "n1",
        title: "Note",
        content: "Content",
        tags: [],
        pinned: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      "u1"
    );
    expect(row).toMatchObject({ is_favorite: true, owner_id: "u1", project_id: null });
  });
});

describe("notePatchToDbUpdate", () => {
  it("only includes keys present in the patch", () => {
    expect(notePatchToDbUpdate({ pinned: false })).toEqual({ is_favorite: false });
  });

  it("maps a tags update", () => {
    expect(notePatchToDbUpdate({ tags: ["work", "urgent"] })).toEqual({
      tags: ["work", "urgent"],
    });
  });
});

describe("dbEventToEvent", () => {
  it("maps start_time/end_time/all_day to app field names", () => {
    const event = dbEventToEvent(makeEventRow({ all_day: true }));
    expect(event).toMatchObject({
      start: "2026-01-01T09:00:00.000Z",
      end: "2026-01-01T10:00:00.000Z",
      allDay: true,
    });
  });

  it("maps a null color/description to undefined", () => {
    const event = dbEventToEvent(makeEventRow());
    expect(event.color).toBeUndefined();
    expect(event.description).toBeUndefined();
  });
});

describe("eventToDbRow", () => {
  it("maps app field names back to snake_case, defaulting allDay to false", () => {
    const row = eventToDbRow(
      {
        id: "e1",
        title: "Standup",
        start: "2026-01-01T09:00:00.000Z",
        end: "2026-01-01T09:15:00.000Z",
      },
      "u1"
    );
    expect(row).toMatchObject({
      start_time: "2026-01-01T09:00:00.000Z",
      end_time: "2026-01-01T09:15:00.000Z",
      all_day: false,
      owner_id: "u1",
    });
  });
});

describe("eventPatchToDbUpdate", () => {
  it("only includes keys present in the patch", () => {
    expect(eventPatchToDbUpdate({ title: "Renamed" })).toEqual({ title: "Renamed" });
  });

  it("maps start/end patches to snake_case", () => {
    const update = eventPatchToDbUpdate({
      start: "2026-02-01T00:00:00.000Z",
      end: "2026-02-01T01:00:00.000Z",
    });
    expect(update).toEqual({
      start_time: "2026-02-01T00:00:00.000Z",
      end_time: "2026-02-01T01:00:00.000Z",
    });
  });
});

describe("dbHabitToHabit", () => {
  it("falls back to a default color and empty completions", () => {
    const habit = dbHabitToHabit(makeHabitRow());
    expect(habit.color).toBe("#ff6b3d");
    expect(habit.completions).toEqual({});
  });

  it("carries through completions and targetPerWeek", () => {
    const habit = dbHabitToHabit(
      makeHabitRow({ completions: { "2026-01-05": true }, target_per_week: 3 })
    );
    expect(habit.completions).toEqual({ "2026-01-05": true });
    expect(habit.targetPerWeek).toBe(3);
  });
});

describe("habitToDbRow / habitPatchToDbUpdate", () => {
  it("maps app fields to snake_case", () => {
    const row = habitToDbRow(
      {
        id: "h1",
        name: "Read",
        color: "#22c55e",
        frequency: "weekly",
        targetPerWeek: 3,
        completions: {},
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      "u1"
    );
    expect(row).toMatchObject({ owner_id: "u1", target_per_week: 3, frequency: "weekly" });
  });

  it("only includes patched keys", () => {
    expect(habitPatchToDbUpdate({ completions: { "2026-01-05": true } })).toEqual({
      completions: { "2026-01-05": true },
    });
  });
});

describe("dbGoalToGoal", () => {
  it("maps target_date/linked_habit_ids and nulls to undefined/empty", () => {
    const goal = dbGoalToGoal(makeGoalRow());
    expect(goal.targetDate).toBeUndefined();
    expect(goal.linkedHabitIds).toEqual([]);
  });

  it("carries through a populated target_date and linked habits", () => {
    const goal = dbGoalToGoal(
      makeGoalRow({ target_date: "2026-06-01T00:00:00.000Z", linked_habit_ids: ["h1", "h2"] })
    );
    expect(goal.targetDate).toBe("2026-06-01T00:00:00.000Z");
    expect(goal.linkedHabitIds).toEqual(["h1", "h2"]);
  });
});

describe("goalToDbRow / goalPatchToDbUpdate", () => {
  it("maps app fields to snake_case", () => {
    const row = goalToDbRow(
      { id: "g1", title: "Ship v2", progress: 10, linkedHabitIds: [] },
      "u1"
    );
    expect(row).toMatchObject({ owner_id: "u1", title: "Ship v2", target_date: null });
  });

  it("only includes patched keys", () => {
    expect(goalPatchToDbUpdate({ progress: 75 })).toEqual({ progress: 75 });
  });
});

describe("dbNotificationToNotification", () => {
  it("maps is_read to isRead and a null body to undefined", () => {
    const notification = dbNotificationToNotification(makeNotificationRow({ is_read: true }));
    expect(notification.isRead).toBe(true);
    expect(notification.body).toBeUndefined();
  });
});

describe("notificationToDbRow", () => {
  it("maps isRead back to is_read", () => {
    const row = notificationToDbRow(
      {
        id: "notif1",
        type: "task_due",
        title: "Due soon",
        isRead: false,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      "u1"
    );
    expect(row).toMatchObject({ owner_id: "u1", is_read: false, body: null });
  });
});

describe("dbActivityToActivity", () => {
  it("maps related_entity_id to taskId only when related_entity_type is 'task'", () => {
    const activity = dbActivityToActivity(
      makeActivityRow({ related_entity_type: "task", related_entity_id: "t1" })
    );
    expect(activity.taskId).toBe("t1");
  });

  it("leaves taskId undefined for a non-task related entity", () => {
    const activity = dbActivityToActivity(
      makeActivityRow({ related_entity_type: "project", related_entity_id: "p1" })
    );
    expect(activity.taskId).toBeUndefined();
  });

  it("carries through project_id", () => {
    const activity = dbActivityToActivity(makeActivityRow({ project_id: "p1" }));
    expect(activity.projectId).toBe("p1");
  });
});

describe("activityToDbRow", () => {
  it("sets related_entity_type to 'task' only when taskId is present", () => {
    const row = activityToDbRow(
      {
        id: "a1",
        type: "task_completed",
        description: "Completed a task",
        taskId: "t1",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      "u1"
    );
    expect(row).toMatchObject({ related_entity_type: "task", related_entity_id: "t1" });
  });

  it("leaves related_entity fields null without a taskId", () => {
    const row = activityToDbRow(
      {
        id: "a1",
        type: "project_created",
        description: "Created a project",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      "u1"
    );
    expect(row).toMatchObject({ related_entity_type: null, related_entity_id: null });
  });
});
