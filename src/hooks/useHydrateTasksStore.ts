"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTasksStore } from "@/lib/store/useTasksStore";

/** Loads the signed-in user's tasks/projects once on mount, then keeps them
 * in sync with sign-in/sign-out (e.g. the tab was already open when the
 * user signed out elsewhere). Mounted once, at the app shell. */
export function useHydrateTasksStore() {
  useEffect(() => {
    const supabase = createClient();
    const hydrate = useTasksStore.getState().hydrate;

    supabase.auth.getUser().then(({ data: { user } }) => {
      hydrate(user?.id ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrate(session?.user.id ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);
}
