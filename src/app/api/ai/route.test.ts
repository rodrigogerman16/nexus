import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

const streamMock = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { stream: (...args: unknown[]) => streamMock(...args) };
  },
}));

const { POST } = await import("@/app/api/ai/route");

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ORIGINAL_KEY = process.env.ANTHROPIC_API_KEY;

beforeEach(() => {
  getUser.mockReset();
  streamMock.mockReset();
});

afterEach(() => {
  process.env.ANTHROPIC_API_KEY = ORIGINAL_KEY;
});

describe("POST /api/ai — guards", () => {
  it("rejects an unauthenticated caller with 401", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest({ input: "hi", system: "sys" }));
    expect(res.status).toBe(401);
  });

  it("rejects with 501 when ANTHROPIC_API_KEY isn't configured", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    delete process.env.ANTHROPIC_API_KEY;
    const res = await POST(makeRequest({ input: "hi", system: "sys" }));
    expect(res.status).toBe(501);
  });

  it("rejects an empty input with 400", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    process.env.ANTHROPIC_API_KEY = "test-key";
    const res = await POST(makeRequest({ input: "   ", system: "sys" }));
    expect(res.status).toBe(400);
  });

  it("rejects an input over the length limit with 400", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    process.env.ANTHROPIC_API_KEY = "test-key";
    const res = await POST(makeRequest({ input: "a".repeat(5000), system: "sys" }));
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON with 400", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    process.env.ANTHROPIC_API_KEY = "test-key";
    const badRequest = new Request("http://localhost/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    });
    const res = await POST(badRequest);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/ai — happy path", () => {
  it("streams the model's text deltas as plain chunks", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    process.env.ANTHROPIC_API_KEY = "test-key";

    const handlers: Record<string, (...args: unknown[]) => void> = {};
    streamMock.mockReturnValue({
      on: (event: string, cb: (...args: unknown[]) => void) => {
        handlers[event] = cb;
      },
    });

    const res = await POST(makeRequest({ input: "What's next?", system: "sys" }));
    expect(res.status).toBe(200);

    // Simulate the SDK emitting text deltas, then ending the stream.
    handlers.text("Hel");
    handlers.text("lo");
    handlers.end();

    const text = await new Response(res.body).text();
    expect(text).toBe("Hello");
  });
});
