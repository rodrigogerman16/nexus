"use client";

import { useMemo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";
import { generateAIResponse } from "@/lib/mock/ai";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";

export function AIBriefCard() {
  const tasks = useTasksStore((s) => s.tasks);
  const events = useLifeStore((s) => s.events);

  const brief = useMemo(
    () => generateAIResponse("plan my day").content,
    // Recompute when the underlying data actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, events]
  );

  return (
    <div className="bg-grain relative overflow-hidden rounded-xl border border-border bg-surface-raised p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-sm font-semibold">Your daily brief</h3>
      </div>
      <article className="prose-note max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{brief}</ReactMarkdown>
      </article>
      <Link
        href="/chat"
        className="focus-ring mt-3 inline-flex h-8 items-center rounded-lg border border-border bg-surface-sunken px-3 text-sm font-medium text-foreground transition-colors hover:bg-border"
      >
        Ask the assistant
      </Link>
    </div>
  );
}
