import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-muted-foreground">
        <Compass className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-base font-semibold tracking-tight">Page not found</h1>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          That page doesn&rsquo;t exist, or it may have moved. Try the command palette
          (⌘K) to find what you&rsquo;re looking for.
        </p>
      </div>
      <Link
        href="/"
        className="focus-ring inline-flex h-9 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-foreground transition-all duration-150 hover:brightness-110 active:brightness-95"
      >
        Go home
      </Link>
    </div>
  );
}
