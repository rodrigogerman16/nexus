import { afterEach, describe, expect, it, vi } from "vitest";
import { planSchedule } from "@/lib/ai/planSchedule";

// A fixed, non-"today" reference date so the "round up to the next 15
// minutes because it's already later than the period start" branch never
// kicks in unless a test deliberately opts into it via fake timers.
const FUTURE_REFERENCE = new Date(2030, 5, 15);

afterEach(() => {
  vi.useRealTimers();
});

describe("planSchedule", () => {
  it("splits a full morning into focus/break/continue/review blocks summing to the period", () => {
    const blocks = planSchedule("plan my morning", FUTURE_REFERENCE);
    expect(blocks.map((b) => b.title)).toEqual([
      "Focus work",
      "Break",
      "Continue: Focus work",
      "Review",
    ]);
    expect(blocks[0].start.getHours()).toBe(9);
    expect(blocks[blocks.length - 1].end.getHours()).toBe(12);
    const totalMinutes = blocks.reduce(
      (sum, b) => sum + (b.end.getTime() - b.start.getTime()) / 60000,
      0
    );
    expect(totalMinutes).toBe(180);
  });

  it("extracts the topic after 'around'/'on'/'for' and title-cases it", () => {
    const blocks = planSchedule("plan my afternoon around finishing the website", FUTURE_REFERENCE);
    expect(blocks[0].title).toBe("Finishing the website");
    expect(blocks[0].start.getHours()).toBe(13);
  });

  it("defaults to the afternoon period when no period keyword is present", () => {
    const blocks = planSchedule("plan something around the launch", FUTURE_REFERENCE);
    expect(blocks[0].start.getHours()).toBe(13);
  });

  it("produces a single block when the remaining window is short", () => {
    vi.useFakeTimers();
    const fixedNow = new Date(2026, 7, 12, 11, 40, 0);
    vi.setSystemTime(fixedNow);
    const blocks = planSchedule("plan my morning", new Date(fixedNow));
    expect(blocks).toHaveLength(1);
    expect(blocks[0].start.getHours()).toBe(11);
    expect(blocks[0].start.getMinutes()).toBe(45);
  });

  it("enforces a 30-minute floor even when the remaining window is smaller", () => {
    vi.useFakeTimers();
    const fixedNow = new Date(2026, 7, 12, 11, 55, 0);
    vi.setSystemTime(fixedNow);
    const blocks = planSchedule("plan my morning", new Date(fixedNow));
    const minutes = (blocks[0].end.getTime() - blocks[0].start.getTime()) / 60000;
    expect(minutes).toBe(30);
  });
});
