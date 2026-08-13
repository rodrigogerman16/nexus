"use client";

import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { isSameDay } from "@/lib/utils";

export function DailyOverview() {
  const tasks = useTasksStore((s) => s.tasks);
  const projects = useTasksStore((s) => s.projects);
  const events = useLifeStore((s) => s.events);
  const today = new Date();

  const dueTodayTasks = tasks.filter((t) => !t.parentTaskId && t.dueDate && isSameDay(t.dueDate, today));
  const dueTodayCount = dueTodayTasks.filter((t) => t.status !== "completed").length;
  const completedTodayCount = dueTodayTasks.filter((t) => t.status === "completed").length;
  const eventsTodayCount = events.filter((e) => isSameDay(e.start, today)).length;
  const activeProjectsCount = projects.filter((p) => p.status === "active").length;

  const totalToday = dueTodayTasks.length;
  const progressPct = totalToday ? Math.round((completedTodayCount / totalToday) * 100) : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-border bg-surface px-4 py-3.5">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight">{today.getDate()}</span>
        <span className="text-sm text-muted-foreground">
          {today.toLocaleDateString(undefined, { weekday: "long", month: "long" })}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{dueTodayCount}</span> task
          {dueTodayCount === 1 ? "" : "s"}
        </span>
        <span>
          <span className="font-semibold text-foreground">{eventsTodayCount}</span> meeting
          {eventsTodayCount === 1 ? "" : "s"}
        </span>
        <span>
          <span className="font-semibold text-foreground">{activeProjectsCount}</span> active project
          {activeProjectsCount === 1 ? "" : "s"}
        </span>
      </div>

      {progressPct !== null && (
        <div className="flex items-center gap-2.5" title={`${completedTodayCount} of ${totalToday} today's tasks completed`}>
          <span className="text-xs text-muted-foreground">Today</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="w-9 text-xs font-medium text-foreground">{progressPct}%</span>
        </div>
      )}
    </div>
  );
}
