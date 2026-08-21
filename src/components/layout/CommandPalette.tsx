"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Circle,
  FileText,
  FolderKanban,
  ListTodo,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useUIStore } from "@/lib/store/useUIStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { useAIContextStore, contextLabel } from "@/lib/ai/context";
import { suggestedPrompts } from "@/lib/ai/service";
import { askNexus } from "@/lib/ai/ask";
import { MarkdownLiteText } from "@/components/ai/MarkdownLiteText";
import { navItems } from "@/components/layout/nav";
import { useEffect, useMemo, useRef, useState } from "react";

const groupClass =
  "px-2 py-1.5 normal-case [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-items]]:mt-1";
const itemClass =
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent";

interface Answer {
  question: string;
  content: string;
  streaming: boolean;
}

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setNotificationsOpen = useUIStore((s) => s.setNotificationsOpen);
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);
  const requestQuickCreate = useUIStore((s) => s.requestQuickCreate);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const addNote = useNotesStore((s) => s.addNote);
  const tasks = useTasksStore((s) => s.tasks);
  const projects = useTasksStore((s) => s.projects);
  const notes = useNotesStore((s) => s.notes);
  const context = useAIContextStore((s) => s.context);
  const [search, setSearch] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const stopStreamRef = useRef<(() => void) | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSearch("");
      setAnswer(null);
      stopStreamRef.current?.();
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleOpenChange(!open);
      }
      if (e.key === "Escape") handleOpenChange(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Typing a new query after seeing an answer returns to normal search —
  // the user is starting over, not refining the question.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswer(null);
  }, [search]);

  function go(href: string) {
    router.push(href);
    handleOpenChange(false);
  }

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    stopStreamRef.current?.();
    setAnswer({ question: trimmed, content: "", streaming: true });
    stopStreamRef.current = askNexus(trimmed, context, {
      onToken: (soFar) => setAnswer({ question: trimmed, content: soFar, streaming: true }),
      onDone: ({ content }) => setAnswer({ question: trimmed, content, streaming: false }),
    });
  }

  const query = search.trim().toLowerCase();
  const matchedTasks = useMemo(
    () => (query ? tasks.filter((t) => t.title.toLowerCase().includes(query)).slice(0, 5) : []),
    [tasks, query]
  );
  const matchedProjects = useMemo(
    () => (query ? projects.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 5) : []),
    [projects, query]
  );
  const matchedNotes = useMemo(
    () => (query ? notes.filter((n) => n.title.toLowerCase().includes(query)).slice(0, 5) : []),
    [notes, query]
  );
  const prompts = useMemo(() => suggestedPrompts(context), [context]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={handleOpenChange}
      label="Command palette"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface-raised animate-drawer-in md:inset-auto md:left-1/2 md:top-[18%] md:w-[92vw] md:max-w-xl md:-translate-x-1/2 md:rounded-lg md:border md:border-border md:shadow-overlay md:animate-palette-in"
      shouldFilter={false}
    >
      <div
        className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-sm"
        onClick={() => handleOpenChange(false)}
      />
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 pt-[env(safe-area-inset-top)] md:pt-0">
        <Command.Input
          autoFocus
          value={search}
          onValueChange={setSearch}
          placeholder="Ask NEXUS anything, or type a command…"
          className="focus-ring h-12 w-full bg-transparent px-1 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {context.type !== "dashboard" && (
          <span className="max-w-[35vw] shrink-0 truncate whitespace-nowrap rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent md:max-w-none">
            {contextLabel(context)}
          </span>
        )}
        <button
          onClick={() => handleOpenChange(false)}
          aria-label="Close"
          className="focus-ring -mr-1 shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-surface-sunken hover:text-foreground md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {answer ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:max-h-[60vh] md:flex-none md:pb-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="h-3 w-3" />
            </div>
            <p className="text-sm font-medium text-foreground">&ldquo;{answer.question}&rdquo;</p>
          </div>
          {answer.content === "" && answer.streaming ? (
            <div className="flex items-center gap-1.5 py-1 pl-8 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
            </div>
          ) : (
            <MarkdownLiteText
              text={answer.content}
              className="whitespace-pre-wrap pl-8 text-sm leading-relaxed text-foreground"
            />
          )}
          <button
            onClick={() => setAnswer(null)}
            className="focus-ring mt-4 ml-8 rounded text-xs text-muted-foreground hover:text-foreground"
          >
            ← Back to search
          </button>
        </div>
      ) : (
        <Command.List className="min-h-0 flex-1 overflow-y-auto p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:max-h-[60vh] md:flex-none md:pb-2">
          <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          {query && (
            <Command.Group heading="Ask NEXUS" className={groupClass}>
              <Command.Item onSelect={() => ask(search)} className={itemClass}>
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="truncate">Ask: &ldquo;{search.trim()}&rdquo;</span>
              </Command.Item>
            </Command.Group>
          )}

          {!query && (
            <Command.Group heading="Suggested" className={groupClass}>
              {prompts.map((prompt) => (
                <Command.Item key={prompt} onSelect={() => ask(prompt)} className={itemClass}>
                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{prompt}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {matchedTasks.length > 0 && (
            <Command.Group heading="Tasks" className={groupClass}>
              {matchedTasks.map((t) => (
                <Command.Item key={t.id} onSelect={() => go("/tasks")} className={itemClass}>
                  <ListTodo className="h-4 w-4" />
                  <span className="truncate">{t.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {matchedProjects.length > 0 && (
            <Command.Group heading="Projects" className={groupClass}>
              {matchedProjects.map((p) => (
                <Command.Item
                  key={p.id}
                  onSelect={() => go(`/projects/${p.id}`)}
                  className={itemClass}
                >
                  <FolderKanban className="h-4 w-4" />
                  <span className="truncate">{p.name}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {matchedNotes.length > 0 && (
            <Command.Group heading="Notes" className={groupClass}>
              {matchedNotes.map((n) => (
                <Command.Item key={n.id} onSelect={() => go("/notes")} className={itemClass}>
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{n.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Navigate" className={groupClass}>
            {navItems
              .filter((item) => !query || item.label.toLowerCase().includes(query))
              .map((item) => (
                <Command.Item key={item.href} onSelect={() => go(item.href)} className={itemClass}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Command.Item>
              ))}
          </Command.Group>

          <Command.Group heading="Quick actions" className={groupClass}>
            <Command.Item
              onSelect={() => {
                requestQuickCreate("task", search.trim());
                handleOpenChange(false);
                router.push("/tasks");
              }}
              className={itemClass}
            >
              <Plus className="h-4 w-4" />
              <span>
                Create task{search.trim() ? `: "${search.trim()}"` : ""}
              </span>
            </Command.Item>
            <Command.Item
              onSelect={() => {
                const title = search.trim() || "Untitled";
                addNote({ title });
                handleOpenChange(false);
                router.push("/notes");
              }}
              className={itemClass}
            >
              <Plus className="h-4 w-4" />
              <span>Create note{search.trim() ? `: "${search.trim()}"` : ""}</span>
            </Command.Item>
            <Command.Item
              onSelect={() => {
                requestQuickCreate("project", search.trim());
                handleOpenChange(false);
                router.push("/projects");
              }}
              className={itemClass}
            >
              <Plus className="h-4 w-4" />
              <span>Create project{search.trim() ? `: "${search.trim()}"` : ""}</span>
            </Command.Item>
            <Command.Item onSelect={() => go("/calendar")} className={itemClass}>
              <Plus className="h-4 w-4" />
              <span>Open calendar</span>
            </Command.Item>
            <Command.Item onSelect={() => go("/chat")} className={itemClass}>
              <Sparkles className="h-4 w-4" />
              <span>Open full conversation</span>
            </Command.Item>
            <Command.Item
              onSelect={() => {
                handleOpenChange(false);
                setNotificationsOpen(true);
              }}
              className={itemClass}
            >
              <Bell className="h-4 w-4" />
              <span>Show notifications</span>
            </Command.Item>
            <Command.Item onSelect={() => go("/settings")} className={itemClass}>
              <Settings className="h-4 w-4" />
              <span>Open settings</span>
            </Command.Item>
            <Command.Item
              onSelect={() => {
                handleOpenChange(false);
                setShortcutsOpen(true);
              }}
              className={itemClass}
            >
              <Sparkles className="h-4 w-4" />
              <span>Show keyboard shortcuts</span>
            </Command.Item>
            <Command.Item
              onSelect={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                handleOpenChange(false);
              }}
              className={itemClass}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>Toggle theme</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      )}
    </Command.Dialog>
  );
}
