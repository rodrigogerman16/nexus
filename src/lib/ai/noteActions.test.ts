import { describe, expect, it } from "vitest";
import {
  explainNote,
  extractTasksFromNote,
  findKeyPoints,
  generateChecklist,
  improveWriting,
  summarizeNote,
} from "@/lib/ai/noteActions";

describe("summarizeNote", () => {
  it("reports emptiness for blank content", () => {
    expect(summarizeNote("   ")).toBe("This note is empty — there's nothing to summarize yet.");
  });

  it("summarizes a checklist-style note by line rather than as one run-on sentence", () => {
    const content = [
      "# Launch Week Checklist",
      "- [ ] Finalize pricing tiers",
      "- [ ] Write announcement email",
      "- [ ] Notify support team",
      "- [ ] Update pricing page",
      "- [ ] Ship.",
    ].join("\n");
    const summary = summarizeNote(content);
    expect(summary).toContain("Launch Week Checklist");
    expect(summary).toContain("more line");
  });

  it("joins the first two sentences of short prose without double punctuation", () => {
    const summary = summarizeNote("First idea here. Second idea here.");
    expect(summary).toBe("First idea here. Second idea here.");
  });

  it("does not double-punctuate when trimming a longer prose note", () => {
    const summary = summarizeNote("First idea here. Second idea here. Third idea here.");
    expect(summary).toBe("First idea here. Second idea here. (1 more line follow.)");
  });
});

describe("improveWriting", () => {
  it("collapses repeated spaces and blank lines", () => {
    const result = improveWriting("Hello    world\n\n\n\nBye");
    expect(result).toBe("Hello world\n\nBye");
  });

  it("straightens curly quotes", () => {
    expect(improveWriting("“Hello” and ‘hi’")).toBe("\"Hello\" and 'hi'");
  });

  it("normalizes bullet markers to a dash", () => {
    expect(improveWriting("* one\n* two")).toBe("- one\n- two");
  });

  it("removes stray whitespace before punctuation", () => {
    expect(improveWriting("Wait , really ?")).toBe("Wait, really?");
  });
});

describe("extractTasksFromNote", () => {
  it("prefers unchecked checklist items when present", () => {
    const content = "- [ ] Send invoice\n- [x] Already done\n- [ ] Call client";
    expect(extractTasksFromNote(content)).toEqual(["Send invoice", "Call client"]);
  });

  it("falls back to imperative-looking bullets when there is no checklist", () => {
    const content = "- Finish the deck\n- Random thought\n- Email the team";
    expect(extractTasksFromNote(content)).toEqual(["Finish the deck", "Email the team"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(extractTasksFromNote("Just some prose with no lists.")).toEqual([]);
  });
});

describe("generateChecklist", () => {
  it("converts existing bullet items into checklist items", () => {
    const result = generateChecklist("- one\n- two");
    expect(result).toBe("- [ ] one\n- [ ] two");
  });

  it("falls back to sentence-per-item for plain prose", () => {
    const result = generateChecklist("Do the first thing. Do the second thing.");
    expect(result).toBe("- [ ] Do the first thing.\n- [ ] Do the second thing.");
  });

  it("returns an empty checklist stub for empty content", () => {
    expect(generateChecklist("")).toBe("- [ ] ");
  });
});

describe("findKeyPoints", () => {
  it("prefers headings and list items over prose", () => {
    const content = "# Title\nSome intro text.\n- Point one\n- Point two";
    expect(findKeyPoints(content)).toEqual(["Title", "Point one", "Point two"]);
  });

  it("falls back to the first sentence of each paragraph when unstructured", () => {
    const content = "Paragraph one has more.\n\nParagraph two also has more.";
    expect(findKeyPoints(content)).toEqual([
      "Paragraph one has more.",
      "Paragraph two also has more.",
    ]);
  });

  it("caps structured results at 8 items", () => {
    const content = Array.from({ length: 12 }, (_, i) => `- item ${i}`).join("\n");
    expect(findKeyPoints(content)).toHaveLength(8);
  });
});

describe("explainNote", () => {
  it("reports no content for an empty note", () => {
    expect(explainNote("", "My Note")).toBe('"My Note" doesn\'t have any content yet.');
  });

  it("builds a bullet explanation from key points", () => {
    const content = "# Overview\n- First\n- Second";
    const result = explainNote(content, "Plan");
    expect(result).toContain('"Plan" covers:');
    expect(result).toContain("- Overview");
    expect(result).toContain("- First");
  });

  it("builds a covers-list from the paragraph fallback when there's no heading/list structure", () => {
    const result = explainNote("Just one plain sentence here.", "Quick Note");
    expect(result).toContain('"Quick Note" covers:');
    expect(result).toContain("Just one plain sentence here.");
  });

  it("treats whitespace-only content the same as empty content", () => {
    const result = explainNote("\n\n   \n", "Quick Note");
    expect(result).toBe('"Quick Note" doesn\'t have any content yet.');
  });
});
