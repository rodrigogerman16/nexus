import { afterEach, describe, expect, it, vi } from "vitest";
import { isRealProviderEnabled, streamRealResponse } from "@/lib/ai/realProvider";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("isRealProviderEnabled", () => {
  it("is false when NEXT_PUBLIC_AI_PROVIDER is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_AI_PROVIDER", "");
    expect(isRealProviderEnabled()).toBe(false);
  });

  it("is false for 'mock'", () => {
    vi.stubEnv("NEXT_PUBLIC_AI_PROVIDER", "mock");
    expect(isRealProviderEnabled()).toBe(false);
  });

  it("is true for 'anthropic'", () => {
    vi.stubEnv("NEXT_PUBLIC_AI_PROVIDER", "anthropic");
    expect(isRealProviderEnabled()).toBe(true);
  });
});

function makeStreamingResponse(chunks: string[], ok = true, status = 200) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return { ok, status, body } as unknown as Response;
}

describe("streamRealResponse", () => {
  it("calls onToken with the accumulated text as chunks arrive", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeStreamingResponse(["Hel", "lo, ", "world"]));
    vi.stubGlobal("fetch", fetchMock);

    const seen: string[] = [];
    const final = await streamRealResponse("hi", "sys", (soFar) => seen.push(soFar));

    expect(seen).toEqual(["Hel", "Hello, ", "Hello, world"]);
    expect(final).toBe("Hello, world");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ input: "hi", system: "sys" }),
      })
    );
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeStreamingResponse([], false, 501)));
    await expect(streamRealResponse("hi", "sys", () => {})).rejects.toThrow("ai_request_failed:501");
  });
});
