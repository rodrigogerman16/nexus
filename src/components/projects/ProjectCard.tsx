"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/store/types";
import { statusConfig } from "@/components/projects/projectMeta";

export function ProjectCard({ project }: { project: Project }) {
  const tasks = useTasksStore((s) => s.tasks);
  const toggleFavoriteProject = useTasksStore((s) => s.toggleFavoriteProject);

  const projectTasks = tasks.filter((t) => t.projectId === project.id && !t.parentTaskId);
  const completed = projectTasks.filter((t) => t.status === "completed").length;
  const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="focus-ring group block rounded-md border border-border bg-surface p-4 transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="text-sm font-semibold tracking-tight">{project.name}</h3>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavoriteProject(project.id);
          }}
          aria-label={project.isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="focus-ring rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-warning group-hover:opacity-100 data-[active=true]:opacity-100"
          data-active={project.isFavorite}
        >
          <Star className={cn("h-4 w-4", project.isFavorite && "fill-warning text-warning")} />
        </button>
      </div>

      {project.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-8 shrink-0 text-right text-xs font-medium text-muted-foreground">
          {progress}%
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge variant={statusConfig[project.status].badgeVariant}>
          {statusConfig[project.status].label}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {completed}/{projectTasks.length} tasks
          {project.deadline && (
            <>
              {" · "}
              {new Date(project.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </>
          )}
        </span>
      </div>
    </Link>
  );
}
