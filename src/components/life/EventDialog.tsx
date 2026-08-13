"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { toDateKey } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/store/types";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: Date;
  event?: CalendarEvent;
}

const accentColors = ["#ff6b3d", "#4cc98a", "#6c6472", "#f0bc4e", "#22d3ee", "#eb5b8c"];

export function EventDialog({ open, onOpenChange, defaultDate, event }: EventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Keying by open/event forces a fresh mount (and fresh initial
            state) each time the dialog opens, instead of syncing via an effect. */}
        <EventDialogForm
          key={`${open}-${event?.id ?? "new"}`}
          defaultDate={defaultDate}
          event={event}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

interface EventDialogFormProps {
  defaultDate: Date;
  event?: CalendarEvent;
  onOpenChange: (open: boolean) => void;
}

function toTimeInput(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function EventDialogForm({ defaultDate, event, onOpenChange }: EventDialogFormProps) {
  const addEvent = useLifeStore((s) => s.addEvent);
  const updateEvent = useLifeStore((s) => s.updateEvent);
  const deleteEvent = useLifeStore((s) => s.deleteEvent);
  const projects = useTasksStore((s) => s.projects);

  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(toDateKey(event ? new Date(event.start) : defaultDate));
  const [start, setStart] = useState(event ? toTimeInput(event.start) : "09:00");
  const [end, setEnd] = useState(event ? toTimeInput(event.end) : "10:00");
  const [color, setColor] = useState(event?.color ?? accentColors[0]);
  const [projectId, setProjectId] = useState<string | undefined>(event?.projectId);

  function handleSubmit() {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      start: new Date(`${date}T${start}`).toISOString(),
      end: new Date(`${date}T${end}`).toISOString(),
      color,
      projectId,
    };
    if (event) {
      updateEvent(event.id, payload);
    } else {
      addEvent(payload);
    }
    onOpenChange(false);
  }

  return (
    <>
      <DialogTitle>{event ? "Edit event" : "New event"}</DialogTitle>
      <div className="mt-4 space-y-3">
        <Input
          autoFocus
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Start</label>
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">End</label>
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Project</label>
          <Select
            value={projectId ?? "none"}
            onValueChange={(v) => setProjectId(v === "none" ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Color</span>
          {accentColors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="focus-ring h-5 w-5 rounded-full"
              style={{
                backgroundColor: c,
                outline: color === c ? "2px solid var(--foreground)" : undefined,
                outlineOffset: 2,
              }}
              aria-label={`Choose color ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-2">
        {event ? (
          <button
            onClick={() => {
              deleteEvent(event.id);
              onOpenChange(false);
            }}
            className="focus-ring flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-danger hover:bg-danger/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {event ? "Save changes" : "Create event"}
          </Button>
        </div>
      </div>
    </>
  );
}
