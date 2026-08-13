"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const suggestions = [
  "add task: draft the follow-up email tomorrow",
  "note that the client prefers async updates",
  "how's my streak going",
  "plan my day",
];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-border p-3 md:p-4">
      {!value && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              disabled={disabled}
              className="focus-ring rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your assistant…"
          rows={1}
          className="max-h-32 min-h-[2.25rem] py-2"
          disabled={disabled}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
