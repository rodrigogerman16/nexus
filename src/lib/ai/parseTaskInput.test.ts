import { describe, expect, it } from "vitest";
import { parseTaskInput } from "@/lib/ai/parseTaskInput";

// Wednesday, Aug 12 2026 — fixed so date/weekday math is deterministic.
const NOW = new Date(2026, 7, 12, 9, 0, 0);

describe("parseTaskInput", () => {
  it("parses a relative date with an am time and strips both from the title", () => {
    const result = parseTaskInput("Finish the portfolio tomorrow at 10am", NOW);
    expect(result.title).toBe("Finish the portfolio");
    expect(result.priority).toBe("medium");
    expect(result.dueDate).toBeDefined();
    const due = new Date(result.dueDate!);
    expect(due.getDate()).toBe(13);
    expect(due.getHours()).toBe(10);
  });

  it("detects an urgent-style keyword as critical priority and removes it", () => {
    const result = parseTaskInput("Call mom urgent", NOW);
    expect(result.priority).toBe("critical");
    expect(result.title).toBe("Call mom");
  });

  it("detects 'important' as high priority", () => {
    const result = parseTaskInput("Reply to the client important", NOW);
    expect(result.priority).toBe("high");
  });

  it("detects 'low priority' and strips the phrase", () => {
    const result = parseTaskInput("Clean the garage low priority", NOW);
    expect(result.priority).toBe("low");
    expect(result.title).toBe("Clean the garage");
  });

  it("leaves priority as medium and dueDate undefined with no signals", () => {
    const result = parseTaskInput("Buy groceries", NOW);
    expect(result.priority).toBe("medium");
    expect(result.dueDate).toBeUndefined();
    expect(result.title).toBe("Buy groceries");
  });

  it("parses a bare pm time without 'at' and defaults the date to today", () => {
    const result = parseTaskInput("Meeting 3pm", NOW);
    expect(result.title).toBe("Meeting");
    const due = new Date(result.dueDate!);
    expect(due.getHours()).toBe(15);
    expect(due.getDate()).toBe(NOW.getDate());
  });

  it("defaults a date-only match to 9am", () => {
    const result = parseTaskInput("Submit report today", NOW);
    const due = new Date(result.dueDate!);
    expect(due.getHours()).toBe(9);
    expect(due.getDate()).toBe(NOW.getDate());
  });

  it("resolves a weekday name to that day of week", () => {
    const result = parseTaskInput("Team sync monday", NOW);
    const due = new Date(result.dueDate!);
    expect(due.getDay()).toBe(1);
    expect(due.getTime()).toBeGreaterThan(NOW.getTime());
  });

  it("capitalizes the resulting title", () => {
    const result = parseTaskInput("finish onboarding docs", NOW);
    expect(result.title).toBe("Finish onboarding docs");
  });

  it("falls back to the raw input when stripping leaves nothing", () => {
    const result = parseTaskInput("tomorrow", NOW);
    expect(result.title.length).toBeGreaterThan(0);
  });
});
