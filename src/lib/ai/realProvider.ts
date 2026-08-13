/** Whether the app should attempt a real LLM call instead of the mock
 * heuristics. Safe to read on the client — this only names a provider,
 * never a credential (see .env.local.example). */
export function isRealProviderEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_PROVIDER === "anthropic";
}

/**
 * Streams a real LLM response from the server route (src/app/api/ai/route.ts),
 * calling `onToken` with the accumulated text as chunks arrive — the same
 * "growing string" shape the mock's streamText() callback uses, so callers
 * don't need to know which provider actually answered.
 */
export async function streamRealResponse(
  input: string,
  system: string,
  onToken: (soFar: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input, system }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`ai_request_failed:${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let soFar = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    soFar += decoder.decode(value, { stream: true });
    onToken(soFar);
  }
  return soFar;
}
