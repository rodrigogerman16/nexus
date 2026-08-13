import { beforeEach, describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/ai/promptContext";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import type { CalendarEvent, Note, Project, Task } from "@/lib/store/types";

const NOW = new Date();
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

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

beforeEach(() => {
  useTasksStore.setState({ tasks: [], projects: [] });
  useLifeStore.setState({ events: [] as CalendarEvent[] });
});

describe("buildSystemPrompt — dashboard/tasks/calendar", () => {
  it("reports 'none' for overdue/due-today/active-projects/events when there's no data", () => {
    const prompt = buildSystemPrompt({ type: "dashboard" });
    expect(prompt).toContain("Overdue tasks: none");
    expect(prompt).toContain("Due today: none");
    expect(prompt).toContain("Active projects: none");
    expect(prompt).toContain("Today's calendar: nothing scheduled");
  });

  it("lists overdue tasks by title and priority", () => {
    useTasksStore.setState({
      tasks: [makeTask({ id: "t1", title: "Late report", priority: "high", dueDate: daysAgo(2) })],
      projects: [],
    });
    const prompt = buildSystemPrompt({ type: "tasks" });
    expect(prompt).toContain('"Late report" (high)');
  });

  it("lists active projects by name", () => {
    useTasksStore.setState({
      tasks: [],
      projects: [makeProject({ id: "p1", name: "Website Relaunch", status: "active" })],
    });
    const prompt = buildSystemPrompt({ type: "calendar" });
    expect(prompt).toContain('"Website Relaunch"');
  });

  it("excludes completed tasks and subtasks from the overdue/due-today counts", () => {
    useTasksStore.setState({
      tasks: [
        makeTask({ id: "t1", title: "Done already", status: "completed", dueDate: daysAgo(1) }),
        makeTask({ id: "t2", title: "A subtask", parentTaskId: "t1", dueDate: daysAgo(1) }),
      ],
      projects: [],
    });
    const prompt = buildSystemPrompt({ type: "dashboard" });
    expect(prompt).not.toContain("Done already");
    expect(prompt).not.toContain("A subtask");
  });
});

describe("buildSystemPrompt — project", () => {
  it("includes the project name, status, and task list", () => {
    const project = makeProject({ id: "p1", name: "Mobile App", deadline: undefined });
    const tasks = [makeTask({ id: "t1", title: "Fix crash", status: "todo", priority: "critical" })];
    const prompt = buildSystemPrompt({ type: "project", project, tasks });
    expect(prompt).toContain("Mobile App");
    expect(prompt).toContain("no deadline set");
    expect(prompt).toContain("Fix crash");
    expect(prompt).toContain("critical priority");
  });

  it("reports no tasks yet for an empty project", () => {
    const project = makeProject({ id: "p1", name: "Empty" });
    const prompt = buildSystemPrompt({ type: "project", project, tasks: [] });
    expect(prompt).toContain("(no tasks yet)");
  });
});

describe("buildSystemPrompt — note", () => {
  function makeNote(overrides: Partial<Note> & { id: string }): Note {
    return {
      title: "Note",
      content: "",
      tags: [],
      pinned: false,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
      ...overrides,
    };
  }

  it("includes the note title and content", () => {
    const note = makeNote({ id: "n1", title: "Meeting Notes", content: "We discussed the roadmap." });
    const prompt = buildSystemPrompt({ type: "note", note });
    expect(prompt).toContain("Meeting Notes");
    expect(prompt).toContain("We discussed the roadmap.");
  });

  it("reports an empty note honestly", () => {
    const note = makeNote({ id: "n1", content: "   " });
    const prompt = buildSystemPrompt({ type: "note", note });
    expect(prompt).toContain("(empty note)");
  });
});
