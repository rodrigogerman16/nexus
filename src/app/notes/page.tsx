"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NotesSkeleton } from "@/components/notes/NotesSkeleton";

export default function NotesPage() {
  const notes = useNotesStore((s) => s.notes);
  const syncStatus = useNotesStore((s) => s.status);
  const addNote = useNotesStore((s) => s.addNote);
  const quickCreate = useUIStore((s) => s.quickCreate);
  const clearQuickCreate = useUIStore((s) => s.clearQuickCreate);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(notes[0]?.id);

  const filteredNotes = useMemo(() => {
    const sorted = [...notes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, search]);

  const selectedNote = notes.find((n) => n.id === selectedId);

  function handleCreate() {
    const newNote = addNote();
    setSelectedId(newNote.id);
  }

  function handleDeleted() {
    setSelectedId(undefined);
  }

  useEffect(() => {
    // Reacting to a one-shot global signal (the "Shift+N" shortcut) rather
    // than syncing to a prop/state change — there's no non-effect way to
    // open this page's dialog from outside the component tree.
    if (quickCreate === "note") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleCreate();
      clearQuickCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickCreate, clearQuickCreate]);

  if (syncStatus === "idle" || syncStatus === "loading") {
    return <NotesSkeleton />;
  }

  return (
    <div className="flex h-full min-h-0">
      <div className={selectedId ? "hidden md:flex md:h-full md:min-h-0" : "flex h-full min-h-0 w-full md:w-auto md:flex"}>
        <NoteList
          notes={filteredNotes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={handleCreate}
          search={search}
          onSearchChange={setSearch}
        />
      </div>

      <div className={selectedId ? "flex h-full min-h-0 w-full flex-col" : "hidden md:flex md:min-h-0 md:flex-1"}>
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onDeleted={handleDeleted}
            onBack={() => setSelectedId(undefined)}
          />
        ) : (
          <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="h-8 w-8" strokeWidth={1.5} />
            <p className="text-sm">Select a note or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
