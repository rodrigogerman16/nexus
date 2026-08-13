"use client";

import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Sparkles,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { useUIStore } from "@/lib/store/useUIStore";
import type { NotificationType } from "@/lib/store/types";
import { cn } from "@/lib/utils";

const iconByType: Record<NotificationType, typeof Bell> = {
  task_due: AlertTriangle,
  project_update: FolderKanban,
  ai_suggestion: Sparkles,
  calendar_reminder: Calendar,
  task_completed: CheckCircle2,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function NotificationsPanel() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification);
  const open = useUIStore((s) => s.notificationsOpen);
  const setOpen = useUIStore((s) => s.setNotificationsOpen);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="focus-ring relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="focus-ring rounded text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {notifications.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              You&rsquo;re all caught up.
            </p>
          ) : (
            notifications.map((n) => {
              const Icon = iconByType[n.type];
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="group flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-surface-sunken"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      n.isRead ? "bg-surface-sunken text-muted-foreground" : "bg-accent-soft text-accent"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs leading-snug", n.isRead ? "text-muted-foreground" : "text-foreground")}>
                      {n.title}
                    </p>
                    {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    aria-label="Dismiss notification"
                    className="focus-ring rounded p-0.5 text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
