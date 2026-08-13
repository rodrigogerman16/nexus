import { useTasksStore } from "@/lib/store/useTasksStore";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { parseTaskInput } from "@/lib/ai/parseTaskInput";
import type { ChatActionChip } from "@/lib/store/types";

export interface AIResponse {
  content: string;
  actions?: ChatActionChip[];
}

/** Very small intent-matching "AI" — enough to make the assistant feel like it's
 * actually wired into the app rather than a static chatbot. */
export function generateAIResponse(userInput: string): AIResponse {
  const text = userInput.trim();
  const lower = text.toLowerCase();

  // Intent: create a task ("add task: ...", "remind me to ...", "todo: ...")
  const taskMatch = lower.match(
    /^(add task:?|remind me to|todo:?|task:?)\s*(.+)/i
  );
  if (taskMatch) {
    const rawInput = text.slice(taskMatch[0].length - taskMatch[2].length);
    const parsed = parseTaskInput(rawInput);
    const task = useTasksStore.getState().addTask({
      title: parsed.title || "New task",
      dueDate: parsed.dueDate,
      priority: parsed.priority,
    });
    return {
      content: `Done — I added "${task.title}"${
        task.dueDate
          ? ` for ${new Date(task.dueDate).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}`
          : ""
      } to your tasks.`,
      actions: [{ label: task.title, kind: "task" }],
    };
  }

  // Intent: create a note ("note that ...", "take a note: ...", "jot down ...")
  const noteMatch = lower.match(
    /^(note that|take a note:?|jot down:?|note:?)\s*(.+)/i
  );
  if (noteMatch) {
    const content = text.slice(noteMatch[0].length - noteMatch[2].length);
    const title = content.length > 40 ? `${content.slice(0, 40)}…` : content;
    const note = useNotesStore.getState().addNote({ title, content });
    return {
      content: `Saved that to your notes as "${note.title}".`,
      actions: [{ label: note.title, kind: "note" }],
    };
  }

  // Intent: habit check-in ("how am I doing on my <habit>", "habit streak")
  if (lower.includes("streak") || lower.match(/how (am i|'?m i) doing/)) {
    const habits = useLifeStore.getState().habits;
    if (habits.length === 0) {
      return { content: "You don't have any habits tracked yet." };
    }
    const summary = habits
      .map((h) => {
        const days = Object.values(h.completions).filter(Boolean).length;
        return `**${h.name}** — ${days} check-ins logged`;
      })
      .join("\n");
    return {
      content: `Here's where your habits stand:\n\n${summary}`,
    };
  }

  // Intent: plan my day
  if (lower.includes("plan my day") || lower.includes("what's on my plate") || lower.includes("what is on my plate")) {
    const tasks = useTasksStore
      .getState()
      .tasks.filter((t) => t.status !== "completed" && !t.parentTaskId)
      .slice(0, 5);
    const events = useLifeStore.getState().events.slice(0, 3);
    const taskLines = tasks.map((t) => `- ${t.title}`).join("\n") || "- Nothing urgent on your list";
    const eventLines =
      events.map((e) => `- ${e.title} at ${new Date(e.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`).join("\n") ||
      "- No meetings scheduled";
    return {
      content: `Here's the shape of your day:\n\n**Tasks**\n${taskLines}\n\n**Schedule**\n${eventLines}\n\nWant me to add anything else to the list?`,
    };
  }

  // Intent: greeting
  if (/^(hi|hey|hello)\b/.test(lower)) {
    return {
      content: "Hey — I can add tasks, save notes, check your habit streaks, or give you a rundown of your day. What do you need?",
    };
  }

  // Intent: thanks
  if (lower.includes("thank")) {
    return { content: "Anytime. Let me know what else you need." };
  }

  // Fallback — generic but on-brand response, still useful
  return {
    content:
      `Got it. I don't have a specialized action for that yet, but you can try things like:\n\n` +
      `- "add task: draft the follow-up email tomorrow"\n` +
      `- "note that the client prefers async updates"\n` +
      `- "how's my streak going"\n` +
      `- "plan my day"`,
  };
}

/** Simulates token-by-token streaming for a response string. */
export function streamText(
  fullText: string,
  onToken: (soFar: string) => void,
  onDone: () => void,
  speedMs = 12
) {
  const tokens = fullText.split(/(\s+)/);
  let i = 0;
  let soFar = "";
  const interval = setInterval(() => {
    if (i >= tokens.length) {
      clearInterval(interval);
      onDone();
      return;
    }
    soFar += tokens[i];
    onToken(soFar);
    i += 1;
  }, speedMs);
  return () => clearInterval(interval);
}
