import { toDateKey } from "@/lib/utils";
import type { Habit } from "@/lib/store/types";

export function calculateStreak(habit: Habit): number {
  let streak = 0;
  const cursor = new Date();
  // If today isn't completed yet, start counting from yesterday so an
  // in-progress day doesn't zero out an existing streak.
  if (!habit.completions[toDateKey(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (habit.completions[toDateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function lastNDays(n: number): Date[] {
  const days: Date[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export function weekDays(anchor: Date): Date[] {
  const start = new Date(anchor);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** A full 6-week (42-day) grid for the month containing `anchor`, including
 * the leading/trailing days from adjacent months needed to fill whole weeks. */
export function monthGrid(anchor: Date): Date[] {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
