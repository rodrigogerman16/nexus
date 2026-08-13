import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import {
  dbProjectToProject,
  dbTaskToTask,
  projectPatchToDbUpdate,
  projectToDbRow,
  taskPatchToDbUpdate,
  taskToDbRow,
} from "@/lib/supabase/mappers";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { toast } from "@/lib/store/useToastStore";
import type { Project, Task, TaskStatus } from "@/lib/store/types";

type SyncStatus = "idle" | "loading" | "ready" | "error";

interface TasksState {
  tasks: Task[];
  projects: Project[];
  userId: string | null;
  status: SyncStatus;
  /** Loads this user's tasks/projects from Supabase, or clears local state
   * for `userId: null` on sign-out. Called once after auth resolves. */
  hydrate: (userId: string | null) => Promise<void>;
  addTask: (task: Partial<Task> & { title: string }) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  /** Moves a task into `status`, optionally inserting it just before `beforeId`
   * (same array = same manual ordering used by the Kanban board). */
  moveTask: (id: string, status: TaskStatus, beforeId?: string) => void;
  addProject: (project: Partial<Project> & { name: string }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  toggleFavoriteProject: (id: string) => void;
  touchProject: (id: string) => void;
  deleteProject: (id: string) => void;
}

/** Every write is optimistic (state updates immediately, matching the old
 * local-only behavior) then persisted to Supabase in the background; a
 * failure rolls the optimistic change back and surfaces a toast. Writes are
 * silently skipped with no `userId` (signed out, or a test calling the
 * action directly without going through `hydrate`). */
export const useTasksStore = create<TasksState>()((set, get) => ({
  tasks: [],
  projects: [],
  userId: null,
  status: "idle",

  hydrate: async (userId) => {
    if (!userId) {
      set({ tasks: [], projects: [], userId: null, status: "idle" });
      return;
    }
    set({ userId, status: "loading" });
    const supabase = createClient();
    const [tasksRes, projectsRes] = await Promise.all([
      supabase.from("tasks").select("*").order("position", { ascending: true }),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
    ]);
    if (tasksRes.error || projectsRes.error) {
      console.error(tasksRes.error ?? projectsRes.error);
      set({ status: "error" });
      toast.error("Couldn't load your tasks and projects.");
      return;
    }
    set({
      tasks: tasksRes.data.map(dbTaskToTask),
      projects: projectsRes.data.map(dbProjectToProject),
      status: "ready",
    });
  },

  addTask: (task) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      status: "todo",
      priority: "medium",
      tags: [],
      position: get().tasks.length,
      createdAt: new Date().toISOString(),
      ...task,
    };
    set({ tasks: [newTask, ...get().tasks] });
    if (!newTask.parentTaskId) {
      useActivityStore.getState().addActivity({
        type: "task_created",
        description: `Created task "${newTask.title}"`,
        projectId: newTask.projectId,
        taskId: newTask.id,
      });
    }
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("tasks")
        .insert(taskToDbRow(newTask, userId))
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error(`Couldn't save "${newTask.title}" — try again.`);
          set({ tasks: get().tasks.filter((t) => t.id !== newTask.id) });
        });
    }
    return newTask;
  },

  updateTask: (id, patch) => {
    const previous = get().tasks;
    set({
      tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("tasks")
        .update(taskPatchToDbUpdate(patch))
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't save that change — try again.");
          set({ tasks: previous });
        });
    }
  },

  deleteTask: (id) => {
    const previous = get().tasks;
    // Cascade: a task's subtasks can't outlive their parent.
    set({
      tasks: get().tasks.filter((t) => t.id !== id && t.parentTaskId !== id),
    });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("tasks")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't delete that task — try again.");
          set({ tasks: previous });
        });
    }
  },

  setStatus: (id, status) => {
    const previous = get().tasks;
    const task = previous.find((t) => t.id === id);
    set({
      tasks: previous.map((t) => (t.id === id ? { ...t, status } : t)),
    });
    if (task && status === "completed" && task.status !== "completed") {
      useActivityStore.getState().addActivity({
        type: "task_completed",
        description: `Completed "${task.title}"`,
        projectId: task.projectId,
        taskId: task.id,
      });
    }
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("tasks")
        .update(taskPatchToDbUpdate({ status }))
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't save that change — try again.");
          set({ tasks: previous });
        });
    }
  },

  moveTask: (id, status, beforeId) => {
    const previous = get().tasks;
    const moving = previous.find((t) => t.id === id);
    if (!moving) return;
    const rest = previous.filter((t) => t.id !== id);
    const updated = { ...moving, status };
    const insertAt = beforeId ? rest.findIndex((t) => t.id === beforeId) : -1;
    const next =
      insertAt === -1
        ? [...rest, updated]
        : [...rest.slice(0, insertAt), updated, ...rest.slice(insertAt)];
    const reindexed = next.map((t, i) => ({ ...t, position: i }));
    set({ tasks: reindexed });
    if (status === "completed" && moving.status !== "completed") {
      useActivityStore.getState().addActivity({
        type: "task_completed",
        description: `Completed "${moving.title}"`,
        projectId: moving.projectId,
        taskId: moving.id,
      });
    }
    // Persists the moved task's own status/position. Siblings' reordered
    // positions stay local-only for now — good enough for the current
    // session, but a full-column reindex sync is a follow-up.
    const movedTask = reindexed.find((t) => t.id === id)!;
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("tasks")
        .update(taskPatchToDbUpdate({ status: movedTask.status, position: movedTask.position }))
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't save that change — try again.");
          set({ tasks: previous });
        });
    }
  },

  addProject: (project) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: crypto.randomUUID(),
      color: "#ff6b3d",
      icon: "Folder",
      status: "planning",
      isFavorite: false,
      lastAccessedAt: now,
      createdAt: now,
      ...project,
    };
    set({ projects: [newProject, ...get().projects] });
    useActivityStore.getState().addActivity({
      type: "project_created",
      description: `Created project "${newProject.name}"`,
      projectId: newProject.id,
    });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("projects")
        .insert(projectToDbRow(newProject, userId))
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error(`Couldn't save "${newProject.name}" — try again.`);
          set({ projects: get().projects.filter((p) => p.id !== newProject.id) });
        });
    }
    return newProject;
  },

  updateProject: (id, patch) => {
    const previous = get().projects;
    const project = previous.find((p) => p.id === id);
    set({
      projects: previous.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
    if (project && "deadline" in patch) {
      useActivityStore.getState().addActivity({
        type: "project_updated",
        description: `Updated "${project.name}" deadline`,
        projectId: id,
      });
    } else if (project && "status" in patch && patch.status !== project.status) {
      useActivityStore.getState().addActivity({
        type: "project_updated",
        description: `Marked "${project.name}" as ${patch.status}`,
        projectId: id,
      });
    }
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("projects")
        .update(projectPatchToDbUpdate(patch))
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't save that change — try again.");
          set({ projects: previous });
        });
    }
  },

  toggleFavoriteProject: (id) => {
    const previous = get().projects;
    const project = previous.find((p) => p.id === id);
    if (!project) return;
    const isFavorite = !project.isFavorite;
    set({
      projects: previous.map((p) => (p.id === id ? { ...p, isFavorite } : p)),
    });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("projects")
        .update({ is_favorite: isFavorite })
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't save that change — try again.");
          set({ projects: previous });
        });
    }
  },

  // Recency is a soft UI signal (not persisted server-side — see the
  // mapper's fallback to `updated_at`), so this stays purely local.
  touchProject: (id) => {
    set({
      projects: get().projects.map((p) =>
        p.id === id ? { ...p, lastAccessedAt: new Date().toISOString() } : p
      ),
    });
  },

  deleteProject: (id) => {
    const previous = get().projects;
    set({ projects: previous.filter((p) => p.id !== id) });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("projects")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't delete that project — try again.");
          set({ projects: previous });
        });
    }
  },
}));
