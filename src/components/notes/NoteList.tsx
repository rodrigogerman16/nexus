"use client";

import { Pin, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/store/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTasksStore } from "@/lib/store/useTasksStore";

interface NoteListProps {
  notes: Note[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

function snippet(content: string) {
  const stripped = content
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`>~-]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return stripped.slice(0, 80) || "No content yet";
}

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function NoteRow({
  note,
  active,
  onSelect,
}: {
  note: Note;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const project = useTasksStore((s) => s.projects.find((p) => p.id === note.projectId));

  return (
    <button
      onClick={() => onSelect(note.id)}
      className={cn(
        "focus-ring mb-1 w-full rounded-lg px-2.5 py-2 text-left transition-colors",
        active ? "bg-accent-soft" : "hover:bg-surface-sunken"
      )}
    >
      <div className="flex items-center gap-1.5">
        {note.pinned && <Pin className="h-3 w-3 shrink-0 fill-accent text-accent" />}
        {project && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
          />
        )}
        <p
          className={cn(
            "truncate text-sm font-medium",
            active ? "text-accent" : "text-foreground"
          )}
        >
          {note.title || "Untitled"}
        </p>
      </div>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {relativeTime(note.updatedAt)} · {snippet(note.content)}
      </p>
    </button>
  );
}

export function NoteList({
  notes,
  selectedId,
  onSelect,
  onCreate,
  search,
  onSearchChange,
}: NoteListProps) {
  const pinned = notes.filter((n) => n.pinned);
  const rest = notes.filter((n) => !n.pinned);

  return (
    <div className="flex h-full min-h-0 w-full flex-col border-r border-border md:w-72 md:shrink-0">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes…"
            className="pl-8"
          />
        </div>
        <Button size="icon" variant="secondary" onClick={onCreate} aria-label="New note">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {pinned.length > 0 && (
          <>
            <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Pinned
            </p>
            {pinned.map((note) => (
              <NoteRow key={note.id} note={note} active={note.id === selectedId} onSelect={onSelect} />
            ))}
            <div className="my-2 h-px bg-border" />
          </>
        )}
        {rest.map((note) => (
          <NoteRow key={note.id} note={note} active={note.id === selectedId} onSelect={onSelect} />
        ))}
        {notes.length === 0 && (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            No notes match your search.
          </p>
        )}
      </div>
    </div>
  );
}
