"use client";

import { useMemo } from "react";
import { cn, isSameDay } from "@/lib/utils";
import { weekDays } from "@/components/life/lifeMeta";
import type { CalendarEvent } from "@/lib/store/types";

interface WeekViewProps {
  anchor: Date;
  selected: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
}

export function WeekView({ anchor, selected, events, onSelectDay }: WeekViewProps) {
  const days = useMemo(() => weekDays(anchor), [anchor]);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((day) => {
        const active = isSameDay(day, selected);
        const today = isSameDay(day, new Date());
        const count = events.filter((e) => isSameDay(e.start, day)).length;
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDay(day)}
            className={cn(
              "focus-ring flex flex-col items-center gap-1 rounded-xl border border-transparent py-3 transition-colors",
              active ? "bg-accent text-accent-foreground" : "hover:bg-surface-sunken"
            )}
          >
            <span className={cn("text-[11px] uppercase tracking-wide", active ? "text-accent-foreground/80" : "text-muted-foreground")}>
              {day.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                !active && today && "border border-accent text-accent"
              )}
            >
              {day.getDate()}
            </span>
            {count > 0 && (
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  active ? "bg-accent-foreground" : "bg-accent"
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
