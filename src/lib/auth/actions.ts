"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error?: string;
  message?: string;
}

const signInSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

const signUpSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(8),
});

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter your email and password." };
  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/");
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const passwordIssue = parsed.error.issues.find((i) => i.path[0] === "password");
    const otherIssue = parsed.error.issues.find((i) => i.path[0] !== "password");
    if (!otherIssue && passwordIssue?.code === "too_small") {
      return { error: "Password must be at least 8 characters." };
    }
    return { error: "Enter an email and password." };
  }
  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  // Email confirmation is on by default for a fresh Supabase project — in
  // that case signUp succeeds but issues no session yet.
  if (!data.session) {
    return { message: "Check your email to confirm your account, then sign in." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
