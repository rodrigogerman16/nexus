import type { ActivityItem, Habit, Task } from "@/lib/store/types";

export function formatFocusTime(minutes: number): string {
  if (minutes === 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Time actually invested, estimated from completed tasks' duration
 * estimates — includes subtasks, since each represents real completed
 * work even though subtasks are hidden from top-level task counts. */
export function computeFocusTimeMinutes(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "completed" && t.estimatedDurationMinutes)
    .reduce((sum, t) => sum + (t.estimatedDurationMinutes ?? 0), 0);
}

/**
 * The weekday with the most completed tasks across all history — the
 * "Most productive days" figure spec §28 lists as its own metric,
 * distinct from the Weekly Activity chart's last-7-days bars. Mirrors
 * computeBestHabitDay's weekday-tally approach, applied to task
 * completions instead of habit check-ins.
 */
export function computeMostProductiveDay(activities: ActivityItem[]): string | null {
  const totalsByWeekday = [0, 0, 0, 0, 0, 0, 0];
  for (const activity of activities) {
    if (activity.type !== "task_completed") continue;
    totalsByWeekday[new Date(activity.createdAt).getDay()] += 1;
  }
  const max = Math.max(...totalsByWeekday);
  if (max === 0) return null;
  const weekdayIndex = totalsByWeekday.indexOf(max);
  // An arbitrary Sunday-anchored week — only used to resolve a weekday name.
  return new Date(2024, 0, 7 + weekdayIndex).toLocaleDateString(undefined, { weekday: "long" });
}

export function computeBestHabitDay(habits: Habit[]): string | null {
  const totalsByWeekday = [0, 0, 0, 0, 0, 0, 0];
  for (const habit of habits) {
    for (const key of Object.keys(habit.completions)) {
      if (!habit.completions[key]) continue;
      const weekday = new Date(`${key}T00:00:00`).getDay();
      totalsByWeekday[weekday] += 1;
    }
  }
  const max = Math.max(...totalsByWeekday);
  if (max === 0) return null;
  const weekdayIndex = totalsByWeekday.indexOf(max);
  // An arbitrary Sunday-anchored week — only used to resolve a weekday name.
  return new Date(2024, 0, 7 + weekdayIndex).toLocaleDateString(undefined, { weekday: "long" });
}

/**
 * Cross-references completed-task activity log entries with each task's
 * priority to check for a real time-of-day pattern — the exact shape of
 * insight the spec calls out (§29). Requires a handful of high/critical
 * completions with known times before it will claim a pattern; returns
 * null rather than guessing from too little data.
 */
export function computeTimeOfDayInsight(activities: ActivityItem[], tasks: Task[]): string | null {
  const completions = activities
    .filter((a) => a.type === "task_completed" && a.taskId)
    .map((a) => {
      const task = tasks.find((t) => t.id === a.taskId);
      if (!task) return null;
      return { priority: task.priority, beforeNoon: new Date(a.createdAt).getHours() < 12 };
    })
    .filter((c): c is { priority: Task["priority"]; beforeNoon: boolean } => c !== null);

  const highPriority = completions.filter((c) => c.priority === "high" || c.priority === "critical");
  if (highPriority.length < 3) return null;

  const beforeNoonCount = highPriority.filter((c) => c.beforeNoon).length;
  const pct = Math.round((beforeNoonCount / highPriority.length) * 100);

  if (pct >= 65) {
    return `You tend to complete high-priority tasks more consistently before 12:00 — ${pct}% of your last ${highPriority.length}. Scheduling your most important work in the first half of the day could keep that streak going.`;
  }
  if (pct <= 35) {
    return `Your high-priority tasks tend to get finished in the afternoon — only ${pct}% of your last ${highPriority.length} were done before 12:00. If that's not by choice, moving important work earlier might help it land sooner.`;
  }
  return null;
}
