"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { ProjectsSkeleton } from "@/components/projects/ProjectsSkeleton";
import { statusConfig, statusOrder } from "@/components/projects/projectMeta";
import type { ProjectStatus } from "@/lib/store/types";

export default function ProjectsPage() {
  const projects = useTasksStore((s) => s.projects);
  const syncStatus = useTasksStore((s) => s.status);
  const [filter, setFilter] = useState<"all" | ProjectStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialName, setInitialName] = useState("");
  const quickCreate = useUIStore((s) => s.quickCreate);
  const quickCreateSeed = useUIStore((s) => s.quickCreateSeed);
  const clearQuickCreate = useUIStore((s) => s.clearQuickCreate);

  const filtered = useMemo(() => {
    const list = filter === "all" ? projects : projects.filter((p) => p.status === filter);
    return [...list].sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
  }, [projects, filter]);

  useEffect(() => {
    // Reacting to a one-shot global signal (the "P" shortcut) rather than
    // syncing to a prop/state change — there's no non-effect way to open
    // this page's dialog from outside the component tree.
    if (quickCreate === "project") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialName(quickCreateSeed);
      setDialogOpen(true);
      clearQuickCreate();
    }
  }, [quickCreate, quickCreateSeed, clearQuickCreate]);

  if (syncStatus === "idle" || syncStatus === "loading") {
    return <ProjectsSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {statusOrder.map((s) => (
              <TabsTrigger key={s} value={s}>
                {statusConfig[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button
          onClick={() => {
            setInitialName("");
            setDialogOpen(true);
          }}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border py-20 text-center">
          <FolderKanban className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">No projects here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start something new and let NEXUS help you organize it.
            </p>
          </div>
          <Button
            onClick={() => {
              setInitialName("");
              setDialogOpen(true);
            }}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> Create project
          </Button>
        </div>
      )}

      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} initialName={initialName} />
    </div>
  );
}
