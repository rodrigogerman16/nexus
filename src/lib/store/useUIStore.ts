import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QuickCreateTarget = "task" | "note" | "project" | null;

interface UIState {
  commandPaletteOpen: boolean;
  sidebarCollapsed: boolean;
  notificationsOpen: boolean;
  shortcutsOpen: boolean;
  quickCreate: QuickCreateTarget;
  /** Free text carried alongside a quick-create request, e.g. what the user
   * had typed in the command palette before choosing "Create task: …". */
  quickCreateSeed: string;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  requestQuickCreate: (target: QuickCreateTarget, seed?: string) => void;
  clearQuickCreate: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      commandPaletteOpen: false,
      sidebarCollapsed: false,
      notificationsOpen: false,
      shortcutsOpen: false,
      quickCreate: null,
      quickCreateSeed: "",
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      toggleCommandPalette: () =>
        set({ commandPaletteOpen: !get().commandPaletteOpen }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
      setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
      requestQuickCreate: (target, seed = "") => set({ quickCreate: target, quickCreateSeed: seed }),
      clearQuickCreate: () => set({ quickCreate: null, quickCreateSeed: "" }),
    }),
    {
      name: "acc-ui-store",
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);
