"use client";

import { useMemo } from "react";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { isSameDay } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/store/types";

interface DayViewProps {
  day: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;
const HOUR_HEIGHT = 48;

function assignLanes(events: CalendarEvent[]): { laneOf: Map<string, number>; laneCount: number } {
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

export function DayView({ day, events, onSelectEvent }: DayViewProps) {
  const projects = useTasksStore((s) => s.projects);

  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(e.start, day)),
    [events, day]
  );
  const { laneOf, laneCount } = useMemo(() => assignLanes(dayEvents), [dayEvents]);

  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);
  const gridHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;

  return (
    <div className="flex overflow-hidden rounded-lg border border-border">
      <div className="w-14 shrink-0 border-r border-border">
        {hours.map((hour) => (
          <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative">
            <span className="absolute -top-2 right-2 text-[11px] text-muted-foreground">
              {hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`}
            </span>
          </div>
        ))}
      </div>
      <div className="relative flex-1" style={{ height: gridHeight }}>
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
          const height = Math.max(22, (endOffset - startOffset) * HOUR_HEIGHT - 2);
          const lane = laneOf.get(event.id) ?? 0;
          const project = event.projectId ? projects.find((p) => p.id === event.projectId) : undefined;

          return (
            <button
              key={event.id}
              onClick={() => onSelectEvent(event)}
              className="focus-ring absolute overflow-hidden rounded-md border px-2 py-1 text-left transition-[filter] hover:brightness-110"
              style={{
                top,
                height,
                left: `${(lane / laneCount) * 100}%`,
                width: `calc(${100 / laneCount}% - 4px)`,
                backgroundColor: `${event.color ?? "var(--accent)"}22`,
                borderColor: event.color ?? "var(--accent)",
              }}
            >
              <p className="truncate text-xs font-semibold" style={{ color: event.color ?? "var(--accent)" }}>
                {event.title}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                {project ? ` · ${project.name}` : ""}
              </p>
            </button>
          );
        })}

        {dayEvents.length === 0 && (
          <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-muted-foreground">
            Nothing scheduled for this day.
          </p>
        )}
      </div>
    </div>
  );
}
