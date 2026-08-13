import { Skeleton } from "@/components/ui/Skeleton";

export default function TasksLoading() {
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <Skeleton className="mb-4 h-10 w-full rounded-lg" />
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
