"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { planSchedule, type PlannedBlock } from "@/lib/ai/planSchedule";

interface CalendarAssistantProps {
  referenceDate: Date;
}

export function CalendarAssistant({ referenceDate }: CalendarAssistantProps) {
  const addEvent = useLifeStore((s) => s.addEvent);
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<PlannedBlock[] | null>(null);

  function handlePlan() {
    if (!input.trim()) return;
    setPlan(planSchedule(input, referenceDate));
  }

  function confirm() {
    if (!plan) return;
    for (const block of plan) {
      addEvent({
        title: block.title,
        start: block.start.toISOString(),
        end: block.end.toISOString(),
        color: block.title === "Break" || block.title === "Review" ? "#6c6472" : "#22d3ee",
      });
    }
    setPlan(null);
    setInput("");
  }

  return (
    <div className="bg-grain relative mb-4 overflow-hidden rounded-xl border border-border bg-surface-raised p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Sparkles className="h-3 w-3" />
        </div>
        <h3 className="text-sm font-semibold">Plan with NEXUS</h3>
      </div>

      {plan ? (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            Here&rsquo;s a suggested plan — nothing&rsquo;s added to your calendar yet.
          </p>
          <ol className="space-y-1.5">
            {plan.map((block, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                <span className="w-32 shrink-0 text-xs text-muted-foreground">
                  {block.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  {" – "}
                  {block.end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </span>
                <span className="text-foreground">{block.title}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPlan(null)}>
              Discard
            </Button>
            <Button size="sm" onClick={confirm}>
              Add to calendar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePlan();
            }}
            placeholder="Plan my afternoon around finishing the website…"
            className="h-8 text-sm"
          />
          <Button size="sm" variant="secondary" onClick={handlePlan} className="shrink-0">
            Plan
          </Button>
        </div>
      )}
    </div>
  );
}
