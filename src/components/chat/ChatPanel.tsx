"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useChatStore } from "@/lib/store/useChatStore";
import { streamText } from "@/lib/mock/ai";
import { generateContextualResponse } from "@/lib/ai/service";
import { useAIContextStore, contextLabel } from "@/lib/ai/context";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import type { ChatActionChip } from "@/lib/store/types";

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const context = useAIContextStore((s) => s.context);

  const [thinking, setThinking] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const pendingActions = useRef<ChatActionChip[] | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamedContent, thinking]);

  function handleSend(text: string) {
    addMessage("user", text);
    setThinking(true);
    setStreaming(true);

    const { content, actions } = generateContextualResponse(text, context);
    pendingActions.current = actions;

    window.setTimeout(() => {
      setThinking(false);
      streamText(
        content,
        (soFar) => setStreamedContent(soFar),
        () => {
          addMessage("assistant", content, pendingActions.current);
          setStreamedContent("");
          setStreaming(false);
        }
      );
    }, 450);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {context.type !== "dashboard" && (
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2 md:px-6">
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
            {contextLabel(context)}
          </span>
          <span className="text-xs text-muted-foreground">— NEXUS can see this while you chat</span>
        </div>
      )}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} actions={m.actions} />
        ))}

        {thinking && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}

        {!thinking && streamedContent && (
          <MessageBubble role="assistant" content={streamedContent} />
        )}
      </div>
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
