import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";
import { seedNotes } from "@/lib/mock/seedData";
import { useActivityStore } from "@/lib/store/useActivityStore";
import type { Note } from "@/lib/store/types";

interface NotesState {
  notes: Note[];
  addNote: (note?: Partial<Note>) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: seedNotes,
      addNote: (note) => {
        const now = new Date().toISOString();
        const newNote: Note = {
          id: generateId("note"),
          title: "Untitled",
          content: "",
          tags: [],
          pinned: false,
          createdAt: now,
          updatedAt: now,
          ...note,
        };
        set({ notes: [newNote, ...get().notes] });
        useActivityStore.getState().addActivity({
          type: "note_created",
          description: `Created note "${newNote.title}"`,
          projectId: newNote.projectId,
        });
        return newNote;
      },
      updateNote: (id, patch) => {
        set({
          notes: get().notes.map((n) =>
            n.id === id
              ? { ...n, ...patch, updatedAt: new Date().toISOString() }
              : n
          ),
        });
      },
      deleteNote: (id) => {
        set({ notes: get().notes.filter((n) => n.id !== id) });
      },
      togglePin: (id) => {
        set({
          notes: get().notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n
          ),
        });
      },
    }),
    { name: "acc-notes-store" }
  )
);
