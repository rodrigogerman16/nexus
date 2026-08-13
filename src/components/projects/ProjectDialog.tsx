"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { toast } from "@/lib/store/useToastStore";
import type { Project, ProjectStatus } from "@/lib/store/types";
import { statusConfig } from "@/components/projects/projectMeta";
import { useRouter } from "next/navigation";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  /** Prefill for a new project's name, e.g. from the command palette. */
  initialName?: string;
}

export function ProjectDialog({ open, onOpenChange, project, initialName }: ProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ProjectDialogForm
          key={`${open}-${project?.id ?? "new"}`}
          project={project}
          initialName={initialName}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

const colorOptions = ["#22d3ee", "#ff6b3d", "#4cc98a", "#6c6472", "#f0bc4e", "#eb5b8c"];

function ProjectDialogForm({
  project,
  initialName,
  onOpenChange,
}: {
  project?: Project;
  initialName?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const addProject = useTasksStore((s) => s.addProject);
  const updateProject = useTasksStore((s) => s.updateProject);

  const [name, setName] = useState(project?.name ?? initialName ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "planning");
  const [deadline, setDeadline] = useState(project?.deadline ? project.deadline.slice(0, 10) : "");
  const [color, setColor] = useState(project?.color ?? colorOptions[0]);

  function handleSubmit() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      status,
      color,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    };
    if (project) {
      updateProject(project.id, payload);
      toast.success("Project updated");
    } else {
      const created = addProject({ ...payload, icon: "Folder" });
      toast.success("Project created");
      onOpenChange(false);
      router.push(`/projects/${created.id}`);
      return;
    }
    onOpenChange(false);
  }

  return (
    <>
      <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
      <div className="mt-4 space-y-3">
        <Input
          autoFocus
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSubmit();
          }}
        />
        <Textarea
          placeholder="Description (optional)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Deadline</label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">Color</label>
          <div className="flex gap-2">
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                className="focus-ring h-6 w-6 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  outline: color === c ? "2px solid var(--foreground)" : undefined,
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          {project ? "Save changes" : "Create project"}
        </Button>
      </div>
    </>
  );
}
