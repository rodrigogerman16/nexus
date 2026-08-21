import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShortcutActionId = "search" | "newTask" | "newNote" | "newProject" | "help";

export interface ShortcutAction {
  id: ShortcutActionId;
  label: string;
  defaultKey: string;
}

export const SHORTCUT_ACTIONS: ShortcutAction[] = [
  { id: "search", label: "Search / command palette", defaultKey: "/" },
  { id: "newTask", label: "New task", defaultKey: "n" },
  { id: "newNote", label: "New note", defaultKey: "N" },
  { id: "newProject", label: "New project", defaultKey: "p" },
  { id: "help", label: "Show keyboard shortcuts", defaultKey: "?" },
];

export type ShortcutBindings = Record<ShortcutActionId, string>;

const defaultBindings: ShortcutBindings = Object.fromEntries(
  SHORTCUT_ACTIONS.map((a) => [a.id, a.defaultKey])
) as ShortcutBindings;

/** Keys that can never be assigned to a rebindable action because the
 * keyboard-shortcut hook (and the wider app) already gives them fixed
 * meaning — "g" starts the navigation chord, Escape closes dialogs. */
export const RESERVED_KEYS = ["g", "G", "Escape"];

interface ShortcutsState {
  bindings: ShortcutBindings;
  setBinding: (id: ShortcutActionId, key: string) => void;
  resetBinding: (id: ShortcutActionId) => void;
  resetAll: () => void;
}

export const useShortcutsStore = create<ShortcutsState>()(
  persist(
    (set, get) => ({
      bindings: defaultBindings,
      setBinding: (id, key) => set({ bindings: { ...get().bindings, [id]: key } }),
      resetBinding: (id) => set({ bindings: { ...get().bindings, [id]: defaultBindings[id] } }),
      resetAll: () => set({ bindings: defaultBindings }),
    }),
    { name: "shortcuts-store" }
  )
);
