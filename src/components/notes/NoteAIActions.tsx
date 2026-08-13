"use client";

import { useState } from "react";
import {
  CheckSquare,
  Eraser,
  ListChecks,
  Search as SearchIcon,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { toast } from "@/lib/store/useToastStore";
import {
  explainNote,
  extractTasksFromNote,
  findKeyPoints,
  generateChecklist,
  improveWriting,
  summarizeNote,
} from "@/lib/ai/noteActions";
import type { Note } from "@/lib/store/types";

type ActionKey = "summarize" | "improve" | "extract" | "checklist" | "keypoints" | "explain";

const actions: { key: ActionKey; label: string; icon: typeof Sparkles }[] = [
  { key: "summarize", label: "Summarize", icon: SearchIcon },
  { key: "improve", label: "Improve writing", icon: Wand2 },
  { key: "extract", label: "Extract tasks", icon: CheckSquare },
  { key: "checklist", label: "Generate checklist", icon: ListChecks },
  { key: "keypoints", label: "Find key points", icon: Sparkles },
  { key: "explain", label: "Explain", icon: Eraser },
];

interface NoteAIActionsProps {
  note: Note;
  content: string;
  onReplaceContent: (content: string) => void;
  onAppendContent: (addition: string) => void;
}

export function NoteAIActions({ note, content, onReplaceContent, onAppendContent }: NoteAIActionsProps) {
  const addTask = useTasksStore((s) => s.addTask);
  const [active, setActive] = useState<ActionKey | null>(null);
  const [textResult, setTextResult] = useState("");
  const [taskCandidates, setTaskCandidates] = useState<{ title: string; selected: boolean }[]>([]);

  function run(key: ActionKey) {
    setActive(key);
    switch (key) {
      case "summarize":
        setTextResult(summarizeNote(content));
        break;
      case "improve":
        setTextResult(improveWriting(content));
        break;
      case "checklist":
        setTextResult(generateChecklist(content));
        break;
      case "keypoints":
        setTextResult(findKeyPoints(content).map((p) => `- ${p}`).join("\n") || "No clear key points found.");
        break;
      case "explain":
        setTextResult(explainNote(content, note.title));
        break;
      case "extract": {
        const found = extractTasksFromNote(content);
        setTaskCandidates(found.map((title) => ({ title, selected: true })));
        break;
      }
    }
  }

  function dismiss() {
    setActive(null);
    setTextResult("");
    setTaskCandidates([]);
  }

  function createSelectedTasks() {
    const selected = taskCandidates.filter((c) => c.selected);
    for (const candidate of selected) {
      addTask({ title: candidate.title, projectId: note.projectId });
    }
    toast.success(`Created ${selected.length} task${selected.length === 1 ? "" : "s"}`);
    dismiss();
  }

  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-2 px-3 py-2">
        <Dropdown>
          <DropdownTrigger asChild>
            <button className="focus-ring flex items-center gap-1.5 rounded-md border border-border bg-surface-sunken px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Ask NEXUS
            </button>
          </DropdownTrigger>
          <DropdownContent align="start" className="w-48">
            {actions.map((a) => (
              <DropdownItem key={a.key} onSelect={() => run(a.key)}>
                <a.icon className="h-3.5 w-3.5" /> {a.label}
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>
      </div>

      {active && (
        <div className="border-t border-border bg-surface-sunken/40 px-3 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {actions.find((a) => a.key === active)?.label}
            </p>
            <button
              onClick={dismiss}
              className="focus-ring text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>

          {active === "extract" ? (
            <div>
              {taskCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No unchecked checklist items or action lines found in this note.
                </p>
              ) : (
                <>
                  <ul className="space-y-1.5">
                    {taskCandidates.map((c, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={c.selected}
                          onChange={() =>
                            setTaskCandidates((prev) =>
                              prev.map((p, pi) => (pi === i ? { ...p, selected: !p.selected } : p))
                            )
                          }
                          className="accent-accent"
                        />
                        <span className="text-sm text-foreground">{c.title}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={createSelectedTasks}
                    disabled={!taskCandidates.some((c) => c.selected)}
                  >
                    Create {taskCandidates.filter((c) => c.selected).length} task
                    {taskCandidates.filter((c) => c.selected).length === 1 ? "" : "s"}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{textResult}</p>
              {(active === "improve" || active === "checklist") && (
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    if (active === "improve") onReplaceContent(textResult);
                    else onAppendContent(textResult);
                    dismiss();
                  }}
                >
                  {active === "improve" ? "Replace note content" : "Insert into note"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
