/** System prompts for the free-form note actions (summarize, improve,
 * checklist, keypoints, explain) when a real LLM is wired up. "Extract
 * tasks" isn't here — it stays on the deterministic heuristic engine since
 * it produces structured data (candidate tasks) the app creates directly;
 * see the note in src/lib/ai/ask.ts for the same reasoning applied to
 * calendar planning. */
export type NoteActionKey = "summarize" | "improve" | "checklist" | "keypoints" | "explain";

export function noteActionSystemPrompt(key: NoteActionKey, noteTitle: string): string {
  const shared =
    "You are NEXUS, an AI assistant embedded in a personal productivity app. " +
    "Only use information present in the note below — never invent details. " +
    "Return only the requested output, with no preamble, no commentary, and no markdown code fences.";

  switch (key) {
    case "summarize":
      return `${shared}\n\nSummarize the note in 2-4 sentences.`;
    case "improve":
      return (
        `${shared}\n\nRewrite the note to improve clarity, grammar, and flow while preserving its ` +
        "meaning, structure, and formatting (headings, lists, checkboxes). Return the full rewritten note."
      );
    case "checklist":
      return (
        `${shared}\n\nConvert the note into a markdown checklist, one actionable item per line, ` +
        'formatted as "- [ ] item". Return only the checklist.'
      );
    case "keypoints":
      return `${shared}\n\nExtract the key points as a concise bulleted list (3-6 bullets).`;
    case "explain":
      return `${shared}\n\nExplain in plain language what the note titled "${noteTitle}" is about, in 2-4 sentences.`;
  }
}
