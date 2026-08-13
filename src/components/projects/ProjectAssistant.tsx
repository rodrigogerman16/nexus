"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MarkdownLiteText } from "@/components/ai/MarkdownLiteText";
import { askNexus } from "@/lib/ai/ask";
import type { Project, Task } from "@/lib/store/types";

const suggestedPrompts = ["What should I work on next?", "Why is this behind schedule?"];

export function ProjectAssistant({ project, tasks }: { project: Project; tasks: Task[] }) {
  const [question, setQuestion] = useState("");
  const [exchange, setExchange] = useState<{ question: string; answer: string } | null>(null);
  const [thinking, setThinking] = useState(false);

  function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuestion("");
    setThinking(true);
    setExchange({ question: trimmed, answer: "" });
    askNexus(trimmed, { type: "project", project, tasks }, {
      onToken: (soFar) => {
        setThinking(false);
        setExchange({ question: trimmed, answer: soFar });
      },
      onDone: ({ content }) => {
        setThinking(false);
        setExchange({ question: trimmed, answer: content });
      },
    });
  }

  return (
    <div className="bg-grain relative mb-6 overflow-hidden rounded-xl border border-border bg-surface-raised p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Sparkles className="h-3 w-3" />
        </div>
        <h3 className="text-sm font-semibold">Ask NEXUS about this project</h3>
      </div>

      {exchange ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">&ldquo;{exchange.question}&rdquo;</p>
          {thinking ? (
            <div className="flex items-center gap-1.5 py-1 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
            </div>
          ) : (
            <MarkdownLiteText text={exchange.answer} className="text-sm leading-relaxed text-foreground" />
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => ask(prompt)}
              className="focus-ring rounded-full border border-border bg-surface-sunken px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-1.5">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask(question);
          }}
          placeholder="Ask about this project…"
          className="h-8 text-sm"
        />
        <Button size="sm" variant="secondary" onClick={() => ask(question)} className="shrink-0">
          Ask
        </Button>
      </div>
    </div>
  );
}
