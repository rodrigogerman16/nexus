"use client";

import { useMemo } from "react";
import { cn, isSameDay } from "@/lib/utils";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { assignLanes, DAY_END_HOUR, DAY_START_HOUR, HOUR_HEIGHT, weekDays } from "@/components/life/lifeMeta";
import type { CalendarEvent } from "@/lib/store/types";

interface WeekViewProps {
  anchor: Date;
  selected: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export function WeekView({ anchor, selected, events, onSelectDay, onSelectEvent }: WeekViewProps) {
  const days = useMemo(() => weekDays(anchor), [anchor]);
  const projects = useTasksStore((s) => s.projects);
  const today = new Date();

  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);
  const gridHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;

  const eventsByDay = useMemo(
    () =>
      days.map((day) => {
        const dayEvents = events.filter((e) => isSameDay(e.start, day));
        return { day, events: dayEvents, ...assignLanes(dayEvents) };
      }),
    [days, events]
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className="min-w-[640px]">
        <div className="flex border-b border-border">
          <div className="w-14 shrink-0" />
          {days.map((day) => {
            const active = isSameDay(day, selected);
            const isToday = isSameDay(day, today);
            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDay(day)}
                className={cn(
                  "focus-ring flex flex-1 flex-col items-center gap-0.5 border-l border-border py-2 transition-colors",
                  active ? "bg-accent-soft" : "hover:bg-surface-sunken"
                )}
              >
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    active
                      ? "bg-accent text-accent-foreground"
                      : isToday
                        ? "border border-accent text-accent"
                        : "text-foreground"
                  )}
                >
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex">
          <div className="w-14 shrink-0 border-r border-border">
            {hours.map((hour) => (
              <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative">
                <span className="absolute -top-2 right-2 text-[11px] text-muted-foreground">
                  {hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`}
                </span>
              </div>
            ))}
          </div>

          {eventsByDay.map(({ day, events: dayEvents, laneOf, laneCount }) => (
            <div key={day.toISOString()} className="relative flex-1 border-l border-border" style={{ height: gridHeight }}>
              {hours.slice(0, -1).map((hour) => (
                <div
                  key={hour}
                  className="absolute inset-x-0 border-t border-border"
                  style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}
                />
              ))}

              {dayEvents.map((event) => {
                const start = new Date(event.start);
                const end = new Date(event.end);
                const startOffset = Math.max(0, start.getHours() + start.getMinutes() / 60 - DAY_START_HOUR);
                const endOffset = Math.min(
                  DAY_END_HOUR - DAY_START_HOUR,
                  end.getHours() + end.getMinutes() / 60 - DAY_START_HOUR
                );
                const top = startOffset * HOUR_HEIGHT;
                const height = Math.max(20, (endOffset - startOffset) * HOUR_HEIGHT - 2);
                const lane = laneOf.get(event.id) ?? 0;
                const project = event.projectId ? projects.find((p) => p.id === event.projectId) : undefined;

                return (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    title={`${event.title}${project ? ` · ${project.name}` : ""}`}
                    className="focus-ring absolute overflow-hidden rounded-md border px-1.5 py-0.5 text-left transition-[filter] hover:brightness-110"
                    style={{
                      top,
                      height,
                      left: `${(lane / laneCount) * 100}%`,
                      width: `calc(${100 / laneCount}% - 3px)`,
                      backgroundColor: `${event.color ?? "var(--accent)"}22`,
                      borderColor: event.color ?? "var(--accent)",
                    }}
                  >
                    <p className="truncate text-[11px] font-semibold" style={{ color: event.color ?? "var(--accent)" }}>
                      {event.title}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </button>
                );
              })}

              {dayEvents.length === 0 && (
                <span className="sr-only">Nothing scheduled</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
