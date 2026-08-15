import { toDateKey } from "@/lib/utils";
import type { CalendarEvent, Habit } from "@/lib/store/types";

/** Shared time-grid constants for the Day and Week calendar views — keeping
 * them in one place means both grids stay pixel-aligned with each other. */
export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 22;
export const HOUR_HEIGHT = 48;

/** Packs overlapping events into side-by-side lanes (like most calendar
 * UIs) rather than letting them stack on top of one another. Greedy: each
 * event goes in the first lane whose last event has already ended. */
export function assignLanes(events: CalendarEvent[]): {
  laneOf: Map<string, number>;
  laneCount: number;
} {
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const lanes: CalendarEvent[][] = [];
  const laneOf = new Map<string, number>();
  for (const event of sorted) {
    const startMs = new Date(event.start).getTime();
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const lastInLane = lanes[i][lanes[i].length - 1];
      if (new Date(lastInLane.end).getTime() <= startMs) {
        lanes[i].push(event);
        laneOf.set(event.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([event]);
      laneOf.set(event.id, lanes.length - 1);
    }
  }
  return { laneOf, laneCount: Math.max(1, lanes.length) };
}

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
