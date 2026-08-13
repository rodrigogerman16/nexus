import type { Project, Task } from "@/lib/store/types";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export function dbTaskToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    projectId: row.project_id ?? undefined,
    parentTaskId: row.parent_task_id ?? undefined,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    estimatedDurationMinutes: row.estimated_duration_minutes ?? undefined,
    tags: row.tags ?? [],
    position: row.position,
    createdAt: row.created_at,
  };
}

export function taskToDbRow(task: Task, ownerId: string): TaskInsert {
  return {
    id: task.id,
    owner_id: ownerId,
    project_id: task.projectId ?? null,
    parent_task_id: task.parentTaskId ?? null,
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate ?? null,
    estimated_duration_minutes: task.estimatedDurationMinutes ?? null,
    tags: task.tags,
    position: task.position,
    created_at: task.createdAt,
  };
}

/** Only the columns a given patch actually touches — an `undefined` key
 * would otherwise null out unrelated columns in a Supabase `.update()`. */
export function taskPatchToDbUpdate(patch: Partial<Task>): TaskUpdate {
  const update: TaskUpdate = {};
  if ("title" in patch) update.title = patch.title;
  if ("description" in patch) update.description = patch.description ?? null;
  if ("projectId" in patch) update.project_id = patch.projectId ?? null;
  if ("parentTaskId" in patch) update.parent_task_id = patch.parentTaskId ?? null;
  if ("status" in patch) update.status = patch.status;
  if ("priority" in patch) update.priority = patch.priority;
  if ("dueDate" in patch) update.due_date = patch.dueDate ?? null;
  if ("estimatedDurationMinutes" in patch)
    update.estimated_duration_minutes = patch.estimatedDurationMinutes ?? null;
  if ("tags" in patch) update.tags = patch.tags;
  if ("position" in patch) update.position = patch.position;
  return update;
}

export function dbProjectToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    color: row.color ?? "#ff6b3d",
    icon: row.icon,
    status: row.status,
    deadline: row.deadline ?? undefined,
    isFavorite: row.is_favorite,
    // Recency isn't tracked server-side (yet) — fall back to last update time.
    lastAccessedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

export function projectToDbRow(project: Project, ownerId: string): ProjectInsert {
  return {
    id: project.id,
    owner_id: ownerId,
    name: project.name,
    description: project.description ?? null,
    status: project.status,
    color: project.color,
    icon: project.icon,
    deadline: project.deadline ?? null,
    is_favorite: project.isFavorite,
    created_at: project.createdAt,
  };
}

export function projectPatchToDbUpdate(patch: Partial<Project>): ProjectUpdate {
  const update: ProjectUpdate = {};
  if ("name" in patch) update.name = patch.name;
  if ("description" in patch) update.description = patch.description ?? null;
  if ("color" in patch) update.color = patch.color;
  if ("icon" in patch) update.icon = patch.icon;
  if ("status" in patch) update.status = patch.status;
  if ("deadline" in patch) update.deadline = patch.deadline ?? null;
  if ("isFavorite" in patch) update.is_favorite = patch.isFavorite;
  return update;
}
