"use client";

import Link from "next/link";
import { ListTodo } from "lucide-react";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { isSameDay } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { useState } from "react";
import type { Task } from "@/lib/store/types";

export function TodayTasks() {
  const tasks = useTasksStore((s) => s.tasks);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const today = new Date();
  const dueToday = tasks
    .filter((t) => !t.parentTaskId && t.status !== "completed" && t.dueDate && isSameDay(t.dueDate, today))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  const overdue = tasks.filter(
    (t) =>
      !t.parentTaskId &&
      t.status !== "completed" &&
      t.dueDate &&
      new Date(t.dueDate) < today &&
      !isSameDay(t.dueDate, today)
  );
  const combined = [...overdue, ...dueToday];

  function openEdit(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-accent" /> Due today
        </CardTitle>
        <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {combined.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={openEdit} />
        ))}
        {combined.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing due today. Clear runway ahead.
          </p>
        )}
      </CardContent>
      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editingTask} />
    </Card>
  );
}
