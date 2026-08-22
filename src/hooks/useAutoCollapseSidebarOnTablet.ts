"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store/useUIStore";

const PERSIST_KEY = "acc-ui-store";
const TABLET_QUERY = "(min-width: 768px) and (max-width: 1023px)";

/**
 * Spec §31: desktop gets the full sidebar, tablet gets a collapsed one --
 * the collapse toggle itself already exists and persists, this just seeds
 * a sensible default the first time the app opens on a tablet-width
 * screen. Only fires when the sidebarCollapsed preference has never been
 * persisted before; once a user has toggled it (at any width), that's
 * their own choice and this must never silently override it.
 */
export function useAutoCollapseSidebarOnTablet() {
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    if (localStorage.getItem(PERSIST_KEY)) return;
    if (window.matchMedia(TABLET_QUERY).matches) {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);
}
