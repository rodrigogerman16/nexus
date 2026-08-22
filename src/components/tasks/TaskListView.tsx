"use client";

import { AnimatePresence } from "framer-motion";
import { ListTodo, Plus } from "lucide-react";
import type { Task } from "@/lib/store/types";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/Button";

interface TaskListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onCreate: () => void;
  groupByProject?: boolean;
}

function EmptyTasks({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border py-20 text-center">
      <ListTodo className="h-8 w-8 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">No tasks here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a task and NEXUS will help you stay on top of it.
        </p>
      </div>
      <Button onClick={onCreate} size="sm" className="gap-1.5">
        <Plus className="h-4 w-4" /> New task
      </Button>
    </div>
  );
}

export function TaskListView({ tasks, onEdit, onCreate, groupByProject }: TaskListViewProps) {
  const projects = useTasksStore((s) => s.projects);

  if (!groupByProject) {
    return (
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && <EmptyTasks onCreate={onCreate} />}
      </div>
    );
  }

  const grouped = projects
    .map((project) => ({
      project,
      tasks: tasks.filter((t) => t.projectId === project.id),
    }))
    .filter((g) => g.tasks.length > 0);

  const unassigned = tasks.filter((t) => !t.projectId);

  return (
    <div className="space-y-6">
      {grouped.map(({ project, tasks: projectTasks }) => (
        <div key={project.id}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <h3 className="text-sm font-semibold">{project.name}</h3>
            <span className="text-xs text-muted-foreground">{projectTasks.length}</span>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {projectTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={onEdit} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
      {unassigned.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="h-2 w-2 rounded-full bg-border-strong" />
            <h3 className="text-sm font-semibold">No project</h3>
            <span className="text-xs text-muted-foreground">{unassigned.length}</span>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {unassigned.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={onEdit} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      {tasks.length === 0 && <EmptyTasks onCreate={onCreate} />}
    </div>
  );
}
