import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { isSameDay } from "@/lib/utils";
import type { AIContext } from "@/lib/ai/context";

const SYSTEM_PREAMBLE =
  "You are NEXUS, an AI assistant embedded in a personal productivity app " +
  "(tasks, projects, notes, calendar). Be concise and directly helpful — a " +
  "few sentences, not an essay, unless the question calls for a list. Use " +
  "**bold** sparingly for key terms. Only reference the data given to you " +
  "below; never invent tasks, dates, or people. If you don't have enough " +
  "information to answer, say so plainly.";

function dashboardSummary(): string {
  const { tasks, projects } = useTasksStore.getState();
  const { events } = useLifeStore.getState();
  const today = new Date();
  const topLevel = tasks.filter((t) => !t.parentTaskId && t.status !== "completed");

  const dueToday = topLevel.filter((t) => t.dueDate && isSameDay(t.dueDate, today));
  const overdue = topLevel.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today && !isSameDay(t.dueDate, today)
  );
  const activeProjects = projects.filter((p) => p.status === "active");
  const todaysEvents = events.filter((e) => isSameDay(e.start, today));

  const lines = [
    overdue.length
      ? `Overdue tasks: ${overdue.map((t) => `"${t.title}" (${t.priority})`).join(", ")}`
      : "Overdue tasks: none",
    dueToday.length
      ? `Due today: ${dueToday.map((t) => `"${t.title}" (${t.priority})`).join(", ")}`
      : "Due today: none",
    activeProjects.length
      ? `Active projects: ${activeProjects.map((p) => `"${p.name}"`).join(", ")}`
      : "Active projects: none",
    todaysEvents.length
      ? `Today's calendar: ${todaysEvents.map((e) => `"${e.title}"`).join(", ")}`
      : "Today's calendar: nothing scheduled",
  ];
  return lines.join("\n");
}

/**
 * Builds the system prompt for a real LLM call from the same live app state
 * the mock heuristics read (src/lib/ai/service.ts) — keeps the real and
 * mock paths answering from the same facts, just with different reasoning.
 */
export function buildSystemPrompt(context: AIContext): string {
  switch (context.type) {
    case "dashboard":
    case "tasks":
    case "calendar":
      return `${SYSTEM_PREAMBLE}\n\nCurrent state:\n${dashboardSummary()}`;

    case "project": {
      const { project, tasks } = context;
      const taskLines = tasks.length
        ? tasks
            .map((t) => `- [${t.status}] ${t.title}${t.dueDate ? ` (due ${t.dueDate})` : ""} — ${t.priority} priority`)
            .join("\n")
        : "(no tasks yet)";
      return (
        `${SYSTEM_PREAMBLE}\n\nYou're scoped to the project "${project.name}" ` +
        `(status: ${project.status}${project.deadline ? `, deadline ${project.deadline}` : ", no deadline set"}).\n` +
        `Its tasks:\n${taskLines}`
      );
    }

    case "note": {
      const { note } = context;
      return (
        `${SYSTEM_PREAMBLE}\n\nYou're scoped to the note titled "${note.title}". Its content:\n\n` +
        (note.content.trim() || "(empty note)")
      );
    }
  }
}
