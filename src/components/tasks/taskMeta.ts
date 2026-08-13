import type { TaskPriority, TaskStatus } from "@/lib/store/types";

export const priorityConfig: Record<
  TaskPriority,
  { label: string; badgeVariant: "default" | "accent" | "warning" | "danger"; dotColor: string }
> = {
  low: { label: "Low", badgeVariant: "default", dotColor: "bg-muted-foreground" },
  medium: { label: "Medium", badgeVariant: "default", dotColor: "bg-info" },
  high: { label: "High", badgeVariant: "warning", dotColor: "bg-warning" },
  critical: { label: "Critical", badgeVariant: "danger", dotColor: "bg-danger" },
};

export const priorityOrder: TaskPriority[] = ["critical", "high", "medium", "low"];

export const statusConfig: Record<TaskStatus, { label: string }> = {
  inbox: { label: "Inbox" },
  todo: { label: "To do" },
  in_progress: { label: "In progress" },
  completed: { label: "Completed" },
};

export const statusOrder: TaskStatus[] = ["inbox", "todo", "in_progress", "completed"];

const durationOptions = [15, 30, 45, 60, 90, 120, 180, 240];

export function formatDuration(minutes?: number): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

export const durationSelectOptions = durationOptions.map((minutes) => ({
  value: String(minutes),
  label: formatDuration(minutes)!,
}));
