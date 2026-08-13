"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { AppReady } from "@/components/layout/AppReady";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { Toaster } from "@/components/ui/Toaster";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useHydrateTasksStore } from "@/hooks/useHydrateTasksStore";

const AUTH_ROUTES = ["/login", "/signup"];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useKeyboardShortcuts();
  useHydrateTasksStore();

  if (AUTH_ROUTES.includes(pathname)) {
    return (
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster />
      </TooltipProvider>
    );
  }

  return (
    <AppReady>
      <TooltipProvider delayDuration={200}>
        <div className="flex h-dvh overflow-hidden bg-background">
          <Sidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
        <CommandPalette />
        <ShortcutsModal />
        <Toaster />
      </TooltipProvider>
    </AppReady>
  );
}
