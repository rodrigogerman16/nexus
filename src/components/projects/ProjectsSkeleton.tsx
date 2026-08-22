import { Skeleton } from "@/components/ui/Skeleton";

/** Shared between src/app/projects/loading.tsx and the Projects page itself
 * — see TasksSkeleton for why the page needs its own copy of this rather
 * than relying on the route-level loading.tsx alone. */
export function ProjectsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
