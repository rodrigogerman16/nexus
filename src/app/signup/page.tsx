import Link from "next/link";
import { NexusMark } from "@/components/layout/NexusMark";
import { AuthForm } from "@/components/auth/AuthForm";
import { signUp } from "@/lib/auth/actions";

export default function SignupPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <NexusMark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Create your NEXUS account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your personal command center.</p>
          </div>
        </div>
        <AuthForm action={signUp} submitLabel="Create account" pendingLabel="Creating account…" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
