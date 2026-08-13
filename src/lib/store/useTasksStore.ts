import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";
import { seedProjects, seedTasks } from "@/lib/mock/seedData";
import { useActivityStore } from "@/lib/store/useActivityStore";
import type { Project, Task, TaskStatus } from "@/lib/store/types";

interface TasksState {
  tasks: Task[];
  projects: Project[];
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

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: seedTasks,
      projects: seedProjects,
      addTask: (task) => {
        const newTask: Task = {
          id: generateId("task"),
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
          });
        }
        return newTask;
      },
      updateTask: (id, patch) => {
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        });
      },
      deleteTask: (id) => {
        // Cascade: a task's subtasks can't outlive their parent.
        set({
          tasks: get().tasks.filter((t) => t.id !== id && t.parentTaskId !== id),
        });
      },
      setStatus: (id, status) => {
        const task = get().tasks.find((t) => t.id === id);
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        });
        if (task && status === "completed" && task.status !== "completed") {
          useActivityStore.getState().addActivity({
            type: "task_completed",
            description: `Completed "${task.title}"`,
            projectId: task.projectId,
          });
        }
      },
      moveTask: (id, status, beforeId) => {
        const current = get().tasks;
        const moving = current.find((t) => t.id === id);
        if (!moving) return;
        const rest = current.filter((t) => t.id !== id);
        const updated = { ...moving, status };
        const insertAt = beforeId ? rest.findIndex((t) => t.id === beforeId) : -1;
        const next =
          insertAt === -1
            ? [...rest, updated]
            : [...rest.slice(0, insertAt), updated, ...rest.slice(insertAt)];
        set({ tasks: next.map((t, i) => ({ ...t, position: i })) });
        if (status === "completed" && moving.status !== "completed") {
          useActivityStore.getState().addActivity({
            type: "task_completed",
            description: `Completed "${moving.title}"`,
            projectId: moving.projectId,
          });
        }
      },
      addProject: (project) => {
        const now = new Date().toISOString();
        const newProject: Project = {
          id: generateId("proj"),
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
        return newProject;
      },
      updateProject: (id, patch) => {
        const project = get().projects.find((p) => p.id === id);
        set({
          projects: get().projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
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
      },
      toggleFavoriteProject: (id) => {
        set({
          projects: get().projects.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        });
      },
      touchProject: (id) => {
        set({
          projects: get().projects.map((p) =>
            p.id === id ? { ...p, lastAccessedAt: new Date().toISOString() } : p
          ),
        });
      },
      deleteProject: (id) => {
        set({ projects: get().projects.filter((p) => p.id !== id) });
      },
    }),
    {
      name: "acc-tasks-store",
      // v3 reworked Task status/priority enums (added inbox/completed,
      // critical) and added parentTaskId/estimatedDurationMinutes/position —
      // fall back to the current seed data instead of running with an older shape.
      version: 3,
      migrate: () => ({ tasks: seedTasks, projects: seedProjects }),
    }
  )
);
