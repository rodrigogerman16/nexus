import { afterEach, describe, expect, it, vi } from "vitest";

const generateContextualResponse = vi.fn();
vi.mock("@/lib/ai/service", () => ({
  generateContextualResponse: (...args: unknown[]) => generateContextualResponse(...args),
}));

const isRealProviderEnabled = vi.fn();
const streamRealResponse = vi.fn();
vi.mock("@/lib/ai/realProvider", () => ({
  isRealProviderEnabled: () => isRealProviderEnabled(),
  streamRealResponse: (...args: unknown[]) => streamRealResponse(...args),
}));

vi.mock("@/lib/ai/promptContext", () => ({
  buildSystemPrompt: () => "system prompt",
}));

const { askNexus } = await import("@/lib/ai/ask");

const CONTEXT = { type: "dashboard" } as const;

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("askNexus — mock mode", () => {
  it("streams the mock response and calls onDone with content/actions", async () => {
    vi.useFakeTimers();
    isRealProviderEnabled.mockReturnValue(false);
    generateContextualResponse.mockReturnValue({
      content: "Hello there",
      actions: [{ label: "Hello there", kind: "task" }],
    });

    const onToken = vi.fn();
    const onDone = vi.fn();
    askNexus("hi", CONTEXT, { onToken, onDone });

    await vi.advanceTimersByTimeAsync(3000);

    expect(onToken).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledWith({
      content: "Hello there",
      actions: [{ label: "Hello there", kind: "task" }],
    });
    expect(streamRealResponse).not.toHaveBeenCalled();
  });

  it("returns a stop function that cancels the pending mock stream", async () => {
    vi.useFakeTimers();
    isRealProviderEnabled.mockReturnValue(false);
    generateContextualResponse.mockReturnValue({ content: "Some long response text here" });

    const onToken = vi.fn();
    const onDone = vi.fn();
    const stop = askNexus("hi", CONTEXT, { onToken, onDone });
    stop();

    await vi.advanceTimersByTimeAsync(3000);
    expect(onDone).not.toHaveBeenCalled();
  });
});

describe("askNexus — real provider mode", () => {
  it("streams from the real provider and calls onDone without mock actions", async () => {
    isRealProviderEnabled.mockReturnValue(true);
    streamRealResponse.mockImplementation(async (_input, _system, onToken) => {
      onToken("Real");
      onToken("Real answer");
      return "Real answer";
    });

    const onToken = vi.fn();
    const onDone = vi.fn();
    askNexus("hi", CONTEXT, { onToken, onDone });

    await Promise.resolve();
    await Promise.resolve();

    expect(onToken).toHaveBeenCalledWith("Real answer");
    expect(onDone).toHaveBeenCalledWith({ content: "Real answer" });
    expect(generateContextualResponse).not.toHaveBeenCalled();
  });

  it("falls back to the mock engine when the real provider call fails", async () => {
    vi.useFakeTimers();
    isRealProviderEnabled.mockReturnValue(true);
    streamRealResponse.mockRejectedValue(new Error("network down"));
    generateContextualResponse.mockReturnValue({ content: "Fallback answer" });

    const onToken = vi.fn();
    const onDone = vi.fn();
    askNexus("hi", CONTEXT, { onToken, onDone });

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(3000);

    expect(onDone).toHaveBeenCalledWith({ content: "Fallback answer", actions: undefined });
  });
});
