export interface PlannedBlock {
  title: string;
  start: Date;
  end: Date;
}

interface Period {
  label: string;
  startHour: number;
  endHour: number;
}

const periods: Record<string, Period> = {
  morning: { label: "morning", startHour: 9, endHour: 12 },
  afternoon: { label: "afternoon", startHour: 13, endHour: 17 },
  evening: { label: "evening", startHour: 17, endHour: 20 },
  tonight: { label: "tonight", startHour: 19, endHour: 22 },
};

function detectPeriod(text: string): Period {
  const lower = text.toLowerCase();
  for (const key of Object.keys(periods)) {
    if (lower.includes(key)) return periods[key];
  }
  return periods.afternoon;
}

/** Pulls the focus topic out of phrasing like "plan my afternoon around
 * finishing the website" or "plan my morning for the client proposal". */
function detectTopic(text: string): string {
  const match = text.match(/\b(?:around|on|for)\s+(.+)/i);
  const raw = match ? match[1] : text.replace(/^plan\s+(my\s+)?\w+\s*/i, "");
  const cleaned = raw.replace(/[.!?]+$/, "").trim();
  if (!cleaned) return "Focus work";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function atHour(reference: Date, hour: number, minute = 0): Date {
  const d = new Date(reference);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/**
 * Turns a natural-language planning request into a sequence of suggested
 * time blocks. Purely a suggestion — the caller must show it for
 * confirmation and only create real events once the user approves (spec §20:
 * "Never automatically modify the calendar without confirmation").
 */
export function planSchedule(input: string, referenceDate: Date = new Date()): PlannedBlock[] {
  const period = detectPeriod(input);
  const topic = detectTopic(input);

  let start = atHour(referenceDate, period.startHour);
  const periodEnd = atHour(referenceDate, period.endHour);
  const now = new Date();
  if (referenceDate.toDateString() === now.toDateString() && now > start) {
    // Round up to the next 15 minutes so we don't suggest starting in the past.
    const rounded = new Date(now);
    rounded.setMinutes(Math.ceil(rounded.getMinutes() / 15) * 15, 0, 0);
    start = rounded < periodEnd ? rounded : periodEnd;
  }

  const totalMinutes = Math.max(30, (periodEnd.getTime() - start.getTime()) / 60000);
  const blocks: { title: string; minutes: number }[] = [];

  if (totalMinutes < 90) {
    blocks.push({ title: topic, minutes: totalMinutes });
  } else {
    const focusMinutes = Math.round(totalMinutes * 0.4 / 15) * 15;
    const breakMinutes = 15;
    const secondaryMinutes = Math.round(totalMinutes * 0.3 / 15) * 15;
    const reviewMinutes = Math.max(15, totalMinutes - focusMinutes - breakMinutes - secondaryMinutes);
    blocks.push(
      { title: topic, minutes: focusMinutes },
      { title: "Break", minutes: breakMinutes },
      { title: `Continue: ${topic}`, minutes: secondaryMinutes },
      { title: "Review", minutes: reviewMinutes }
    );
  }

  const result: PlannedBlock[] = [];
  let cursor = start;
  for (const block of blocks) {
    const blockEnd = new Date(cursor.getTime() + block.minutes * 60000);
    result.push({ title: block.title, start: cursor, end: blockEnd });
    cursor = blockEnd;
  }
  return result;
}
