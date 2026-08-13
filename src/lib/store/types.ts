export type TaskStatus = "inbox" | "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export type ProjectStatus = "planning" | "active" | "paused" | "completed";

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  deadline?: string;
  isFavorite: boolean;
  lastAccessedAt: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  parentTaskId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  estimatedDurationMinutes?: number;
  tags: string[];
  position: number;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  color?: string;
  description?: string;
  projectId?: string;
}

export type HabitFrequency = "daily" | "weekly";

export interface Habit {
  id: string;
  name: string;
  color: string;
  frequency: HabitFrequency;
  targetPerWeek: number;
  completions: Record<string, boolean>;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  targetDate?: string;
  linkedHabitIds: string[];
}

export type NotificationType =
  | "task_due"
  | "project_update"
  | "ai_suggestion"
  | "calendar_reminder"
  | "task_completed";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}

export type ActivityType =
  | "task_created"
  | "task_completed"
  | "project_created"
  | "project_updated"
  | "note_created"
  | "note_updated"
  | "event_created"
  | "ai_briefing";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  projectId?: string;
  createdAt: string;
}

export type ChatRole = "user" | "assistant";

export interface ChatActionChip {
  label: string;
  kind: "task" | "note" | "habit" | "info";
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  actions?: ChatActionChip[];
}
