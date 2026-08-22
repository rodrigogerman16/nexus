import { Skeleton } from "@/components/ui/Skeleton";

/** Shared between src/app/calendar/loading.tsx and CalendarView itself —
 * see TasksSkeleton for why the view needs its own copy of this rather
 * than relying on the route-level loading.tsx alone. */
export function CalendarSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-56" />
      </div>
      <Skeleton className="mb-4 h-20 w-full rounded-xl" />
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
