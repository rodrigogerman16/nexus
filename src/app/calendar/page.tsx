import type { Metadata } from "next";
import { CalendarView } from "@/components/life/CalendarView";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <CalendarView />
    </div>
  );
}
