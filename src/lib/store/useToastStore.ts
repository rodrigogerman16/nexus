import { create } from "zustand";
import { generateId } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (variant: ToastVariant, message: string) => void;
  dismiss: (id: string) => void;
}

/** Ephemeral, unpersisted — toasts are a moment-in-time notification, not
 * app state that should survive a reload. */
export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (variant, message) => {
    const id = generateId("toast");
    set({ toasts: [...get().toasts, { id, variant, message }] });
    window.setTimeout(() => get().dismiss(id), 3500);
  },
  dismiss: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push("success", message),
  error: (message: string) => useToastStore.getState().push("error", message),
  info: (message: string) => useToastStore.getState().push("info", message),
};
