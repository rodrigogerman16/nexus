"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // A real provider (Sentry, etc.) would go here — logging to the console
    // keeps this useful in dev without pretending there's monitoring wired up.
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-base font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          NEXUS hit an unexpected error loading this page. Your data is safe — try again, or
          head back home.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => reset()}>
          Try again
        </Button>
        <Button onClick={() => router.push("/")}>Go home</Button>
      </div>
    </div>
  );
}
