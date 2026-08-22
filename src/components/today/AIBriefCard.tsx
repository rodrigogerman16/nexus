"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";
import { askNexus } from "@/lib/ai/ask";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";

export function AIBriefCard() {
  const tasks = useTasksStore((s) => s.tasks);
  const events = useLifeStore((s) => s.events);
  const [brief, setBrief] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Routed through the same centralized askNexus() every other AI
    // touchpoint uses (spec §43) rather than calling the mock engine
    // directly — this is what lets the brief actually use the real
    // provider when one is configured, and fall back with the usual
    // "AI unavailable" toast (spec §36) if it fails.
    stopRef.current?.();
    stopRef.current = askNexus(
      "plan my day",
      { type: "dashboard" },
      {
        onToken: (soFar) => setBrief(soFar),
        onDone: ({ content }) => setBrief(content),
      }
    );
    return () => stopRef.current?.();
    // Recompute when the underlying data actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, events]);

  return (
    <div className="bg-grain relative overflow-hidden rounded-xl border border-border bg-surface-raised p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-sm font-semibold">Your daily brief</h3>
      </div>
      {brief === "" ? (
        <div className="flex items-center gap-1.5 py-1 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
        </div>
      ) : (
        <article className="prose-note max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{brief}</ReactMarkdown>
        </article>
      )}
      <Link
        href="/chat"
        className="focus-ring mt-3 inline-flex h-8 items-center rounded-lg border border-border bg-surface-sunken px-3 text-sm font-medium text-foreground transition-colors hover:bg-border"
      >
        Ask the assistant
      </Link>
    </div>
  );
}
