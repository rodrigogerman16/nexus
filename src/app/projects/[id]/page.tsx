"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Pencil, Plus, Star } from "lucide-react";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, initialsFor } from "@/components/ui/Avatar";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { ProjectAssistant } from "@/components/projects/ProjectAssistant";
import { statusConfig } from "@/components/projects/projectMeta";
import { groupActivitiesByDay, iconByType } from "@/components/activity/activityMeta";
import { useAIContextStore } from "@/lib/ai/context";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/types";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const projects = useTasksStore((s) => s.projects);
  const tasks = useTasksStore((s) => s.tasks);
  const activities = useActivityStore((s) => s.activities);
  const notes = useNotesStore((s) => s.notes);
  const addNote = useNotesStore((s) => s.addNote);
  const ownerName = useSettingsStore((s) => s.fullName);
  const toggleFavoriteProject = useTasksStore((s) => s.toggleFavoriteProject);
  const touchProject = useTasksStore((s) => s.touchProject);

  const project = projects.find((p) => p.id === id);
  const setAIContext = useAIContextStore((s) => s.setContext);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    if (project) touchProject(project.id);
    // Touch once per visit, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === id && !t.parentTaskId),
    [tasks, id]
  );

  useEffect(() => {
    if (project) setAIContext({ type: "project", project, tasks: projectTasks });
  }, [project, projectTasks, setAIContext]);
  const projectNotes = useMemo(() => notes.filter((n) => n.projectId === id), [notes, id]);
  const projectActivity = useMemo(
    () =>
      [...activities.filter((a) => a.projectId === id)]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12),
    [activities, id]
  );
  const activityGroups = useMemo(() => groupActivitiesByDay(projectActivity), [projectActivity]);

  if (!project) notFound();

  const completed = projectTasks.filter((t) => t.status === "completed").length;
  const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;

  function openNewTask() {
    setEditingTask(undefined);
    setTaskDialogOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTaskDialogOpen(true);
  }

  function addProjectNote() {
    // New notes are prepended, so the freshly created one is notes[0] and
    // the Notes page selects it by default on load. Non-null assertion is
    // safe: this handler is only reachable from JSX rendered after the
    // `notFound()` guard below, which TS can't see across this closure.
    addNote({ projectId: project!.id });
    router.push("/notes");
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Link
        href="/projects"
        className="focus-ring mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Projects
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFavoriteProject(project.id)}
              aria-label={project.isFavorite ? "Remove from favorites" : "Add to favorites"}
              className="focus-ring rounded-md p-2 text-muted-foreground hover:bg-surface-sunken hover:text-warning"
            >
              <Star className={cn("h-4 w-4", project.isFavorite && "fill-warning text-warning")} />
            </button>
            <button
              onClick={() => setEditDialogOpen(true)}
              aria-label="Edit project"
              className="focus-ring rounded-md p-2 text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
        {project.description && (
          <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Badge variant={statusConfig[project.status].badgeVariant}>
            {statusConfig[project.status].label}
          </Badge>
          {project.deadline && (
            <span className="text-xs text-muted-foreground">
              Due{" "}
              {new Date(project.deadline).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Avatar className="h-4.5 w-4.5">
              <AvatarFallback className="text-[9px]">{initialsFor(ownerName)}</AvatarFallback>
            </Avatar>
            {ownerName}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-md border border-border bg-surface p-3">
          <p className="text-xs text-muted-foreground">Progress</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
        </div>
        <div className="rounded-md border border-border bg-surface p-3">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="mt-1.5 text-lg font-semibold">{completed}</p>
        </div>
        <div className="rounded-md border border-border bg-surface p-3">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="mt-1.5 text-lg font-semibold">{projectTasks.length - completed}</p>
        </div>
      </div>

      <ProjectAssistant project={project} tasks={projectTasks} />

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Tasks</h2>
          <Button onClick={openNewTask} size="sm" variant="secondary" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add task
          </Button>
        </div>
        <TaskListView tasks={projectTasks} onEdit={openEditTask} />
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Notes</h2>
          <Button onClick={addProjectNote} size="sm" variant="secondary" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add note
          </Button>
        </div>
        {projectNotes.length > 0 ? (
          <div className="space-y-1.5">
            {projectNotes.map((note) => (
              <Link
                key={note.id}
                href="/notes"
                className="focus-ring flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm transition-colors hover:border-border-strong"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{note.title || "Untitled"}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No notes linked to this project yet.
          </p>
        )}
      </div>

      {activityGroups.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-tight">Activity</h2>
          <div className="space-y-5">
            {activityGroups.map((group) => (
              <div key={group.label}>
                <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h3>
                <ol className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = iconByType[item.type];
                    return (
                      <li key={item.id} className="flex items-center gap-2.5 text-sm">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="w-14 shrink-0 text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-foreground">{item.description}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        defaultProjectId={project.id}
      />
      <ProjectDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} project={project} />
    </div>
  );
}
