import {
  CheckCircle2,
  FileText,
  FolderPlus,
  ListChecks,
  Pencil,
  Rocket,
  Sparkles,
} from "lucide-react";
import { isSameDay } from "@/lib/utils";
import type { ActivityItem, ActivityType } from "@/lib/store/types";

export const iconByType: Record<ActivityType, typeof CheckCircle2> = {
  task_created: ListChecks,
  task_completed: CheckCircle2,
  project_created: Rocket,
  project_updated: FolderPlus,
  note_created: FileText,
  note_updated: Pencil,
  event_created: FileText,
  ai_briefing: Sparkles,
};

function dayLabel(date: Date, today: Date): string {
  if (isSameDay(date, today)) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export interface ActivityDayGroup {
  label: string;
  items: ActivityItem[];
}

export function groupActivitiesByDay(items: ActivityItem[], today: Date = new Date()): ActivityDayGroup[] {
  const groups: ActivityDayGroup[] = [];
  for (const item of items) {
    const date = new Date(item.createdAt);
    const label = dayLabel(date, today);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}
