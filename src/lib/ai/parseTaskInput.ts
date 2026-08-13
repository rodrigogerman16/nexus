import type { TaskPriority } from "@/lib/store/types";

export interface ParsedTaskInput {
  title: string;
  dueDate?: string;
  priority: TaskPriority;
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const PRIORITY_PATTERNS: [RegExp, TaskPriority][] = [
  [/\b(urgent|asap|critical)\b/i, "critical"],
  [/\bhigh priority\b/i, "high"],
  [/\bimportant\b/i, "high"],
  [/\blow priority\b/i, "low"],
];

/**
 * Small regex-based "AI" task parser — interprets a natural-language string
 * like "Finish the portfolio tomorrow at 10am" into structured fields. Good
 * enough to make quick-add feel intelligent without an LLM; the caller must
 * still show the result for confirmation before creating the task (spec §14).
 */
export function parseTaskInput(input: string, now: Date = new Date()): ParsedTaskInput {
  let text = input.trim();
  let priority: TaskPriority = "medium";

  for (const [pattern, level] of PRIORITY_PATTERNS) {
    if (pattern.test(text)) {
      priority = level;
      text = text.replace(pattern, "");
      break;
    }
  }

  let date: Date | undefined;

  const tomorrowMatch = text.match(/\btomorrow\b/i);
  const todayMatch = !tomorrowMatch && text.match(/\btoday\b/i);
  const nextWeekMatch = !tomorrowMatch && !todayMatch && text.match(/\bnext week\b/i);
  const weekdayMatch =
    !tomorrowMatch && !todayMatch && !nextWeekMatch
      ? text.match(/\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i)
      : null;

  if (tomorrowMatch) {
    date = new Date(now);
    date.setDate(date.getDate() + 1);
    text = text.replace(tomorrowMatch[0], "");
  } else if (todayMatch) {
    date = new Date(now);
    text = text.replace(todayMatch[0], "");
  } else if (nextWeekMatch) {
    date = new Date(now);
    date.setDate(date.getDate() + 7);
    text = text.replace(nextWeekMatch[0], "");
  } else if (weekdayMatch) {
    const targetDay = WEEKDAYS.indexOf(weekdayMatch[2].toLowerCase());
    date = new Date(now);
    let diff = (targetDay - date.getDay() + 7) % 7;
    if (diff === 0 || weekdayMatch[1]) diff += 7;
    date.setDate(date.getDate() + diff);
    text = text.replace(weekdayMatch[0], "");
  }

  // Two alternatives: "at 10", "at 10:30", "at 3pm" (am/pm optional after "at"),
  // or a bare "10am" / "10:30pm" (am/pm required so we don't treat stray
  // numbers like "buy 2 tickets" as a time).
  const timeMatch = text.match(
    /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b|\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i
  );
  if (timeMatch) {
    const hourStr = timeMatch[1] ?? timeMatch[4];
    const minuteStr = timeMatch[2] ?? timeMatch[5];
    const meridiem = (timeMatch[3] ?? timeMatch[6])?.toLowerCase();
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr ? parseInt(minuteStr, 10) : 0;
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    if (!date) date = new Date(now);
    date.setHours(hour, minute, 0, 0);
    text = text.replace(timeMatch[0], "");
  } else if (date) {
    date.setHours(9, 0, 0, 0);
  }

  const cleaned = text
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,.\-–—]+|[\s,.\-–—]+$/g, "")
    .trim();
  const title = cleaned || input.trim();

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    dueDate: date?.toISOString(),
    priority,
  };
}
