import { CalendarSkeleton } from "@/components/life/CalendarSkeleton";

export default function CalendarLoading() {
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <CalendarSkeleton />
    </div>
  );
}
