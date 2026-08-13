import { Skeleton } from "@/components/ui/Skeleton";

export default function CalendarLoading() {
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
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
