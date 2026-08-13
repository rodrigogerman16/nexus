"use client";

import { useMemo } from "react";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { groupActivitiesByDay, iconByType } from "@/components/activity/activityMeta";

export function ActivityFeed() {
  const activities = useActivityStore((s) => s.activities);
  const projects = useTasksStore((s) => s.projects);

  const sorted = useMemo(
    () => [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activities]
  );
  const groups = useMemo(() => groupActivitiesByDay(sorted), [sorted]);

  if (activities.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No activity yet. Actions across NEXUS will show up here.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.label}>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h2>
          <ol className="space-y-1">
            {group.items.map((item) => {
              const Icon = iconByType[item.type];
              const project = item.projectId ? projects.find((p) => p.id === item.projectId) : undefined;
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-sunken"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{item.description}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(item.createdAt).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {project && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="flex items-center gap-1">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
