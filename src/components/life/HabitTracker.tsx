"use client";

import { useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { cn, toDateKey } from "@/lib/utils";
import { calculateStreak, lastNDays } from "@/components/life/lifeMeta";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const palette = ["#ff6b3d", "#4cc98a", "#6c6472", "#f0bc4e"];

export function HabitTracker() {
  const habits = useLifeStore((s) => s.habits);
  const toggleHabitCompletion = useLifeStore((s) => s.toggleHabitCompletion);
  const addHabit = useLifeStore((s) => s.addHabit);
  const deleteHabit = useLifeStore((s) => s.deleteHabit);
  const [newHabitName, setNewHabitName] = useState("");
  const days = lastNDays(7);

  function handleAdd() {
    if (!newHabitName.trim()) return;
    addHabit({
      name: newHabitName.trim(),
      color: palette[habits.length % palette.length],
    });
    setNewHabitName("");
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="New habit, e.g. 'Drink water'"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="space-y-2">
        {habits.map((habit) => {
          const streak = calculateStreak(habit);
          const todayKey = toDateKey(new Date());
          const doneToday = !!habit.completions[todayKey];
          return (
            <Card key={habit.id} className="group flex items-center gap-4 p-3.5">
              <button
                onClick={() => toggleHabitCompletion(habit.id)}
                className={cn(
                  "focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  doneToday ? "text-white" : "border-border-strong text-transparent hover:border-accent"
                )}
                style={doneToday ? { backgroundColor: habit.color, borderColor: habit.color } : undefined}
                aria-label={doneToday ? "Mark not done today" : "Mark done today"}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{habit.name}</p>
                  {streak > 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-warning">
                      <Flame className="h-3 w-3" /> {streak}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex gap-1">
                  {days.map((d) => {
                    const key = toDateKey(d);
                    const done = !!habit.completions[key];
                    return (
                      <span
                        key={key}
                        title={d.toLocaleDateString()}
                        className="h-2.5 w-4 rounded-sm"
                        style={{
                          backgroundColor: done ? habit.color : "var(--border)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => deleteHabit(habit.id)}
                className="focus-ring rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                aria-label="Delete habit"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          );
        })}
        {habits.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No habits yet — add one above to start tracking.
          </p>
        )}
      </div>
    </div>
  );
}
