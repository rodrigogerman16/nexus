import type { Project, Task } from "@/lib/store/types";
import { priorityOrder } from "@/components/tasks/taskMeta";

function nextTask(tasks: Task[]): Task | undefined {
  const incomplete = tasks.filter((t) => t.status !== "completed");
  if (incomplete.length === 0) return undefined;
  const withDue = [...incomplete]
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  if (withDue.length > 0) return withDue[0];
  return [...incomplete].sort(
    (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
  )[0];
}

function progressStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, progress };
}

function whatsNext(project: Project, tasks: Task[]): string {
  const { total, completed, progress } = progressStats(tasks);
  const next = nextTask(tasks);
  if (!next) {
    return total === 0
      ? `"${project.name}" doesn't have any tasks yet. Add a few to get started.`
      : `Every task on "${project.name}" is done — ${completed}/${total} complete. Nice work.`;
  }
  const dueText = next.dueDate
    ? ` It's due ${new Date(next.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}.`
    : "";
  return `I'd focus on **${next.title}** next — it's ${next.dueDate ? "the soonest due" : `your highest-priority open task (${next.priority})`} on "${project.name}".${dueText} You're at ${progress}% overall (${completed}/${total} tasks).`;
}

function scheduleAnalysis(project: Project, tasks: Task[]): string {
  const { total, completed, progress } = progressStats(tasks);
  if (!project.deadline) {
    return `"${project.name}" doesn't have a deadline set, so there's no schedule to be behind on. You're at ${progress}% complete (${completed}/${total} tasks).`;
  }

  const deadline = new Date(project.deadline).getTime();
  const created = new Date(project.createdAt).getTime();
  const now = Date.now();
  const daysLeft = Math.ceil((deadline - now) / 86_400_000);
  const overdueTasks = tasks.filter(
    (t) => t.status !== "completed" && t.dueDate && new Date(t.dueDate).getTime() < now
  );

  if (daysLeft < 0) {
    return `The deadline was ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago and "${project.name}" is at ${progress}% (${completed}/${total} tasks).${
      overdueTasks.length > 0
        ? ` ${overdueTasks.length} task${overdueTasks.length === 1 ? " is" : "s are"} overdue — worth reviewing whether the deadline needs to move.`
        : ""
    }`;
  }

  const totalSpan = deadline - created;
  const elapsed = now - created;
  const expectedProgress = totalSpan > 0 ? Math.min(100, Math.round((elapsed / totalSpan) * 100)) : 100;

  if (progress < expectedProgress - 15) {
    const next = nextTask(tasks);
    return `Based on the timeline, "${project.name}" would typically be around ${expectedProgress}% done by now — it's at ${progress}%. ${
      overdueTasks.length > 0 ? `${overdueTasks.length} task${overdueTasks.length === 1 ? " is" : "s are"} already overdue. ` : ""
    }${next ? `Starting with **${next.title}** would help close the gap.` : ""}`;
  }

  return `"${project.name}" looks roughly on pace — ${progress}% complete with ${daysLeft} day${daysLeft === 1 ? "" : "s"} left until the deadline.`;
}

function statusSummary(project: Project, tasks: Task[]): string {
  const { total, completed, progress } = progressStats(tasks);
  const remaining = total - completed;
  const deadlineText = project.deadline
    ? ` Deadline is ${new Date(project.deadline).toLocaleDateString(undefined, { month: "long", day: "numeric" })}.`
    : "";
  return `"${project.name}" is ${progress}% complete — ${completed} done, ${remaining} remaining.${deadlineText}`;
}

/**
 * Small keyword-matching "AI" scoped to a single project — enough to make the
 * project assistant feel context-aware without an LLM. Mirrors the pattern in
 * lib/mock/ai.ts but only reasons about the tasks/dates it's actually given.
 */
export function generateProjectResponse(question: string, project: Project, tasks: Task[]): string {
  const lower = question.toLowerCase();

  if (/(what|which).*(next|focus|priorit)/.test(lower) || /next\b/.test(lower)) {
    return whatsNext(project, tasks);
  }
  if (/(behind|on track|on schedule|schedule)/.test(lower)) {
    return scheduleAnalysis(project, tasks);
  }
  return statusSummary(project, tasks);
}
