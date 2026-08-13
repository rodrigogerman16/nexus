"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { useLifeStore } from "@/lib/store/useLifeStore";

/** Loads the signed-in user's Supabase-backed data (tasks, projects, notes,
 * calendar events) once on mount, then keeps it in sync with sign-in/sign-out
 * (e.g. the tab was already open when the user signed out elsewhere).
 * Mounted once, at the app shell. */
export function useHydrateStores() {
  useEffect(() => {
    const supabase = createClient();

    const hydrateAll = (userId: string | undefined) => {
      useTasksStore.getState().hydrate(userId ?? null);
      useNotesStore.getState().hydrate(userId ?? null);
      useLifeStore.getState().hydrateEvents(userId ?? null);
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      hydrateAll(user?.id);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateAll(session?.user.id);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);
}
