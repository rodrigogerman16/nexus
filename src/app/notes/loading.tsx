import { Skeleton } from "@/components/ui/Skeleton";

export default function NotesLoading() {
  return (
    <div className="flex h-full min-h-0">
      <div className="hidden h-full w-72 shrink-0 flex-col gap-2 border-r border-border p-3 md:flex">
        <Skeleton className="mb-2 h-9 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      <div className="hidden flex-1 p-6 md:block">
        <Skeleton className="mb-4 h-7 w-56" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
    </div>
  );
}
