"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { toast } from "@/lib/store/useToastStore";
import type { Task, TaskPriority, TaskStatus } from "@/lib/store/types";
import {
  durationSelectOptions,
  priorityConfig,
  statusConfig,
  statusOrder,
} from "@/components/tasks/taskMeta";
import { cn } from "@/lib/utils";

export interface TaskDraft {
  title?: string;
  dueDate?: string;
  priority?: TaskPriority;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  defaultProjectId?: string;
  /** Prefill for a new task, e.g. from natural-language quick-add — the user
   * still confirms or edits these fields before the task is created. */
  draft?: TaskDraft;
}

export function TaskDialog({ open, onOpenChange, task, defaultProjectId, draft }: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {/* Keying by open/task ensures the form remounts with fresh initial
            state each time it's opened, instead of syncing via an effect. */}
        <TaskDialogForm
          key={`${open}-${task?.id ?? "new"}`}
          task={task}
          defaultProjectId={defaultProjectId}
          draft={draft}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

interface TaskDialogFormProps {
  task?: Task;
  defaultProjectId?: string;
  draft?: TaskDraft;
  onOpenChange: (open: boolean) => void;
}

function TaskDialogForm({ task, defaultProjectId, draft, onOpenChange }: TaskDialogFormProps) {
  const projects = useTasksStore((s) => s.projects);
  const addTask = useTasksStore((s) => s.addTask);
  const updateTask = useTasksStore((s) => s.updateTask);

  const [title, setTitle] = useState(task?.title ?? draft?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [projectId, setProjectId] = useState<string | undefined>(task?.projectId ?? defaultProjectId);
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? draft?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(
    (task?.dueDate ?? draft?.dueDate) ? (task?.dueDate ?? draft!.dueDate)!.slice(0, 10) : ""
  );
  const [duration, setDuration] = useState<string>(
    task?.estimatedDurationMinutes ? String(task.estimatedDurationMinutes) : "none"
  );
  const [tags, setTags] = useState<string[]>(task?.tags ?? []);

  function handleSubmit() {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      projectId,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      estimatedDurationMinutes: duration === "none" ? undefined : Number(duration),
      tags,
    };
    if (task) {
      updateTask(task.id, payload);
      toast.success("Task updated");
    } else {
      addTask(payload);
      toast.success("Task created");
    }
    onOpenChange(false);
  }

  return (
    <>
      <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
      <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-0.5">
        <Input
          autoFocus
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSubmit();
          }}
        />
        <Textarea
          placeholder="Description (optional)"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Project</label>
            <Select
              value={projectId ?? "none"}
              onValueChange={(v) => setProjectId(v === "none" ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOrder.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusConfig[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Priority</label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Due date</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">Estimated duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {durationSelectOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Tags</label>
          <TagInput value={tags} onChange={setTags} />
        </div>

        {task && <SubtasksSection parentTask={task} />}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!title.trim()}>
          {task ? "Save changes" : "Create task"}
        </Button>
      </div>
    </>
  );
}

function SubtasksSection({ parentTask }: { parentTask: Task }) {
  const allTasks = useTasksStore((s) => s.tasks);
  const addTask = useTasksStore((s) => s.addTask);
  const setStatus = useTasksStore((s) => s.setStatus);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const [newSubtask, setNewSubtask] = useState("");

  const subtasks = allTasks.filter((t) => t.parentTaskId === parentTask.id);

  function handleAdd() {
    const title = newSubtask.trim();
    if (!title) return;
    addTask({ title, parentTaskId: parentTask.id, projectId: parentTask.projectId });
    setNewSubtask("");
  }

  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">
        Subtasks {subtasks.length > 0 && `(${subtasks.filter((t) => t.status === "completed").length}/${subtasks.length})`}
      </label>
      <div className="space-y-1">
        {subtasks.map((subtask) => {
          const done = subtask.status === "completed";
          return (
            <div
              key={subtask.id}
              className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-surface-sunken"
            >
              <button
                type="button"
                onClick={() => setStatus(subtask.id, done ? "todo" : "completed")}
                className={cn(
                  "focus-ring flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  done
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border-strong text-transparent hover:border-accent"
                )}
                aria-label={done ? "Mark subtask not done" : "Mark subtask done"}
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </button>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-sm",
                  done ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {subtask.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTask(subtask.id)}
                aria-label="Delete subtask"
                className="rounded p-0.5 text-muted-foreground opacity-0 hover:text-danger group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        <Input
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Add a subtask…"
          className="h-8 text-sm"
        />
        <Button size="sm" variant="secondary" onClick={handleAdd} className="shrink-0 gap-1 px-2.5">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
