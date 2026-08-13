"use client";

import { useMemo, useState } from "react";
import { toDateKey } from "@/lib/utils";
import { useLifeStore } from "@/lib/store/useLifeStore";

function lastNDays(n: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export function WeeklyCheckInsChart() {
  const habits = useLifeStore((s) => s.habits);
  const [hovered, setHovered] = useState<number | null>(null);
  const days = useMemo(() => lastNDays(7), []);

  const counts = useMemo(
    () =>
      days.map((day) => {
        const key = toDateKey(day);
        return habits.reduce((total, h) => total + (h.completions[key] ? 1 : 0), 0);
      }),
    [days, habits]
  );

  const max = Math.max(1, ...counts);

  return (
    <div>
      <div className="flex items-stretch gap-2.5" style={{ height: 120 }}>
        {days.map((day, i) => {
          const count = counts[i];
          const heightPct = (count / max) * 100;
          const isHovered = hovered === i;
          return (
            <div key={day.toISOString()} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex min-h-0 w-full flex-1 items-end justify-center">
                {isHovered && (
                  <div
                    role="tooltip"
                    className="absolute bottom-full mb-1.5 whitespace-nowrap rounded-md border border-border bg-surface-raised px-2 py-1 text-xs shadow-overlay"
                  >
                    <span className="font-semibold text-foreground">{count}</span>{" "}
                    <span className="text-muted-foreground">check-in{count === 1 ? "" : "s"}</span>
                  </div>
                )}
                <button
                  type="button"
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  aria-label={`${day.toLocaleDateString(undefined, { weekday: "long" })}: ${count} check-in${count === 1 ? "" : "s"}`}
                  className={`focus-ring w-full max-w-6 rounded-t-[4px] transition-[filter] ${
                    isHovered ? "brightness-110" : ""
                  }`}
                  style={{
                    height: `${Math.max(heightPct, count > 0 ? 6 : 2)}%`,
                    backgroundColor: count > 0 ? "var(--accent)" : "var(--border)",
                  }}
                />
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {day.toLocaleDateString(undefined, { weekday: "narrow" })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 border-t border-border" />
    </div>
  );
}
