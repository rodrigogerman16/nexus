"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { isSameDay } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function TodaySchedule() {
  const events = useLifeStore((s) => s.events);
  const today = new Date();
  const todayEvents = events
    .filter((e) => isSameDay(e.start, today))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-accent" /> Today’s schedule
        </CardTitle>
        <Link href="/calendar" className="text-xs text-muted-foreground hover:text-foreground">
          View calendar
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {todayEvents.map((event) => (
          <div key={event.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <span
              className="h-8 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: event.color ?? "var(--accent)" }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(event.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                {" – "}
                {new Date(event.end).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {todayEvents.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No meetings today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
