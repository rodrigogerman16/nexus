function stripMarkdown(content: string): string {
  return content
    .replace(/^#+\s*/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/^-\s*\[[ xX]\]\s*/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .trim();
}

/** Splits on line breaks first so list/checklist items (which usually have
 * no terminal punctuation) each count as their own unit, then further
 * splits prose lines on sentence punctuation. A pure punctuation-only split
 * would treat an entire bullet list — one period at the very end — as a
 * single giant "sentence". */
function sentences(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Joins summary fragments with a period, but skips the extra one when a
 * fragment already ends in terminal punctuation (avoids "here.. Next"). */
function joinWithPeriod(parts: string[]): string {
  return parts.reduce((acc, part, i) => {
    if (i === 0) return part;
    return /[.!?]$/.test(acc) ? `${acc} ${part}` : `${acc}. ${part}`;
  }, "");
}

/** Plain-text summary — the first couple of lines/sentences, plus a note
 * about length if there's clearly more the summary is leaving out. */
export function summarizeNote(content: string): string {
  const plain = stripMarkdown(content);
  if (!plain) return "This note is empty — there's nothing to summarize yet.";
  const parts = sentences(plain);
  const lead = joinWithPeriod(parts.slice(0, 2));
  if (parts.length <= 2) return lead;
  const suffix = `(${parts.length - 2} more line${parts.length - 2 === 1 ? "" : "s"} follow.)`;
  return /[.!?]$/.test(lead) ? `${lead} ${suffix}` : `${lead}. ${suffix}`;
}

/** Lightweight mechanical cleanup — collapses stray whitespace, straightens
 * quotes, and normalizes list markers. Framed honestly as cleanup, not a
 * full LLM rewrite, since that's what a heuristic pass can actually promise. */
export function improveWriting(content: string): string {
  return content
    .replace(/[ \t]+/g, " ")
    .replace(/ +\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/^[-*]\s+/gm, "- ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

/** Pulls candidate action items: unchecked checklist boxes first (the most
 * explicit signal), falling back to imperative-looking bullet lines. */
export function extractTasksFromNote(content: string): string[] {
  const checklistItems = [...content.matchAll(/^-\s*\[ \]\s*(.+)$/gm)].map((m) => m[1].trim());
  if (checklistItems.length > 0) return checklistItems;

  const imperativeVerbs =
    /^(finish|review|send|draft|schedule|call|email|follow up|book|write|update|fix|prepare|share|confirm|create|set up|research)\b/i;
  return [...content.matchAll(/^[-*]\s+(.+)$/gm)]
    .map((m) => m[1].trim())
    .filter((line) => imperativeVerbs.test(line));
}

/** Turns existing list-like lines into an actionable checklist; falls back
 * to splitting prose into sentence-per-item. */
export function generateChecklist(content: string): string {
  const existingItems = [...content.matchAll(/^(?:[-*]|\d+\.)\s+(.+)$/gm)].map((m) => m[1].trim());
  const source = existingItems.length > 0 ? existingItems : sentences(stripMarkdown(content));
  if (source.length === 0) return "- [ ] ";
  return source.map((line) => `- [ ] ${line.replace(/^\[[ xX]\]\s*/, "")}`).join("\n");
}

/** Extracts headings and list items as the note's key points; falls back to
 * the first sentence of each paragraph when there's no structure to lean on. */
export function findKeyPoints(content: string): string[] {
  const headings = [...content.matchAll(/^#+\s*(.+)$/gm)].map((m) => m[1].trim());
  const listItems = [...content.matchAll(/^(?:[-*]|\d+\.)\s*(?:\[[ xX]\]\s*)?(.+)$/gm)].map((m) => m[1].trim());
  const structured = [...headings, ...listItems];
  if (structured.length > 0) return structured.slice(0, 8);

  const paragraphs = content.split(/\n{2,}/).map((p) => stripMarkdown(p)).filter(Boolean);
  return paragraphs.map((p) => sentences(p)[0]).filter((s): s is string => !!s).slice(0, 6);
}

/** A plain-language restatement of what the note covers, built from its
 * own structure rather than an actual model — honest about being a
 * heuristic summary rather than true comprehension. */
export function explainNote(content: string, title: string): string {
  const plain = stripMarkdown(content);
  if (!plain) return `"${title}" doesn't have any content yet.`;
  const points = findKeyPoints(content);
  if (points.length === 0) {
    return `"${title}" is a short note: ${sentences(plain).slice(0, 2).join(" ")}`;
  }
  const list = points.slice(0, 4).map((p) => `- ${p}`).join("\n");
  return `"${title}" covers:\n${list}`;
}
