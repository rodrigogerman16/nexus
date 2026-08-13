import { describe, expect, it } from "vitest";
import { noteActionSystemPrompt } from "@/lib/ai/noteActionPrompts";

describe("noteActionSystemPrompt", () => {
  it("produces a distinct prompt per action key", () => {
    const keys = ["summarize", "improve", "checklist", "keypoints", "explain"] as const;
    const prompts = keys.map((key) => noteActionSystemPrompt(key, "My Note"));
    expect(new Set(prompts).size).toBe(keys.length);
  });

  it("includes the note title only for 'explain'", () => {
    expect(noteActionSystemPrompt("explain", "Roadmap Q3")).toContain("Roadmap Q3");
    expect(noteActionSystemPrompt("summarize", "Roadmap Q3")).not.toContain("Roadmap Q3");
  });

  it("instructs a checklist-formatted output for 'checklist'", () => {
    expect(noteActionSystemPrompt("checklist", "Note")).toContain("- [ ]");
  });

  it("asks for no preamble/commentary on every action", () => {
    const keys = ["summarize", "improve", "checklist", "keypoints", "explain"] as const;
    for (const key of keys) {
      expect(noteActionSystemPrompt(key, "Note")).toContain("no preamble");
    }
  });
});
