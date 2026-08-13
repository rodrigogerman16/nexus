"use client";

import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function ProjectsOverview() {
  const projects = useTasksStore((s) => s.projects);
  const tasks = useTasksStore((s) => s.tasks);

  const active = projects
    .filter((p) => p.status === "active")
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-accent" /> Projects
        </CardTitle>
        <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {active.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id && !t.parentTaskId);
          const completed = projectTasks.filter((t) => t.status === "completed").length;
          const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="focus-ring flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-surface-sunken"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="min-w-0 flex-1 truncate">{project.name}</span>
              <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{progress}%</span>
            </Link>
          );
        })}
        {active.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No active projects.</p>
        )}
      </CardContent>
    </Card>
  );
}
