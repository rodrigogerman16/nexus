import { beforeEach, describe, expect, it } from "vitest";
import { generateContextualResponse, suggestedPrompts } from "@/lib/ai/service";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import type { Project, Task, Note, CalendarEvent } from "@/lib/store/types";

const NOW = Date.now();
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: "Task",
    status: "todo",
    priority: "medium",
    tags: [],
    position: 0,
    createdAt: daysAgo(1),
    ...overrides,
  };
}

function makeProject(overrides: Partial<Project> & { id: string }): Project {
  return {
    name: "Project",
    color: "#ff6b3d",
    icon: "Folder",
    status: "active",
    isFavorite: false,
    lastAccessedAt: daysAgo(0),
    createdAt: daysAgo(10),
    ...overrides,
  };
}

function makeNote(overrides: Partial<Note> & { id: string }): Note {
  return {
    title: "Note",
    content: "Some content",
    tags: [],
    pinned: false,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    ...overrides,
  };
}

beforeEach(() => {
  useTasksStore.setState({ tasks: [], projects: [] });
  useLifeStore.setState({ events: [] as CalendarEvent[] });
});

describe("generateContextualResponse — dashboard context", () => {
  it("surfaces the top overdue/due-today task for a focus question", () => {
    useTasksStore.setState({
      tasks: [
        makeTask({ id: "t1", title: "Overdue low", priority: "low", dueDate: daysAgo(2) }),
        makeTask({ id: "t2", title: "Overdue critical", priority: "critical", dueDate: daysAgo(1) }),
      ],
      projects: [],
    });
    const result = generateContextualResponse("what should I focus on today?", { type: "dashboard" });
    expect(result.content).toContain("Overdue critical");
    expect(result.content).toContain("overdue");
  });

  it("reports nothing urgent when there are no due/overdue tasks", () => {
    useTasksStore.setState({
      tasks: [makeTask({ id: "t1", title: "Someday task" })],
      projects: [],
    });
    const result = generateContextualResponse("what should I focus on?", { type: "dashboard" });
    expect(result.content).toContain("Nothing urgent");
  });

  it("summarizes active projects with completion percentages", () => {
    useTasksStore.setState({
      tasks: [
        makeTask({ id: "t1", projectId: "p1", status: "completed" }),
        makeTask({ id: "t2", projectId: "p1", status: "todo" }),
      ],
      projects: [makeProject({ id: "p1", name: "Website Relaunch", status: "active" })],
    });
    const result = generateContextualResponse("summarize my active projects", { type: "dashboard" });
    expect(result.content).toContain("Website Relaunch");
    expect(result.content).toContain("50% complete");
  });

  it("says there are no active projects when there are none", () => {
    const result = generateContextualResponse("summarize my active projects", { type: "dashboard" });
    expect(result.content).toContain("don't have any active projects");
  });

  it("lists overdue tasks", () => {
    useTasksStore.setState({
      tasks: [makeTask({ id: "t1", title: "Late report", dueDate: daysAgo(3) })],
      projects: [],
    });
    const result = generateContextualResponse("what's overdue?", { type: "dashboard" });
    expect(result.content).toContain("1 overdue task");
    expect(result.content).toContain("Late report");
  });

  it("produces a schedule for a 'plan my afternoon' request", () => {
    const result = generateContextualResponse("plan my afternoon", { type: "dashboard" });
    expect(result.content).toContain("Here's a possible plan");
    expect(result.content).toContain("Calendar");
  });

  it("produces a daily brief (not a schedule) for a 'plan my day' request", () => {
    // Regression guard: "plan my day" and "plan my afternoon" both matched
    // the schedule-planner's regex before the daily-brief check was given
    // priority, so this used to (wrongly) return a calendar plan instead of
    // the tasks/schedule rundown the AIBriefCard depends on.
    useTasksStore.setState({
      tasks: [makeTask({ id: "t1", title: "Ship the release" })],
      projects: [],
    });
    const result = generateContextualResponse("plan my day", { type: "dashboard" });
    expect(result.content).toContain("Here's the shape of your day");
    expect(result.content).toContain("Ship the release");
    expect(result.content).not.toContain("Here's a possible plan");
  });

  it("falls back to the generic assistant for unmatched dashboard input", () => {
    const result = generateContextualResponse("hi there", { type: "dashboard" });
    expect(result.content).toContain("I can add tasks");
  });
});

describe("generateContextualResponse — project context", () => {
  it("delegates to the project assistant", () => {
    const project = makeProject({ id: "p1", name: "Mobile App" });
    const tasks = [makeTask({ id: "t1", projectId: "p1", status: "completed" })];
    const result = generateContextualResponse("how's it going", { type: "project", project, tasks });
    expect(result.content).toContain("Mobile App");
  });
});

describe("generateContextualResponse — note context", () => {
  it("routes 'summarize' to summarizeNote", () => {
    const note = makeNote({ id: "n1", title: "Meeting Notes", content: "We discussed the roadmap." });
    const result = generateContextualResponse("summarize this", { type: "note", note });
    expect(result.content).toContain("discussed the roadmap");
  });

  it("routes 'extract tasks' to extractTasksFromNote", () => {
    const note = makeNote({ id: "n1", content: "- [ ] Send the invoice\n- [ ] Book the venue" });
    const result = generateContextualResponse("extract tasks from this", { type: "note", note });
    expect(result.content).toContain("Send the invoice");
    expect(result.content).toContain("Found 2 tasks");
  });

  it("routes 'checklist' to generateChecklist", () => {
    const note = makeNote({ id: "n1", content: "- one\n- two" });
    const result = generateContextualResponse("turn this into a checklist", { type: "note", note });
    expect(result.content).toBe("- [ ] one\n- [ ] two");
  });

  it("falls through to the generic assistant when no note verb matches", () => {
    const note = makeNote({ id: "n1" });
    const result = generateContextualResponse("hi", { type: "note", note });
    expect(result.content).toContain("I can add tasks");
  });
});

describe("suggestedPrompts", () => {
  it("returns project-specific prompts for a project context", () => {
    const prompts = suggestedPrompts({ type: "project", project: makeProject({ id: "p1" }), tasks: [] });
    expect(prompts).toContain("What should I work on next?");
  });

  it("returns note-specific prompts for a note context", () => {
    const prompts = suggestedPrompts({ type: "note", note: makeNote({ id: "n1" }) });
    expect(prompts).toContain("Summarize this note");
  });

  it("returns default prompts for dashboard context", () => {
    const prompts = suggestedPrompts({ type: "dashboard" });
    expect(prompts).toContain("What should I focus on today?");
  });
});
