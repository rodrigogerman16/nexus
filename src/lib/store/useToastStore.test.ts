import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast, useToastStore } from "@/lib/store/useToastStore";

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useToastStore", () => {
  it("pushes a toast with the given variant and message", () => {
    useToastStore.getState().push("success", "Task created");
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ variant: "success", message: "Task created" });
  });

  it("supports pushing multiple toasts that stack in order", () => {
    useToastStore.getState().push("info", "First");
    useToastStore.getState().push("error", "Second");
    const { toasts } = useToastStore.getState();
    expect(toasts.map((t) => t.message)).toEqual(["First", "Second"]);
  });

  it("dismiss removes only the targeted toast", () => {
    useToastStore.getState().push("info", "Keep me");
    useToastStore.getState().push("info", "Remove me");
    const [, second] = useToastStore.getState().toasts;
    useToastStore.getState().dismiss(second.id);
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("Keep me");
  });

  it("auto-dismisses a toast after its timeout", () => {
    vi.useFakeTimers();
    useToastStore.getState().push("success", "Auto-dismiss me");
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(3500);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("the toast convenience helpers push the matching variant", () => {
    toast.success("Saved");
    toast.error("Failed");
    toast.info("FYI");
    const variants = useToastStore.getState().toasts.map((t) => t.variant);
    expect(variants).toEqual(["success", "error", "info"]);
  });
});
