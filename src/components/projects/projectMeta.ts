import type { ProjectStatus } from "@/lib/store/types";

export const statusConfig: Record<
  ProjectStatus,
  { label: string; badgeVariant: "default" | "accent" | "success" | "outline" }
> = {
  planning: { label: "Planning", badgeVariant: "outline" },
  active: { label: "Active", badgeVariant: "accent" },
  paused: { label: "Paused", badgeVariant: "default" },
  completed: { label: "Completed", badgeVariant: "success" },
};

export const statusOrder: ProjectStatus[] = ["active", "planning", "paused", "completed"];
