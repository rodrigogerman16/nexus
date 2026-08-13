"use client";

import Link from "next/link";
import { Check, Flame } from "lucide-react";
import { cn, toDateKey } from "@/lib/utils";
import { calculateStreak } from "@/components/life/lifeMeta";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function TodayHabits() {
  const habits = useLifeStore((s) => s.habits);
  const toggleHabitCompletion = useLifeStore((s) => s.toggleHabitCompletion);
  const todayKey = toDateKey(new Date());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-accent" /> Habits
        </CardTitle>
        <Link href="#habits-goals" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {habits.map((habit) => {
          const done = !!habit.completions[todayKey];
          const streak = calculateStreak(habit);
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabitCompletion(habit.id)}
              className="focus-ring flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-sunken"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  done ? "text-white" : "border-border-strong text-transparent"
                )}
                style={done ? { backgroundColor: habit.color, borderColor: habit.color } : undefined}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className={cn("flex-1 text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>
                {habit.name}
              </span>
              {streak > 0 && (
                <span className="text-xs font-medium text-warning">{streak}d</span>
              )}
            </button>
          );
        })}
        {habits.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No habits yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
