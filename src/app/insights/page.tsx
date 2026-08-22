"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FolderKanban,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { StatTile } from "@/components/insights/StatTile";
import { WeeklyCheckInsChart } from "@/components/insights/WeeklyCheckInsChart";
import { WeeklyActivityChart } from "@/components/insights/WeeklyActivityChart";
import { ProjectProgressChart } from "@/components/insights/ProjectProgressChart";
import {
  computeBestHabitDay,
  computeFocusTimeMinutes,
  computeMostProductiveDay,
  computeTimeOfDayInsight,
  formatFocusTime,
} from "@/lib/ai/insights";

export default function InsightsPage() {
  const tasks = useTasksStore((s) => s.tasks);
  const projects = useTasksStore((s) => s.projects);
  const habits = useLifeStore((s) => s.habits);
  const activities = useActivityStore((s) => s.activities);

  const stats = useMemo(() => {
    const topLevel = tasks.filter((t) => !t.parentTaskId);
    const completed = topLevel.filter((t) => t.status === "completed").length;
    const completionRate = topLevel.length ? Math.round((completed / topLevel.length) * 100) : 0;
    const activeProjects = projects.filter((p) => p.status === "active").length;
    const now = new Date();
    const overdue = topLevel.filter(
      (t) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < now
    ).length;
    const focusMinutes = computeFocusTimeMinutes(tasks);
    return { completed, completionRate, activeProjects, overdue, focusMinutes };
  }, [tasks, projects]);

  const mostProductiveDay = useMemo(() => computeMostProductiveDay(activities), [activities]);
  const bestDay = useMemo(() => computeBestHabitDay(habits), [habits]);
  const timeOfDayInsight = useMemo(
    () => computeTimeOfDayInsight(activities, tasks),
    [activities, tasks]
  );

  const insights = [
    timeOfDayInsight,
    bestDay
      ? `You check off the most habits on ${bestDay}s, based on your tracked history. Consider scheduling your hardest habit earlier in the days that tend to slip.`
      : null,
  ].filter((i): i is string => i !== null);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <h1 className="mb-6 text-lg font-semibold tracking-tight">Insights</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="Tasks completed" value={String(stats.completed)} icon={CheckCircle2} />
        <StatTile label="Completion rate" value={`${stats.completionRate}%`} icon={TrendingUp} />
        <StatTile label="Focus time" value={formatFocusTime(stats.focusMinutes)} icon={Clock} />
        <StatTile label="Active projects" value={String(stats.activeProjects)} icon={FolderKanban} />
        <StatTile label="Overdue tasks" value={String(stats.overdue)} icon={AlertTriangle} />
        <StatTile
          label="Most productive day"
          value={mostProductiveDay ?? "—"}
          icon={CalendarDays}
          hint={mostProductiveDay ? undefined : "Complete a few tasks to see this"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">
            Weekly activity — tasks completed
          </h2>
          <WeeklyActivityChart />
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">
            Habit check-ins — last 7 days
          </h2>
          <WeeklyCheckInsChart />
        </div>
      </div>

      <div className="mt-6 rounded-md border border-border bg-surface p-4">
        <h2 className="mb-4 text-sm font-semibold tracking-tight">Project progress</h2>
        <ProjectProgressChart />
      </div>

      <div className="bg-grain relative mt-6 overflow-hidden rounded-xl border border-border bg-surface-raised p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-semibold">NEXUS noticed</h3>
        </div>
        {insights.length > 0 ? (
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="text-sm leading-relaxed text-foreground">
                {insight}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Keep completing tasks and tracking habits — NEXUS will start surfacing real patterns
            here once there&rsquo;s enough history to be confident about.
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
