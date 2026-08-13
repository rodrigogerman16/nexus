"use client";

import { useMemo } from "react";
import { cn, isSameDay } from "@/lib/utils";
import { monthGrid } from "@/components/life/lifeMeta";
import type { CalendarEvent } from "@/lib/store/types";

interface MonthViewProps {
  anchor: Date;
  selected: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const maxVisibleEvents = 2;

export function MonthView({ anchor, selected, events, onSelectDay }: MonthViewProps) {
  const days = useMemo(() => monthGrid(anchor), [anchor]);
  const today = new Date();

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {weekdayLabels.map((label) => (
          <div key={label} className="px-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const inMonth = day.getMonth() === anchor.getMonth();
          const active = isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          const dayEvents = events
            .filter((e) => isSameDay(e.start, day))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={cn(
                "focus-ring flex min-h-[76px] flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition-colors",
                active
                  ? "border-accent bg-accent-soft"
                  : "border-transparent hover:bg-surface-sunken",
                !inMonth && "opacity-40"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
                  active ? "bg-accent text-accent-foreground" : isToday ? "border border-accent text-accent" : "text-foreground"
                )}
              >
                {day.getDate()}
              </span>
              <div className="w-full space-y-0.5">
                {dayEvents.slice(0, maxVisibleEvents).map((event) => (
                  <span
                    key={event.id}
                    className="block truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight"
                    style={{
                      backgroundColor: `${event.color ?? "var(--accent)"}22`,
                      color: event.color ?? "var(--accent)",
                    }}
                  >
                    {event.title}
                  </span>
                ))}
                {dayEvents.length > maxVisibleEvents && (
                  <span className="block px-1 text-[10px] text-muted-foreground">
                    +{dayEvents.length - maxVisibleEvents} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
