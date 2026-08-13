"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store/useUIStore";

const chordRoutes: Record<string, string> = {
  h: "/",
  t: "/tasks",
  p: "/projects",
  n: "/notes",
  c: "/calendar",
  a: "/activity",
  i: "/insights",
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);
  const requestQuickCreate = useUIStore((s) => s.requestQuickCreate);
  const chordPending = useRef(false);
  const chordTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      if (chordPending.current) {
        chordPending.current = false;
        clearTimeout(chordTimeout.current);
        const href = chordRoutes[e.key.toLowerCase()];
        if (href) {
          e.preventDefault();
          router.push(href);
        }
        return;
      }

      if (e.key === "g" || e.key === "G") {
        chordPending.current = true;
        chordTimeout.current = setTimeout(() => {
          chordPending.current = false;
        }, 900);
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (e.key === "n") {
        e.preventDefault();
        requestQuickCreate("task");
        router.push("/tasks");
        return;
      }

      if (e.key === "N") {
        e.preventDefault();
        requestQuickCreate("note");
        router.push("/notes");
        return;
      }

      if (e.key === "p") {
        e.preventDefault();
        requestQuickCreate("project");
        router.push("/projects");
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(chordTimeout.current);
    };
  }, [router, setCommandPaletteOpen, setShortcutsOpen, requestQuickCreate]);
}
