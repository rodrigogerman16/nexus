import { streamText } from "@/lib/mock/ai";
import { generateContextualResponse } from "@/lib/ai/service";
import { buildSystemPrompt } from "@/lib/ai/promptContext";
import { isRealProviderEnabled, streamRealResponse } from "@/lib/ai/realProvider";
import type { AIContext } from "@/lib/ai/context";
import type { ChatActionChip } from "@/lib/store/types";

export interface AskResult {
  content: string;
  actions?: ChatActionChip[];
}

export interface AskHandlers {
  onToken: (soFar: string) => void;
  onDone: (result: AskResult) => void;
}

function runMock(input: string, context: AIContext, { onToken, onDone }: AskHandlers): () => void {
  const { content, actions } = generateContextualResponse(input, context);
  let stop = () => {};
  // Small delay so the response doesn't just snap in — the real-provider
  // path skips this since network latency already reads as "thinking".
  const timeout = window.setTimeout(() => {
    stop = streamText(content, onToken, () => onDone({ content, actions }));
  }, 300);
  return () => {
    window.clearTimeout(timeout);
    stop();
  };
}

/**
 * The single entry point every "ask NEXUS" surface (command palette, /chat,
 * project assistant, note actions) should call through — mirrors the
 * centralization spec §43 already established for the mock engine
 * (src/lib/ai/service.ts), extended one level up to also own the
 * mock-vs-real-provider decision.
 *
 * Structured-output flows (extracting tasks from a note, planning a
 * calendar block) intentionally stay on the deterministic mock engine —
 * they hand the app data to act on directly, and a real LLM would need
 * proper structured-output/tool-calling to be trustworthy there. Only
 * free-form question-answering routes through the real provider.
 *
 * Returns a stop function the caller can use to cancel an in-flight answer
 * (e.g. the user asks a new question before the first one finishes).
 */
export function askNexus(input: string, context: AIContext, handlers: AskHandlers): () => void {
  if (!isRealProviderEnabled()) {
    return runMock(input, context, handlers);
  }

  const controller = new AbortController();
  const system = buildSystemPrompt(context);

  streamRealResponse(input, system, handlers.onToken, controller.signal)
    .then((content) => handlers.onDone({ content }))
    .catch((error) => {
      if (controller.signal.aborted) return;
      console.error("Real AI provider failed, falling back to mock:", error);
      runMock(input, context, handlers);
    });

  return () => controller.abort();
}
