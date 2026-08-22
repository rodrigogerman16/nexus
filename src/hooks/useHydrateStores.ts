"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { generateAmbientNotifications } from "@/lib/notifications/generateAmbient";

/** Loads the signed-in user's Supabase-backed data (tasks, projects, notes,
 * calendar events, habits, goals, activity, notifications) once on mount,
 * then keeps it in sync with sign-in/sign-out (e.g. the tab was already
 * open when the user signed out elsewhere). Mounted once, at the app shell. */
export function useHydrateStores() {
  const generatedAmbientRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const hydrateAll = async (userId: string | undefined) => {
      const id = userId ?? null;
      await Promise.all([
        useTasksStore.getState().hydrate(id),
        useNotesStore.getState().hydrate(id),
        useLifeStore.getState().hydrate(id),
        useActivityStore.getState().hydrate(id),
        useNotificationsStore.getState().hydrate(id),
      ]);
      // Needs tasks/events/activity/notifications all loaded first, since it
      // reads their state directly rather than subscribing to it. Guarded to
      // run once per session — getUser() and onAuthStateChange's initial
      // fire can both resolve around the same time, and without this a
      // reload can double-generate a day's ambient notifications before
      // either call has written its localStorage dedup key.
      if (id && !generatedAmbientRef.current) {
        generatedAmbientRef.current = true;
        generateAmbientNotifications();
      }
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
