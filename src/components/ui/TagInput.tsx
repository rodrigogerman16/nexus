"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, placeholder = "Add a tag…", className }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const tag = draft.trim().toLowerCase();
    setDraft("");
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div
      className={cn(
        "focus-within:outline-accent flex min-h-9 flex-wrap items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5 py-1.5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2",
        className
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove tag ${tag}`}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
          } else if (e.key === "Backspace" && !draft && value.length > 0) {
            removeTag(value[value.length - 1]);
          }
        }}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[6rem] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
    </div>
  );
}
