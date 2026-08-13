"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Eye, Pencil, Pin, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/store/types";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useAIContextStore } from "@/lib/ai/context";
import { toast } from "@/lib/store/useToastStore";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { NoteAIActions } from "@/components/notes/NoteAIActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface NoteEditorProps {
  note: Note;
  onDeleted: () => void;
  onBack?: () => void;
}

export function NoteEditor({ note, onDeleted, onBack }: NoteEditorProps) {
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const togglePin = useNotesStore((s) => s.togglePin);
  const projects = useTasksStore((s) => s.projects);
  const setAIContext = useAIContextStore((s) => s.setContext);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the global AI context in sync with what's actually on screen right
  // now, not the (debounce-delayed) persisted note, so "summarize this"
  // reflects what the user is currently typing.
  useEffect(() => {
    setAIContext({ type: "note", note: { ...note, title, content } });
  }, [note, title, content, setAIContext]);

  // The parent keys this component by note.id, so it remounts (and these
  // useState calls re-initialize) whenever a different note is selected.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        updateNote(note.id, { title, content });
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <div className="flex min-w-0 items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="focus-ring rounded-md p-1 text-muted-foreground hover:bg-surface-sunken md:hidden"
              aria-label="Back to notes"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="focus-ring min-w-0 flex-1 rounded-md bg-transparent px-1 text-lg font-semibold text-foreground outline-none"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => togglePin(note.id)}
            className={cn(
              "focus-ring rounded-md p-1.5 transition-colors hover:bg-surface-sunken",
              note.pinned ? "text-accent" : "text-muted-foreground"
            )}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
          >
            <Pin className={cn("h-4 w-4", note.pinned && "fill-accent")} />
          </button>
          <button
            onClick={() => {
              deleteNote(note.id);
              toast.success("Note deleted");
              onDeleted();
            }}
            className="focus-ring rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="mx-1 h-5 w-px bg-border" />
          <Button
            size="sm"
            variant={mode === "edit" ? "secondary" : "ghost"}
            onClick={() => setMode("edit")}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant={mode === "preview" ? "secondary" : "ghost"}
            onClick={() => setMode("preview")}
            className="gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Project</span>
          <Select
            value={note.projectId ?? "none"}
            onValueChange={(v) => updateNote(note.id, { projectId: v === "none" ? undefined : v })}
          >
            <SelectTrigger className="h-7 w-44 text-xs">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-[10rem] flex-1 items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">Tags</span>
          <TagInput
            value={note.tags}
            onChange={(tags) => updateNote(note.id, { tags })}
            placeholder="Add a tag…"
            className="h-7 min-h-0 flex-1 py-0.5"
          />
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          Created {new Date(note.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          {" · Updated "}
          {new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      <NoteAIActions
        note={note}
        content={content}
        onReplaceContent={setContent}
        onAppendContent={(addition) =>
          setContent((prev) => (prev.trim() ? `${prev}\n\n${addition}` : addition))
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {mode === "edit" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing in markdown…"
            className="focus-ring h-full w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
        ) : (
          <article className="prose-note max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || "*Nothing to preview yet.*"}
            </ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
