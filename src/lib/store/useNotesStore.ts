import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { dbNoteToNote, notePatchToDbUpdate, noteToDbRow } from "@/lib/supabase/mappers";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { toast } from "@/lib/store/useToastStore";
import type { Note } from "@/lib/store/types";

type SyncStatus = "idle" | "loading" | "ready" | "error";

interface NotesState {
  notes: Note[];
  userId: string | null;
  status: SyncStatus;
  hydrate: (userId: string | null) => Promise<void>;
  addNote: (note?: Partial<Note>) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
}

/** Same optimistic-write pattern as useTasksStore (see that file for the
 * full rationale): local state updates immediately, Supabase syncs in the
 * background, and a failure rolls back + toasts. */
export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  userId: null,
  status: "idle",

  hydrate: async (userId) => {
    if (!userId) {
      set({ notes: [], userId: null, status: "idle" });
      return;
    }
    set({ userId, status: "loading" });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      console.error(error);
      set({ status: "error" });
      toast.error("Couldn't load your notes.");
      return;
    }
    set({ notes: data.map(dbNoteToNote), status: "ready" });
  },

  addNote: (note) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: crypto.randomUUID(),
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
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("notes")
        .insert(noteToDbRow(newNote, userId))
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error(`Couldn't save "${newNote.title}" — try again.`);
          set({ notes: get().notes.filter((n) => n.id !== newNote.id) });
        });
    }
    return newNote;
  },

  updateNote: (id, patch) => {
    const previous = get().notes;
    set({
      notes: previous.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
      ),
    });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("notes")
        .update(notePatchToDbUpdate(patch))
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't save that change — try again.");
          set({ notes: previous });
        });
    }
  },

  deleteNote: (id) => {
    const previous = get().notes;
    set({ notes: previous.filter((n) => n.id !== id) });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("notes")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't delete that note — try again.");
          set({ notes: previous });
        });
    }
  },

  togglePin: (id) => {
    const previous = get().notes;
    const note = previous.find((n) => n.id === id);
    if (!note) return;
    const pinned = !note.pinned;
    set({ notes: previous.map((n) => (n.id === id ? { ...n, pinned } : n)) });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("notes")
        .update({ is_favorite: pinned })
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't save that change — try again.");
          set({ notes: previous });
        });
    }
  },
}));
