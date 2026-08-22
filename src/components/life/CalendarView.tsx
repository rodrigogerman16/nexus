"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { isSameDay } from "@/lib/utils";
import { addDays, addMonths } from "@/components/life/lifeMeta";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useAIContextStore } from "@/lib/ai/context";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { EventDialog } from "@/components/life/EventDialog";
import { WeekView } from "@/components/life/WeekView";
import { MonthView } from "@/components/life/MonthView";
import { DayView } from "@/components/life/DayView";
import { DayAgenda } from "@/components/life/DayAgenda";
import { CalendarAssistant } from "@/components/life/CalendarAssistant";
import { CalendarSkeleton } from "@/components/life/CalendarSkeleton";
import type { CalendarEvent } from "@/lib/store/types";

type ViewMode = "month" | "week" | "day";

export function CalendarView() {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const events = useLifeStore((s) => s.events);
  const syncStatus = useLifeStore((s) => s.status);
  const tasks = useTasksStore((s) => s.tasks);
  const setAIContext = useAIContextStore((s) => s.setContext);

  useEffect(() => {
    setAIContext({ type: "calendar" });
  }, [setAIContext]);

  function goPrev() {
    if (view === "month") setAnchor((d) => addMonths(d, -1));
    else if (view === "week") {
      setAnchor((d) => addDays(d, -7));
      setSelected((d) => addDays(d, -7));
    } else {
      setAnchor((d) => addDays(d, -1));
      setSelected((d) => addDays(d, -1));
    }
  }

  function goNext() {
    if (view === "month") setAnchor((d) => addMonths(d, 1));
    else if (view === "week") {
      setAnchor((d) => addDays(d, 7));
      setSelected((d) => addDays(d, 7));
    } else {
      setAnchor((d) => addDays(d, 1));
      setSelected((d) => addDays(d, 1));
    }
  }

  function goToday() {
    const today = new Date();
    setAnchor(today);
    setSelected(today);
  }

  function selectDay(day: Date) {
    setSelected(day);
    if (view === "month" && day.getMonth() !== anchor.getMonth()) setAnchor(day);
  }

  function openNewEvent(day: Date = selected) {
    setEditingEvent(undefined);
    setSelected(day);
    setDialogOpen(true);
  }

  function openEditEvent(event: CalendarEvent) {
    setEditingEvent(event);
    setDialogOpen(true);
  }

  const title =
    view === "day"
      ? selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
      : anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const selectedDayEvents = events
    .filter((e) => isSameDay(e.start, selected))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const selectedDayTasks = tasks.filter((t) => t.dueDate && isSameDay(t.dueDate, selected));

  if (syncStatus === "idle" || syncStatus === "loading") {
    return <CalendarSkeleton />;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="focus-ring rounded-md p-1.5 text-muted-foreground hover:bg-surface-sunken"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            className="focus-ring rounded-md p-1.5 text-muted-foreground hover:bg-surface-sunken"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 className="ml-1 text-sm font-semibold">{title}</h2>
          <button
            onClick={goToday}
            className="focus-ring ml-2 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-surface-sunken"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" className="gap-1.5" onClick={() => openNewEvent()}>
            <Plus className="h-4 w-4" /> Add event
          </Button>
        </div>
      </div>

      <CalendarAssistant referenceDate={selected} />

      {view === "month" && (
        <MonthView anchor={anchor} selected={selected} events={events} onSelectDay={selectDay} />
      )}
      {view === "week" && (
        <WeekView
          anchor={anchor}
          selected={selected}
          events={events}
          onSelectDay={selectDay}
          onSelectEvent={openEditEvent}
        />
      )}
      {view === "day" && (
        <DayView day={selected} events={events} onSelectEvent={openEditEvent} />
      )}

      {view === "month" && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold">
            {isSameDay(selected, new Date())
              ? "Today"
              : selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          <DayAgenda events={selectedDayEvents} tasks={selectedDayTasks} onSelectEvent={openEditEvent} />
        </div>
      )}

      {view !== "month" && selectedDayTasks.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold">Tasks due</h3>
          <DayAgenda events={[]} tasks={selectedDayTasks} />
        </div>
      )}

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={selected}
        event={editingEvent}
      />
    </div>
  );
}
