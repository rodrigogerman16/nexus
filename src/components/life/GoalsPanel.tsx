"use client";

import { useState } from "react";
import { Minus, Plus, Target, Trash2 } from "lucide-react";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function daysUntil(iso?: string) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Past due";
  if (days === 0) return "Today";
  return `${days}d left`;
}

export function GoalsPanel() {
  const goals = useLifeStore((s) => s.goals);
  const habits = useLifeStore((s) => s.habits);
  const addGoal = useLifeStore((s) => s.addGoal);
  const updateGoal = useLifeStore((s) => s.updateGoal);
  const deleteGoal = useLifeStore((s) => s.deleteGoal);
  const [newGoalTitle, setNewGoalTitle] = useState("");

  function handleAdd() {
    if (!newGoalTitle.trim()) return;
    addGoal({ title: newGoalTitle.trim() });
    setNewGoalTitle("");
  }

  function adjustProgress(id: string, current: number, delta: number) {
    updateGoal(id, { progress: Math.min(100, Math.max(0, current + delta)) });
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="New goal, e.g. 'Launch the podcast'"
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {goals.map((goal) => {
          const linked = habits.filter((h) => goal.linkedHabitIds.includes(h.id));
          const due = daysUntil(goal.targetDate);
          return (
            <Card key={goal.id} className="group p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold">{goal.title}</h3>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="focus-ring rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                  aria-label="Delete goal"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {goal.description && (
                <p className="mt-1 text-xs text-muted-foreground">{goal.description}</p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-xs font-medium text-muted-foreground">
                  {goal.progress}%
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustProgress(goal.id, goal.progress, -10)}
                    className="focus-ring rounded-md border border-border p-1 text-muted-foreground hover:bg-surface-sunken"
                    aria-label="Decrease progress"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => adjustProgress(goal.id, goal.progress, 10)}
                    className="focus-ring rounded-md border border-border p-1 text-muted-foreground hover:bg-surface-sunken"
                    aria-label="Increase progress"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {linked.map((h) => (
                    <span
                      key={h.id}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: `${h.color}22`, color: h.color }}
                    >
                      {h.name}
                    </span>
                  ))}
                  {due && <span className="text-xs text-muted-foreground">{due}</span>}
                </div>
              </div>
            </Card>
          );
        })}
        {goals.length === 0 && (
          <p className="col-span-2 py-12 text-center text-sm text-muted-foreground">
            No goals yet — add one above.
          </p>
        )}
      </div>
    </div>
  );
}
