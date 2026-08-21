import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_INPUT_LENGTH = 4000;
const MAX_SYSTEM_LENGTH = 12000;
const DEFAULT_MODEL = "claude-haiku-4-5";

const requestSchema = z.object({
  input: z.string().trim().min(1).max(MAX_INPUT_LENGTH),
  system: z.string().max(MAX_SYSTEM_LENGTH).default(""),
});

/**
 * Real-LLM backend for askNexus() (src/lib/ai/ask.ts). Requires a signed-in
 * user — every call costs real money against the caller's Anthropic
 * account, so this must not be reachable by an anonymous visitor. Streams
 * plain text chunks back; the client has no need for the Anthropic SDK's
 * own event format (see src/lib/ai/realProvider.ts).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "not_configured" }, { status: 501 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }
  const { input, system } = parsed.data;

  const anthropic = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const messageStream = anthropic.messages.stream({
        model,
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: input }],
      });

      messageStream.on("text", (delta) => {
        controller.enqueue(encoder.encode(delta));
      });
      messageStream.on("end", () => controller.close());
      messageStream.on("error", (error) => {
        console.error("Anthropic stream error:", error);
        controller.error(error);
      });
    },
    cancel() {
      // Client disconnected — nothing further to clean up; the SDK's own
      // request will be aborted when the process eventually GCs it.
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
