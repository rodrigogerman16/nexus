"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/store/types";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { TaskCard } from "@/components/tasks/TaskCard";
import { statusConfig, statusOrder } from "@/components/tasks/taskMeta";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function KanbanBoard({ tasks, onEdit }: KanbanBoardProps) {
  const moveTask = useTasksStore((s) => s.moveTask);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statusOrder.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStatus(status);
            }}
            onDragLeave={() => setDragOverStatus((prev) => (prev === status ? null : prev))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragTaskId) moveTask(dragTaskId, status);
              setDragTaskId(null);
              setDragOverStatus(null);
            }}
            className={cn(
              "flex min-h-[200px] flex-col gap-2 rounded-xl border border-dashed border-transparent bg-surface-sunken/50 p-3 transition-colors",
              dragOverStatus === status && "border-accent bg-accent-soft/40"
            )}
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {statusConfig[status].label}
              </h3>
              <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
            </div>
            <AnimatePresence initial={false}>
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDragTaskId(task.id)}
                  onDragEnd={() => setDragTaskId(null)}
                  onDragOver={(e) => {
                    // Reordering within/into a column: drop before this card
                    // instead of falling through to the column's append-drop.
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverStatus(status);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (dragTaskId && dragTaskId !== task.id) {
                      moveTask(dragTaskId, status, task.id);
                    }
                    setDragTaskId(null);
                    setDragOverStatus(null);
                  }}
                >
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    className={cn(
                      "cursor-grab active:cursor-grabbing",
                      dragTaskId === task.id && "opacity-40"
                    )}
                  />
                </div>
              ))}
            </AnimatePresence>
            {columnTasks.length === 0 && (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                Drop tasks here
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
