"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ListTodo } from "lucide-react";
import { useTasksStore } from "@/lib/store/useTasksStore";
import type { CalendarEvent, Task } from "@/lib/store/types";

interface DayAgendaProps {
  events: CalendarEvent[];
  tasks: Task[];
  onSelectEvent?: (event: CalendarEvent) => void;
}

export function DayAgenda({ events, tasks, onSelectEvent }: DayAgendaProps) {
  const projects = useTasksStore((s) => s.projects);

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {events.map((event) => {
          const project = event.projectId ? projects.find((p) => p.id === event.projectId) : undefined;
          return (
            <motion.button
              key={event.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelectEvent?.(event)}
              className="focus-ring flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong"
            >
              <span
                className="h-8 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: event.color ?? "var(--accent)" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{event.title}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span>
                    {new Date(event.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    {" – "}
                    {new Date(event.end).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </span>
                  {project && (
                    <span className="flex items-center gap-1">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>

      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3"
        >
          <ListTodo className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground">{task.title}</p>
            <p className="text-xs text-muted-foreground">
              Due {new Date(task.dueDate!).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        </div>
      ))}

      {events.length === 0 && tasks.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nothing scheduled for this day.
        </p>
      )}
    </div>
  );
}
