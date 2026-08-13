"use client";

import { useMemo } from "react";
import { useTasksStore } from "@/lib/store/useTasksStore";

export function ProjectProgressChart() {
  const projects = useTasksStore((s) => s.projects);
  const tasks = useTasksStore((s) => s.tasks);

  const rows = useMemo(() => {
    return projects
      .map((project) => {
        const projectTasks = tasks.filter((t) => t.projectId === project.id && !t.parentTaskId);
        const completed = projectTasks.filter((t) => t.status === "completed").length;
        const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;
        return { project, progress, completed, total: projectTasks.length };
      })
      .filter((row) => row.total > 0)
      .sort((a, b) => b.progress - a.progress);
  }, [projects, tasks]);

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Add tasks to a project to see its progress here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map(({ project, progress, completed, total }) => (
        <div key={project.id} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-foreground md:w-36">
            {project.name}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: project.color }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
            {completed}/{total}
          </span>
          <span className="w-9 shrink-0 text-right text-xs font-medium text-foreground">
            {progress}%
          </span>
        </div>
      ))}
    </div>
  );
}
