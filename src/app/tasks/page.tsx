"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Plus, Sparkles } from "lucide-react";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { TaskListView } from "@/components/tasks/TaskListView";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskDialog, type TaskDraft } from "@/components/tasks/TaskDialog";
import { priorityOrder, statusOrder } from "@/components/tasks/taskMeta";
import { parseTaskInput } from "@/lib/ai/parseTaskInput";
import { useAIContextStore } from "@/lib/ai/context";
import type { Task } from "@/lib/store/types";

export default function TasksPage() {
  const tasks = useTasksStore((s) => s.tasks);
  const projects = useTasksStore((s) => s.projects);
  const setAIContext = useAIContextStore((s) => s.setContext);

  useEffect(() => {
    setAIContext({ type: "tasks" });
  }, [setAIContext]);
  const [view, setView] = useState<"list" | "board">("list");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [draft, setDraft] = useState<TaskDraft | undefined>(undefined);
  const [quickAdd, setQuickAdd] = useState("");
  const quickCreate = useUIStore((s) => s.quickCreate);
  const quickCreateSeed = useUIStore((s) => s.quickCreateSeed);
  const clearQuickCreate = useUIStore((s) => s.clearQuickCreate);

  const topLevelTasks = useMemo(() => tasks.filter((t) => !t.parentTaskId), [tasks]);

  const filteredTasks = useMemo(() => {
    if (projectFilter === "all") return topLevelTasks;
    if (projectFilter === "none") return topLevelTasks.filter((t) => !t.projectId);
    return topLevelTasks.filter((t) => t.projectId === projectFilter);
  }, [topLevelTasks, projectFilter]);

  // Priority-sorted for the list view; the board view keeps the store's raw
  // order so drag-to-reorder within a column sticks between renders.
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (a.status !== b.status) {
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    });
  }, [filteredTasks]);

  function openNewTask() {
    setEditingTask(undefined);
    setDraft(undefined);
    setDialogOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setDraft(undefined);
    setDialogOpen(true);
  }

  function handleQuickAdd() {
    const input = quickAdd.trim();
    if (!input) return;
    const parsed = parseTaskInput(input);
    setEditingTask(undefined);
    setDraft(parsed);
    setDialogOpen(true);
    setQuickAdd("");
  }

  useEffect(() => {
    // Reacting to a one-shot global signal (the "N" shortcut or the command
    // palette's "Create task") rather than syncing to a prop/state change —
    // there's no non-effect way to open this page's dialog from outside the
    // component tree.
    if (quickCreate === "task") {
      if (quickCreateSeed.trim()) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEditingTask(undefined);
        setDraft(parseTaskInput(quickCreateSeed));
        setDialogOpen(true);
      } else {
        openNewTask();
      }
      clearQuickCreate();
    }
  }, [quickCreate, quickCreateSeed, clearQuickCreate]);

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-accent" />
        <Input
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAdd();
          }}
          placeholder="Add a task… e.g. &quot;Finish the portfolio tomorrow at 10am&quot;"
        />
        <Button onClick={handleQuickAdd} size="sm" variant="secondary" className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "board")}>
            <TabsList>
              <TabsTrigger value="list" className="gap-1.5">
                <List className="h-3.5 w-3.5" /> List
              </TabsTrigger>
              <TabsTrigger value="board" className="gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" /> Board
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              <SelectItem value="none">No project</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={openNewTask} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> New task
        </Button>
      </div>

      {view === "list" ? (
        <TaskListView tasks={sortedTasks} onEdit={openEditTask} groupByProject={projectFilter === "all"} />
      ) : (
        <KanbanBoard tasks={filteredTasks} onEdit={openEditTask} />
      )}

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editingTask} draft={draft} />
    </div>
  );
}
