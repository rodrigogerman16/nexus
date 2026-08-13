"use client";

import Link from "next/link";
import { FileText, Pin } from "lucide-react";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function TodayNotes() {
  const notes = useNotesStore((s) => s.notes);
  const featured = [...notes]
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" /> Notes
        </CardTitle>
        <Link href="/notes" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {featured.map((note) => (
          <Link
            key={note.id}
            href="/notes"
            className="focus-ring flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-surface-sunken"
          >
            {note.pinned && <Pin className="h-3 w-3 shrink-0 fill-accent text-accent" />}
            <span className="truncate">{note.title || "Untitled"}</span>
          </Link>
        ))}
        {featured.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No notes yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
