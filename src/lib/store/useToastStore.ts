import { create } from "zustand";
import { generateId } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  action?: ToastAction;
}

interface ToastState {
  toasts: ToastItem[];
  push: (variant: ToastVariant, message: string, action?: ToastAction) => void;
  dismiss: (id: string) => void;
}

/** Ephemeral, unpersisted — toasts are a moment-in-time notification, not
 * app state that should survive a reload. */
export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (variant, message, action) => {
    const id = generateId("toast");
    set({ toasts: [...get().toasts, { id, variant, message, action }] });
    // A toast offering a recovery action stays up longer — the point of
    // giving the user something to click is defeated if it vanishes before
    // they've read it.
    window.setTimeout(() => get().dismiss(id), action ? 8000 : 3500);
  },
  dismiss: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push("success", message),
  error: (message: string, action?: ToastAction) =>
    useToastStore.getState().push("error", message, action),
  info: (message: string) => useToastStore.getState().push("info", message),
};
