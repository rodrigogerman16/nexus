import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { dbNotificationToNotification, notificationToDbRow } from "@/lib/supabase/mappers";
import { toast } from "@/lib/store/useToastStore";
import type { AppNotification, NotificationType } from "@/lib/store/types";

type SyncStatus = "idle" | "loading" | "ready" | "error";

interface NotificationsState {
  notifications: AppNotification[];
  userId: string | null;
  status: SyncStatus;
  hydrate: (userId: string | null) => Promise<void>;
  addNotification: (
    notification: Partial<AppNotification> & { type: NotificationType; title: string }
  ) => AppNotification;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

/** Same optimistic-write pattern as useTasksStore/useNotesStore. */
export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  notifications: [],
  userId: null,
  status: "idle",

  hydrate: async (userId) => {
    if (!userId) {
      set({ notifications: [], userId: null, status: "idle" });
      return;
    }
    set({ userId, status: "loading" });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      set({ status: "error" });
      toast.error("Couldn't load your notifications.");
      return;
    }
    set({ notifications: data.map(dbNotificationToNotification), status: "ready" });
  },

  addNotification: (notification) => {
    const newNotification: AppNotification = {
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };
    set({ notifications: [newNotification, ...get().notifications] });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("notifications")
        .insert(notificationToDbRow(newNotification, userId))
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          set({ notifications: get().notifications.filter((n) => n.id !== newNotification.id) });
        });
    }
    return newNotification;
  },

  markRead: (id) => {
    const previous = get().notifications;
    set({
      notifications: previous.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          set({ notifications: previous });
        });
    }
  },

  markAllRead: () => {
    const previous = get().notifications;
    set({ notifications: previous.map((n) => ({ ...n, isRead: true })) });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("notifications")
        .update({ is_read: true })
        .eq("owner_id", userId)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't mark all as read — try again.");
          set({ notifications: previous });
        });
    }
  },

  deleteNotification: (id) => {
    const previous = get().notifications;
    set({ notifications: previous.filter((n) => n.id !== id) });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("notifications")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't delete that notification — try again.");
          set({ notifications: previous });
        });
    }
  },

  clearAll: () => {
    const previous = get().notifications;
    set({ notifications: [] });
    const userId = get().userId;
    if (userId) {
      createClient()
        .from("notifications")
        .delete()
        .eq("owner_id", userId)
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          toast.error("Couldn't clear notifications — try again.");
          set({ notifications: previous });
        });
    }
  },
}));
