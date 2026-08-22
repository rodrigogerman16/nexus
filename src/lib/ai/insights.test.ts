import { describe, expect, it } from "vitest";
import {
  computeBestHabitDay,
  computeFocusTimeMinutes,
  computeMostProductiveDay,
  computeTimeOfDayInsight,
  formatFocusTime,
} from "@/lib/ai/insights";
import type { ActivityItem, Habit, Task } from "@/lib/store/types";

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: "Task",
    status: "todo",
    priority: "medium",
    tags: [],
    position: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeHabit(overrides: Partial<Habit> & { id: string }): Habit {
  return {
    name: "Habit",
    color: "#000000",
    frequency: "daily",
    targetPerWeek: 7,
    completions: {},
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeActivity(overrides: Partial<ActivityItem> & { id: string }): ActivityItem {
  return {
    type: "task_completed",
    description: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("formatFocusTime", () => {
  it("formats zero minutes", () => {
    expect(formatFocusTime(0)).toBe("0m");
  });

  it("formats minutes under an hour", () => {
    expect(formatFocusTime(45)).toBe("45m");
  });

  it("formats an exact number of hours", () => {
    expect(formatFocusTime(120)).toBe("2h");
  });

  it("formats hours and minutes together", () => {
    expect(formatFocusTime(125)).toBe("2h 5m");
  });
});

describe("computeFocusTimeMinutes", () => {
  it("sums duration only for completed tasks that have an estimate", () => {
    const tasks = [
      makeTask({ id: "1", status: "completed", estimatedDurationMinutes: 30 }),
      makeTask({ id: "2", status: "completed", estimatedDurationMinutes: 45 }),
      makeTask({ id: "3", status: "todo", estimatedDurationMinutes: 60 }),
      makeTask({ id: "4", status: "completed" }),
    ];
    expect(computeFocusTimeMinutes(tasks)).toBe(75);
  });

  it("returns 0 for an empty list", () => {
    expect(computeFocusTimeMinutes([])).toBe(0);
  });
});

describe("computeBestHabitDay", () => {
  it("returns null when there are no completions", () => {
    const habits = [makeHabit({ id: "h1" })];
    expect(computeBestHabitDay(habits)).toBeNull();
  });

  it("returns the weekday name with the most completions across habits", () => {
    // 2026-01-05 is a Monday; 2026-01-12 is the following Monday.
    const habits = [
      makeHabit({ id: "h1", completions: { "2026-01-05": true, "2026-01-12": true } }),
      makeHabit({ id: "h2", completions: { "2026-01-06": true } }),
    ];
    // Computed the same way the source does, so this stays correct under any locale.
    const expectedMonday = new Date(2024, 0, 8).toLocaleDateString(undefined, { weekday: "long" });
    expect(computeBestHabitDay(habits)).toBe(expectedMonday);
  });

  it("ignores false completion entries", () => {
    const habits = [makeHabit({ id: "h1", completions: { "2026-01-05": false } })];
    expect(computeBestHabitDay(habits)).toBeNull();
  });
});

describe("computeMostProductiveDay", () => {
  it("returns null when there are no task_completed activities", () => {
    expect(computeMostProductiveDay([])).toBeNull();
    expect(computeMostProductiveDay([makeActivity({ id: "a1", type: "task_created" })])).toBeNull();
  });

  it("returns the weekday name with the most task completions", () => {
    // 2026-01-05 and 2026-01-12 are both Mondays; 2026-01-06 is a Tuesday.
    const activities = [
      makeActivity({ id: "a1", createdAt: "2026-01-05T08:00:00.000Z" }),
      makeActivity({ id: "a2", createdAt: "2026-01-12T08:00:00.000Z" }),
      makeActivity({ id: "a3", createdAt: "2026-01-06T08:00:00.000Z" }),
    ];
    const expectedMonday = new Date(2024, 0, 8).toLocaleDateString(undefined, { weekday: "long" });
    expect(computeMostProductiveDay(activities)).toBe(expectedMonday);
  });
});

describe("computeTimeOfDayInsight", () => {
  it("returns null with fewer than 3 high/critical completions", () => {
    const tasks = [makeTask({ id: "t1", priority: "high" })];
    const activities = [
      makeActivity({ id: "a1", taskId: "t1", createdAt: "2026-01-01T08:00:00.000Z" }),
    ];
    expect(computeTimeOfDayInsight(activities, tasks)).toBeNull();
  });

  it("reports a morning pattern when >=65% of completions are before noon", () => {
    const tasks = [
      makeTask({ id: "t1", priority: "high" }),
      makeTask({ id: "t2", priority: "critical" }),
      makeTask({ id: "t3", priority: "high" }),
    ];
    const activities = [
      makeActivity({ id: "a1", taskId: "t1", createdAt: "2026-01-01T08:00:00.000Z" }),
      makeActivity({ id: "a2", taskId: "t2", createdAt: "2026-01-01T09:00:00.000Z" }),
      makeActivity({ id: "a3", taskId: "t3", createdAt: "2026-01-01T10:00:00.000Z" }),
    ];
    const result = computeTimeOfDayInsight(activities, tasks);
    expect(result).toContain("before 12:00");
  });

  it("reports an afternoon pattern when <=35% of completions are before noon", () => {
    const tasks = [
      makeTask({ id: "t1", priority: "high" }),
      makeTask({ id: "t2", priority: "critical" }),
      makeTask({ id: "t3", priority: "high" }),
    ];
    const activities = [
      makeActivity({ id: "a1", taskId: "t1", createdAt: "2026-01-01T14:00:00.000Z" }),
      makeActivity({ id: "a2", taskId: "t2", createdAt: "2026-01-01T15:00:00.000Z" }),
      makeActivity({ id: "a3", taskId: "t3", createdAt: "2026-01-01T16:00:00.000Z" }),
    ];
    const result = computeTimeOfDayInsight(activities, tasks);
    expect(result).toContain("afternoon");
  });

  it("returns null for a roughly even split", () => {
    const tasks = [
      makeTask({ id: "t1", priority: "high" }),
      makeTask({ id: "t2", priority: "critical" }),
      makeTask({ id: "t3", priority: "high" }),
      makeTask({ id: "t4", priority: "high" }),
    ];
    const activities = [
      makeActivity({ id: "a1", taskId: "t1", createdAt: "2026-01-01T08:00:00.000Z" }),
      makeActivity({ id: "a2", taskId: "t2", createdAt: "2026-01-01T09:00:00.000Z" }),
      makeActivity({ id: "a3", taskId: "t3", createdAt: "2026-01-01T14:00:00.000Z" }),
      makeActivity({ id: "a4", taskId: "t4", createdAt: "2026-01-01T15:00:00.000Z" }),
    ];
    expect(computeTimeOfDayInsight(activities, tasks)).toBeNull();
  });

  it("ignores activities whose task can't be found", () => {
    const activities = [
      makeActivity({ id: "a1", taskId: "missing", createdAt: "2026-01-01T08:00:00.000Z" }),
    ];
    expect(computeTimeOfDayInsight(activities, [])).toBeNull();
  });
});
