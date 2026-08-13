import { describe, expect, it } from "vitest";
import { cn, isSameDay, toDateKey } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});

describe("isSameDay", () => {
  it("is true for the same calendar day at different times", () => {
    expect(isSameDay("2026-08-12T08:00:00", "2026-08-12T23:59:00")).toBe(true);
  });

  it("is false across a day boundary", () => {
    expect(isSameDay("2026-08-12T23:59:00", "2026-08-13T00:00:00")).toBe(false);
  });

  it("accepts Date objects", () => {
    expect(isSameDay(new Date(2026, 7, 12), new Date(2026, 7, 12))).toBe(true);
  });
});

describe("toDateKey", () => {
  it("formats as YYYY-MM-DD with zero-padding", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("pads single-digit months and days", () => {
    expect(toDateKey(new Date(2026, 8, 9))).toBe("2026-09-09");
  });
});
