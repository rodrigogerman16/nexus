import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { computeTimeOfDayInsight } from "@/lib/ai/insights";
import { isSameDay, toDateKey } from "@/lib/utils";
import { getSeenIds, markSeen } from "@/lib/dedupeOncePerDay";

/**
 * Generates the notification types spec §26 lists that aren't tied to a
 * single user action (task due soon, calendar reminder, AI suggestion) —
 * as opposed to "task completed" / "project updated", which fire directly
 * from useTasksStore's mutations. A client-only app has no background
 * scheduler, so this runs once per hydrate (see useHydrateStores) as the
 * practical stand-in for a recurring check, with each notification deduped
 * per calendar day via localStorage so reloading doesn't repeat them.
 */
export function generateAmbientNotifications() {
  const settings = useSettingsStore.getState();
  const { addNotification } = useNotificationsStore.getState();
  const today = new Date();
  const dateKey = toDateKey(today);

  if (settings.notifyTaskReminders) {
    const seen = getSeenIds("task_due", dateKey);
    const dueToday = useTasksStore
      .getState()
      .tasks.filter(
        (t) => !t.parentTaskId && t.status !== "completed" && t.dueDate && isSameDay(t.dueDate, today)
      );
    for (const task of dueToday) {
      if (seen.has(task.id)) continue;
      addNotification({ type: "task_due", title: `"${task.title}" is due today`, body: `${task.priority} priority` });
      markSeen("task_due", dateKey, task.id);
    }
  }

  if (settings.notifyCalendarReminders) {
    const seen = getSeenIds("calendar_reminder", dateKey);
    const todaysEvents = useLifeStore.getState().events.filter((e) => isSameDay(e.start, today));
    for (const event of todaysEvents) {
      if (seen.has(event.id)) continue;
      addNotification({
        type: "calendar_reminder",
        title: `"${event.title}" is today`,
        body: new Date(event.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      });
      markSeen("calendar_reminder", dateKey, event.id);
    }
  }

  const seenSuggestion = getSeenIds("ai_suggestion", dateKey);
  if (!seenSuggestion.has("shown")) {
    const insight = computeTimeOfDayInsight(useActivityStore.getState().activities, useTasksStore.getState().tasks);
    if (insight) {
      addNotification({ type: "ai_suggestion", title: "NEXUS noticed something", body: insight });
      markSeen("ai_suggestion", dateKey, "shown");
    }
  }
}

/**
 * Logs "NEXUS generated your daily briefing" to the activity feed (spec
 * §27's own example entry) once per calendar day. Lives here rather than in
 * AIBriefCard itself: that card mounts as a child of the app shell, so its
 * own effects commit *before* useHydrateStores' — calling addActivity from
 * there would race hydration and fire while userId is still null, meaning
 * the write never reaches Supabase and gets silently overwritten the moment
 * hydration's `set({ activities: data... })` lands.
 */
export function logDailyBriefingActivity() {
  const dateKey = toDateKey(new Date());
  if (getSeenIds("ai_briefing", dateKey).has("shown")) return;
  useActivityStore.getState().addActivity({
    type: "ai_briefing",
    description: "NEXUS generated your daily briefing",
  });
  markSeen("ai_briefing", dateKey, "shown");
}
