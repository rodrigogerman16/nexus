"use client";

import { motion } from "framer-motion";
import { Check, Clock, ListChecks, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/types";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { Badge } from "@/components/ui/Badge";
import { priorityConfig, formatDuration } from "@/components/tasks/taskMeta";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/Dropdown";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  className?: string;
}

function formatDueDate(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) {
    return `Today, ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isTaskOverdue(dueDate: string | undefined, isDone: boolean): boolean {
  return !!dueDate && !isDone && new Date(dueDate).getTime() < Date.now();
}

export function TaskCard({ task, onEdit, className }: TaskCardProps) {
  const setStatus = useTasksStore((s) => s.setStatus);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const projects = useTasksStore((s) => s.projects);
  const allTasks = useTasksStore((s) => s.tasks);
  const project = projects.find((p) => p.id === task.projectId);
  const isDone = task.status === "completed";
  const priority = priorityConfig[task.priority];
  const dueLabel = formatDueDate(task.dueDate);
  const isOverdue = isTaskOverdue(task.dueDate, isDone);
  const duration = formatDuration(task.estimatedDurationMinutes);
  const subtasks = allTasks.filter((t) => t.parentTaskId === task.id);
  const subtasksDone = subtasks.filter((t) => t.status === "completed").length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-strong",
        className
      )}
    >
      <button
        onClick={() => setStatus(task.id, isDone ? "todo" : "completed")}
        className={cn(
          "focus-ring mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
          isDone
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border-strong text-transparent hover:border-accent"
        )}
        aria-label={isDone ? "Mark as not done" : "Mark as done"}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>

      <button
        className="min-w-0 flex-1 text-left"
        onClick={() => onEdit(task)}
      >
        <p
          className={cn(
            "truncate text-sm font-medium text-foreground",
            isDone && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {project && (
            <Badge variant="outline" className="gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </Badge>
          )}
          {!isDone && (
            <Badge variant={priority.badgeVariant}>{priority.label}</Badge>
          )}
          {dueLabel && (
            <span className={cn("text-xs text-muted-foreground", isOverdue && "text-danger")}>
              {dueLabel}
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {duration}
            </span>
          )}
          {subtasks.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <ListChecks className="h-3 w-3" /> {subtasksDone}/{subtasks.length}
            </span>
          )}
          {task.tags.map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>
      </button>

      <Dropdown>
        <DropdownTrigger asChild>
          <button
            className="focus-ring rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-surface-sunken group-hover:opacity-100"
            aria-label="Task options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownTrigger>
        <DropdownContent align="end">
          <DropdownItem onSelect={() => onEdit(task)}>Edit</DropdownItem>
          <DropdownItem
            onSelect={() => deleteTask(task.id)}
            className="text-danger data-[highlighted]:bg-danger/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </motion.div>
  );
}
