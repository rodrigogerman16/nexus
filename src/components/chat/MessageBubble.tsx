"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatActionChip, ChatRole } from "@/lib/store/types";

interface MessageBubbleProps {
  role: ChatRole;
  content: string;
  actions?: ChatActionChip[];
}

export function MessageBubble({ role, content, actions }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div className={cn("max-w-[85%] sm:max-w-[75%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-accent text-accent-foreground"
              : "rounded-tl-sm border border-border bg-surface text-foreground"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <article className="prose-note max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {actions.map((action, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
              >
                <CheckCircle2 className="h-3 w-3" />
                {action.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
