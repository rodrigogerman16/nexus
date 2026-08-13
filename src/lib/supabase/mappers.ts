import type { CalendarEvent, Note, Project, Task } from "@/lib/store/types";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];
type EventRow = Database["public"]["Tables"]["calendar_events"]["Row"];
type EventInsert = Database["public"]["Tables"]["calendar_events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["calendar_events"]["Update"];

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

export function dbNoteToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags ?? [],
    pinned: row.is_favorite,
    projectId: row.project_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function noteToDbRow(note: Note, ownerId: string): NoteInsert {
  return {
    id: note.id,
    owner_id: ownerId,
    project_id: note.projectId ?? null,
    title: note.title,
    content: note.content,
    tags: note.tags,
    is_favorite: note.pinned,
    created_at: note.createdAt,
  };
}

export function notePatchToDbUpdate(patch: Partial<Note>): NoteUpdate {
  const update: NoteUpdate = {};
  if ("title" in patch) update.title = patch.title;
  if ("content" in patch) update.content = patch.content;
  if ("tags" in patch) update.tags = patch.tags;
  if ("pinned" in patch) update.is_favorite = patch.pinned;
  if ("projectId" in patch) update.project_id = patch.projectId ?? null;
  return update;
}

export function dbEventToEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    start: row.start_time,
    end: row.end_time,
    allDay: row.all_day,
    color: row.color ?? undefined,
    description: row.description ?? undefined,
    projectId: row.project_id ?? undefined,
  };
}

export function eventToDbRow(event: CalendarEvent, ownerId: string): EventInsert {
  return {
    id: event.id,
    owner_id: ownerId,
    project_id: event.projectId ?? null,
    title: event.title,
    description: event.description ?? null,
    start_time: event.start,
    end_time: event.end,
    all_day: event.allDay ?? false,
    color: event.color ?? null,
  };
}

export function eventPatchToDbUpdate(patch: Partial<CalendarEvent>): EventUpdate {
  const update: EventUpdate = {};
  if ("title" in patch) update.title = patch.title;
  if ("description" in patch) update.description = patch.description ?? null;
  if ("start" in patch) update.start_time = patch.start;
  if ("end" in patch) update.end_time = patch.end;
  if ("allDay" in patch) update.all_day = patch.allDay ?? false;
  if ("color" in patch) update.color = patch.color ?? null;
  if ("projectId" in patch) update.project_id = patch.projectId ?? null;
  return update;
}
