import { beforeEach, describe, expect, it } from "vitest";
import { generateAmbientNotifications, logDailyBriefingActivity } from "@/lib/notifications/generateAmbient";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";

function isoToday(hour = 9) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

beforeEach(() => {
  localStorage.clear();
  useTasksStore.setState({ tasks: [], projects: [], userId: null, status: "idle" });
  useLifeStore.setState({ events: [], habits: [], goals: [], userId: null, status: "idle" });
  useActivityStore.setState({ activities: [], userId: null, status: "idle" });
  useNotificationsStore.setState({ notifications: [], userId: null, status: "idle" });
  useSettingsStore.setState({ notifyTaskReminders: true, notifyCalendarReminders: true });
});

describe("generateAmbientNotifications", () => {
  it("raises a task_due notification for a task due today", () => {
    useTasksStore.setState({
      tasks: [
        {
          id: "t1",
          title: "Finish deck",
          status: "todo",
          priority: "high",
          dueDate: isoToday(),
        } as never,
      ],
    });
    generateAmbientNotifications();
    expect(useNotificationsStore.getState().notifications).toContainEqual(
      expect.objectContaining({ type: "task_due", title: '"Finish deck" is due today' })
    );
  });

  it("does not raise task_due when the setting is off", () => {
    useSettingsStore.setState({ notifyTaskReminders: false });
    useTasksStore.setState({
      tasks: [{ id: "t1", title: "Finish deck", status: "todo", priority: "high", dueDate: isoToday() } as never],
    });
    generateAmbientNotifications();
    expect(useNotificationsStore.getState().notifications).toHaveLength(0);
  });

  it("does not re-notify the same task on a second call the same day", () => {
    useTasksStore.setState({
      tasks: [{ id: "t1", title: "Finish deck", status: "todo", priority: "high", dueDate: isoToday() } as never],
    });
    generateAmbientNotifications();
    generateAmbientNotifications();
    expect(useNotificationsStore.getState().notifications).toHaveLength(1);
  });

  it("raises a calendar_reminder notification for an event today", () => {
    useLifeStore.setState({
      events: [
        { id: "e1", title: "Standup", start: isoToday(9), end: isoToday(9.5), color: "#fff" } as never,
      ],
    });
    generateAmbientNotifications();
    expect(useNotificationsStore.getState().notifications).toContainEqual(
      expect.objectContaining({ type: "calendar_reminder" })
    );
  });

  it("raises an ai_suggestion notification when a real insight is available", () => {
    useTasksStore.setState({
      tasks: [
        { id: "t1", title: "A", status: "completed", priority: "high" } as never,
        { id: "t2", title: "B", status: "completed", priority: "high" } as never,
        { id: "t3", title: "C", status: "completed", priority: "critical" } as never,
      ],
    });
    useActivityStore.setState({
      activities: [
        { id: "a1", type: "task_completed", description: "", taskId: "t1", createdAt: isoToday(8) } as never,
        { id: "a2", type: "task_completed", description: "", taskId: "t2", createdAt: isoToday(9) } as never,
        { id: "a3", type: "task_completed", description: "", taskId: "t3", createdAt: isoToday(10) } as never,
      ],
    });
    generateAmbientNotifications();
    expect(useNotificationsStore.getState().notifications).toContainEqual(
      expect.objectContaining({ type: "ai_suggestion" })
    );
  });
});

describe("logDailyBriefingActivity", () => {
  it("logs an ai_briefing activity entry once per day", () => {
    logDailyBriefingActivity();
    logDailyBriefingActivity();
    const entries = useActivityStore.getState().activities.filter((a) => a.type === "ai_briefing");
    expect(entries).toHaveLength(1);
    expect(entries[0].description).toBe("NEXUS generated your daily briefing");
  });
});
