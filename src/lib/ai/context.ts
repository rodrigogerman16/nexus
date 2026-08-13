import { create } from "zustand";
import type { Note, Project, Task } from "@/lib/store/types";

export type AIContext =
  | { type: "dashboard" }
  | { type: "tasks" }
  | { type: "calendar" }
  | { type: "project"; project: Project; tasks: Task[] }
  | { type: "note"; note: Note };

interface AIContextState {
  context: AIContext;
  setContext: (context: AIContext) => void;
}

/**
 * Tracks "where the user currently is" so the global assistant (⌘K, /chat)
 * can answer in context instead of behaving like an isolated chatbot (spec
 * §23). Pages that have a specific subject — a project, a note — call
 * setContext on mount; pages that don't (Activity, Settings, /chat itself)
 * simply inherit whatever context was last set, so "Ask NEXUS" from a
 * project card still knows which project you meant even after navigating.
 */
export const useAIContextStore = create<AIContextState>()((set) => ({
  context: { type: "dashboard" },
  setContext: (context) => set({ context }),
}));

export function contextLabel(context: AIContext): string {
  switch (context.type) {
    case "project":
      return `Project: ${context.project.name}`;
    case "note":
      return `Note: ${context.note.title || "Untitled"}`;
    case "tasks":
      return "Tasks";
    case "calendar":
      return "Calendar";
    default:
      return "NEXUS";
  }
}
