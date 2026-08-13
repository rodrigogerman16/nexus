"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FolderKanban, Sparkles, TrendingUp } from "lucide-react";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { StatTile } from "@/components/insights/StatTile";
import { WeeklyCheckInsChart } from "@/components/insights/WeeklyCheckInsChart";

export default function InsightsPage() {
  const tasks = useTasksStore((s) => s.tasks);
  const projects = useTasksStore((s) => s.projects);
  const habits = useLifeStore((s) => s.habits);

  const stats = useMemo(() => {
    const topLevel = tasks.filter((t) => !t.parentTaskId);
    const completed = topLevel.filter((t) => t.status === "completed").length;
    const completionRate = topLevel.length ? Math.round((completed / topLevel.length) * 100) : 0;
    const activeProjects = projects.filter((p) => p.status === "active").length;
    const now = new Date();
    const overdue = topLevel.filter(
      (t) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < now
    ).length;
    return { completed, completionRate, activeProjects, overdue };
  }, [tasks, projects]);

  const bestDay = useMemo(() => {
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
    const label = new Date(2024, 0, 7 + weekdayIndex).toLocaleDateString(undefined, {
      weekday: "long",
    });
    return label;
  }, [habits]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <h1 className="mb-6 text-lg font-semibold tracking-tight">Insights</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Tasks completed" value={String(stats.completed)} icon={CheckCircle2} />
        <StatTile label="Completion rate" value={`${stats.completionRate}%`} icon={TrendingUp} />
        <StatTile label="Active projects" value={String(stats.activeProjects)} icon={FolderKanban} />
        <StatTile label="Overdue tasks" value={String(stats.overdue)} icon={AlertTriangle} />
      </div>

      <div className="mt-6 rounded-md border border-border bg-surface p-4">
        <h2 className="mb-4 text-sm font-semibold tracking-tight">
          Habit check-ins — last 7 days
        </h2>
        <WeeklyCheckInsChart />
      </div>

      <div className="bg-grain relative mt-6 overflow-hidden rounded-xl border border-border bg-surface-raised p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-semibold">NEXUS noticed</h3>
        </div>
        {bestDay ? (
          <p className="text-sm leading-relaxed text-foreground">
            You check off the most habits on <span className="font-medium">{bestDay}s</span>,
            based on the last 30 days of activity. Consider scheduling your hardest habit
            earlier in the days that tend to slip.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Keep tracking habits for a few more days and NEXUS will start surfacing patterns
            here.
          </p>
        )}
        <Link
          href="/chat"
          className="focus-ring mt-3 inline-flex h-8 items-center rounded-lg border border-border bg-surface-sunken px-3 text-sm font-medium text-foreground transition-colors hover:bg-border"
        >
          Ask the assistant
        </Link>
      </div>
    </div>
  );
}
