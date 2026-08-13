import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <Skeleton className="mb-2 h-7 w-64" />
      <Skeleton className="mb-6 h-4 w-48" />
      <Skeleton className="mb-6 h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
