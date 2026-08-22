import { Skeleton } from "@/components/ui/Skeleton";

/** Shared between src/app/tasks/loading.tsx (Next's route-level Suspense
 * boundary, which covers route-code loading) and the Tasks page itself
 * (which shows this while useTasksStore's real, client-side Supabase fetch
 * is still in flight — a separate loading window loading.tsx never covers,
 * since the route itself renders instantly once code-split chunks are
 * cached). Without this, the page fell through to its "No tasks here"
 * empty state during that window, which is worse than a blank screen: it
 * confidently tells the user something false. */
export function TasksSkeleton() {
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
