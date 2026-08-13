import { describe, expect, it } from "vitest";
import { generateProjectResponse } from "@/lib/ai/projectAssistant";
import type { Project, Task } from "@/lib/store/types";

const NOW = Date.now();
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();
const daysFromNow = (n: number) => new Date(NOW + n * 86_400_000).toISOString();

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    name: "Website Relaunch",
    color: "#ff6b3d",
    icon: "Folder",
    status: "active",
    isFavorite: false,
    lastAccessedAt: daysAgo(0),
    createdAt: daysAgo(10),
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: "Task",
    status: "todo",
    priority: "medium",
    tags: [],
    position: 0,
    projectId: "p1",
    createdAt: daysAgo(5),
    ...overrides,
  };
}

describe("generateProjectResponse — what's next", () => {
  it("recommends the soonest-due incomplete task", () => {
    const tasks = [
      makeTask({ id: "t1", title: "Write copy", dueDate: daysFromNow(5) }),
      makeTask({ id: "t2", title: "Fix layout bug", dueDate: daysFromNow(1) }),
    ];
    const result = generateProjectResponse("what should I work on next?", makeProject(), tasks);
    expect(result).toContain("Fix layout bug");
    expect(result).toContain("soonest due");
  });

  it("falls back to highest priority when no tasks have a due date", () => {
    const tasks = [
      makeTask({ id: "t1", title: "Low prio item", priority: "low" }),
      makeTask({ id: "t2", title: "Critical item", priority: "critical" }),
    ];
    const result = generateProjectResponse("what's next", makeProject(), tasks);
    expect(result).toContain("Critical item");
    expect(result).toContain("critical");
  });

  it("reports no tasks yet when the project is empty", () => {
    const result = generateProjectResponse("what's next", makeProject(), []);
    expect(result).toContain("doesn't have any tasks yet");
  });

  it("congratulates completion when everything is done", () => {
    const tasks = [makeTask({ id: "t1", status: "completed" })];
    const result = generateProjectResponse("what's next", makeProject(), tasks);
    expect(result).toContain("Nice work");
  });
});

describe("generateProjectResponse — schedule analysis", () => {
  it("says there's no schedule to be behind on without a deadline", () => {
    const project = makeProject({ deadline: undefined });
    const result = generateProjectResponse("are we behind schedule?", project, []);
    expect(result).toContain("doesn't have a deadline set");
  });

  it("flags being behind when actual progress trails expected progress", () => {
    const project = makeProject({ createdAt: daysAgo(10), deadline: daysFromNow(10) });
    const tasks = [
      makeTask({ id: "t1", status: "todo" }),
      makeTask({ id: "t2", status: "todo" }),
    ];
    const result = generateProjectResponse("are we on track?", project, tasks);
    expect(result).toContain("would typically be around");
  });

  it("reports on-pace when progress meets the expected trajectory", () => {
    const project = makeProject({ createdAt: daysAgo(10), deadline: daysFromNow(10) });
    const tasks = [
      makeTask({ id: "t1", status: "completed" }),
      makeTask({ id: "t2", status: "completed" }),
      makeTask({ id: "t3", status: "todo" }),
    ];
    const result = generateProjectResponse("on track?", project, tasks);
    expect(result).toContain("roughly on pace");
  });

  it("reports an overdue deadline with days-ago phrasing", () => {
    const project = makeProject({ createdAt: daysAgo(30), deadline: daysAgo(5) });
    const tasks = [makeTask({ id: "t1", status: "todo", dueDate: daysAgo(2) })];
    const result = generateProjectResponse("behind schedule?", project, tasks);
    expect(result).toContain("5 days ago");
    expect(result).toContain("overdue");
  });
});

describe("generateProjectResponse — default status summary", () => {
  it("summarizes completion counts and deadline when no keyword matches", () => {
    const project = makeProject({ deadline: daysFromNow(3) });
    const tasks = [
      makeTask({ id: "t1", status: "completed" }),
      makeTask({ id: "t2", status: "todo" }),
    ];
    const result = generateProjectResponse("how's it going", project, tasks);
    expect(result).toContain("50% complete");
    expect(result).toContain("1 done, 1 remaining");
    expect(result).toContain("Deadline is");
  });
});
