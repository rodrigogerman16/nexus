import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";
import { seedNotifications } from "@/lib/mock/seedData";
import type { AppNotification, NotificationType } from "@/lib/store/types";

interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (
    notification: Partial<AppNotification> & { type: NotificationType; title: string }
  ) => AppNotification;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: seedNotifications,
      addNotification: (notification) => {
        const newNotification: AppNotification = {
          id: generateId("notif"),
          isRead: false,
          createdAt: new Date().toISOString(),
          ...notification,
        };
        set({ notifications: [newNotification, ...get().notifications] });
        return newNotification;
      },
      markRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        });
      },
      markAllRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
        });
      },
      deleteNotification: (id) => {
        set({ notifications: get().notifications.filter((n) => n.id !== id) });
      },
      clearAll: () => set({ notifications: [] }),
    }),
    { name: "acc-notifications-store" }
  )
);
