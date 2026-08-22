import { generateAIResponse, type AIResponse } from "@/lib/mock/ai";
import { generateProjectResponse } from "@/lib/ai/projectAssistant";
import {
  explainNote,
  extractTasksFromNote,
  findKeyPoints,
  generateChecklist,
  improveWriting,
  summarizeNote,
} from "@/lib/ai/noteActions";
import { planSchedule } from "@/lib/ai/planSchedule";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { isSameDay } from "@/lib/utils";
import type { AIContext } from "@/lib/ai/context";

function dashboardResponse(input: string): AIResponse | null {
  const lower = input.toLowerCase();
  const { tasks, projects } = useTasksStore.getState();
  const { events } = useLifeStore.getState();
  const topLevel = tasks.filter((t) => !t.parentTaskId);
  const today = new Date();

  // Daily brief — checked first because it overlaps in phrasing with the
  // schedule-planning intent below ("plan my day" vs "plan my afternoon").
  // Without this priority, "plan my day" would fall through to the
  // schedule-block planner instead of the tasks/schedule rundown it's
  // actually asking for.
  if (
    lower.includes("plan my day") ||
    lower.includes("what's on my plate") ||
    lower.includes("what is on my plate")
  ) {
    const dailyTasks = topLevel.filter((t) => t.status !== "completed").slice(0, 5);
    const dailyEvents = events.slice(0, 3);
    const taskLines = dailyTasks.map((t) => `- ${t.title}`).join("\n") || "- Nothing urgent on your list";
    const eventLines =
      dailyEvents
        .map(
          (e) =>
            `- ${e.title} at ${new Date(e.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
        )
        .join("\n") || "- No meetings scheduled";
    return {
      content: `Here's the shape of your day:\n\n**Tasks**\n${taskLines}\n\n**Schedule**\n${eventLines}\n\nWant me to add anything else to the list?`,
    };
  }

  if (/focus|priorit|what should i/.test(lower)) {
    const dueToday = topLevel.filter(
      (t) => t.status !== "completed" && t.dueDate && isSameDay(t.dueDate, today)
    );
    const overdue = topLevel.filter(
      (t) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < today && !isSameDay(t.dueDate, today)
    );
    const priorityOrder = ["critical", "high", "medium", "low"];
    const candidates = [...overdue, ...dueToday].sort(
      (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    );
    const meetingsToday = events.filter((e) => isSameDay(e.start, today)).length;
    if (candidates.length === 0) {
      return {
        content: `Nothing urgent on your plate today. ${meetingsToday > 0 ? `You do have ${meetingsToday} meeting${meetingsToday === 1 ? "" : "s"} — good day to get ahead on something.` : "Good day to get ahead on something."}`,
      };
    }
    const top = candidates[0];
    return {
      content: `I'd start with **${top.title}**${overdue.includes(top) ? " — it's overdue" : ""} (${top.priority} priority). You have ${candidates.length} task${candidates.length === 1 ? "" : "s"} that need attention today and ${meetingsToday} meeting${meetingsToday === 1 ? "" : "s"}.`,
    };
  }

  if (/summar.*project|project.*summar/.test(lower)) {
    const active = projects.filter((p) => p.status === "active");
    if (active.length === 0) return { content: "You don't have any active projects right now." };
    const lines = active.map((p) => {
      const projectTasks = topLevel.filter((t) => t.projectId === p.id);
      const done = projectTasks.filter((t) => t.status === "completed").length;
      const pct = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
      return `- **${p.name}** — ${pct}% complete (${done}/${projectTasks.length} tasks)`;
    });
    return { content: `Here's where your active projects stand:\n\n${lines.join("\n")}` };
  }

  if (/overdue/.test(lower)) {
    const overdue = topLevel.filter(
      (t) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < today
    );
    if (overdue.length === 0) return { content: "Nothing overdue — you're caught up." };
    const lines = overdue.map((t) => `- ${t.title} (due ${new Date(t.dueDate!).toLocaleDateString(undefined, { month: "short", day: "numeric" })})`);
    return { content: `You have ${overdue.length} overdue task${overdue.length === 1 ? "" : "s"}:\n\n${lines.join("\n")}` };
  }

  if (/plan\s+(my\s+)?(morning|afternoon|evening|tonight|day)/.test(lower)) {
    const blocks = planSchedule(input);
    const lines = blocks.map(
      (b) =>
        `- ${b.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}–${b.end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} ${b.title}`
    );
    return {
      content: `Here's a possible plan:\n\n${lines.join("\n")}\n\nHead to the Calendar to add these once you're happy with the shape.`,
    };
  }

  return null;
}

/**
 * The single entry point every AI touchpoint (command palette, /chat,
 * "Ask NEXUS" buttons) should call through, instead of hard-coding provider
 * calls in components (spec §43). Routes by context first — a project page
 * gets project-aware answers, a note gets note actions — and falls back to
 * the general assistant otherwise.
 */
export function generateContextualResponse(input: string, context: AIContext): AIResponse {
  if (context.type === "project") {
    return { content: generateProjectResponse(input, context.project, context.tasks) };
  }

  if (context.type === "note") {
    const lower = input.toLowerCase();
    const { note } = context;
    if (/summar/.test(lower)) return { content: summarizeNote(note.content) };
    if (/explain/.test(lower)) return { content: explainNote(note.content, note.title) };
    if (/key point/.test(lower)) {
      const points = findKeyPoints(note.content);
      return { content: points.length ? points.map((p) => `- ${p}`).join("\n") : "No clear key points found." };
    }
    if (/checklist/.test(lower)) return { content: generateChecklist(note.content) };
    if (/extract.*task/.test(lower)) {
      const found = extractTasksFromNote(note.content);
      return {
        content: found.length
          ? `Found ${found.length} task${found.length === 1 ? "" : "s"}:\n\n${found.map((t) => `- ${t}`).join("\n")}`
          : "No unchecked checklist items or action lines found in this note.",
      };
    }
    if (/improve/.test(lower)) return { content: improveWriting(note.content) };
  }

  if (context.type === "dashboard" || context.type === "tasks" || context.type === "calendar") {
    const dashboard = dashboardResponse(input);
    if (dashboard) return dashboard;
  }

  return generateAIResponse(input);
}

const defaultPrompts = [
  "What should I focus on today?",
  "Summarize my active projects",
  "Plan my afternoon",
  "Find overdue tasks",
];

export function suggestedPrompts(context: AIContext): string[] {
  switch (context.type) {
    case "project":
      return ["What should I work on next?", "Why is this behind schedule?"];
    case "note":
      return ["Summarize this note", "Find key points", "Extract tasks"];
    case "tasks":
      return ["Find overdue tasks", "What should I focus on today?"];
    case "calendar":
      return ["Plan my afternoon", "What should I focus on today?"];
    default:
      return defaultPrompts;
  }
}
