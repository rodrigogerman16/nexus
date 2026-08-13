"use client";

import { AnimatePresence } from "framer-motion";
import type { Task } from "@/lib/store/types";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { TaskCard } from "@/components/tasks/TaskCard";

interface TaskListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  groupByProject?: boolean;
}

export function TaskListView({ tasks, onEdit, groupByProject }: TaskListViewProps) {
  const projects = useTasksStore((s) => s.projects);

  if (!groupByProject) {
    return (
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No tasks here. Enjoy the quiet.
          </p>
        )}
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
      {tasks.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No tasks here. Enjoy the quiet.
        </p>
      )}
    </div>
  );
}
