"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { navItems } from "@/components/layout/nav";
import { useUIStore } from "@/lib/store/useUIStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { NotificationsPanel } from "@/components/layout/NotificationsPanel";
import { UserMenu } from "@/components/layout/UserMenu";

export function TopBar() {
  const pathname = usePathname();
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const projects = useTasksStore((s) => s.projects);
  const current = navItems.find((n) => n.href === pathname);

  let title = current?.label ?? "NEXUS";
  let breadcrumb: string | null = null;
  if (!current && pathname.startsWith("/projects/")) {
    const id = pathname.split("/")[2];
    const project = projects.find((p) => p.id === id);
    title = project?.name ?? "Project";
    breadcrumb = "Projects";
  } else if (pathname === "/settings") {
    title = "Settings";
  } else if (pathname === "/chat") {
    title = "Assistant";
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
      <div className="min-w-0 flex-1 md:flex-none">
        <h1 className="truncate text-sm font-semibold tracking-tight">
          {breadcrumb && (
            <span className="font-normal text-muted-foreground">{breadcrumb} / </span>
          )}
          {title}
        </h1>
      </div>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="focus-ring hidden flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border-strong md:flex md:max-w-md"
      >
        <kbd className="rounded border border-border-strong bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
        <span>Search or ask NEXUS…</span>
      </button>

      <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-sunken text-muted-foreground md:hidden"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5" />
        </button>

        <div className="mr-1 hidden items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs text-muted-foreground md:flex">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent"
            style={{ boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent)" }}
          />
          NEXUS AI
        </div>

        <NotificationsPanel />
        <UserMenu className="w-9" align="end" collapsed />
      </div>
    </header>
  );
}
