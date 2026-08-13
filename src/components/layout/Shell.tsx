"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { AppReady } from "@/components/layout/AppReady";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function Shell({ children }: { children: ReactNode }) {
  useKeyboardShortcuts();

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
      </TooltipProvider>
    </AppReady>
  );
}
