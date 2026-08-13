"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ChevronsLeft, ChevronsRight, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav";
import { useUIStore } from "@/lib/store/useUIStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { NexusMark } from "@/components/layout/NexusMark";
import { UserMenu } from "@/components/layout/UserMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";

function WorkspaceLink({
  href,
  color,
  name,
  collapsed,
}: {
  href: string;
  color: string;
  name: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  const link = (
    <Link
      href={href}
      className={cn(
        "focus-ring flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
        collapsed && "justify-center px-0",
        active ? "bg-accent-soft text-accent" : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {!collapsed && <span className="truncate">{name}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{name}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const projects = useTasksStore((s) => s.projects);

  const favoriteProjects = useMemo(() => projects.filter((p) => p.isFavorite), [projects]);
  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === "active" && !p.isFavorite),
    [projects]
  );
  const recentProjects = useMemo(() => {
    const shown = new Set([...favoriteProjects, ...activeProjects].map((p) => p.id));
    return [...projects]
      .filter((p) => !shown.has(p.id))
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
      .slice(0, 3);
  }, [projects, favoriteProjects, activeProjects]);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      <div className={cn("flex items-center gap-2 px-4 py-4", collapsed && "justify-center px-0")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <NexusMark className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold tracking-tight">NEXUS</p>
            <p className="truncate text-[11px] text-muted-foreground">Command center</p>
          </div>
        )}
      </div>

      <div className={cn("px-3", collapsed && "px-2")}>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            "focus-ring flex w-full items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border-strong",
            collapsed && "justify-center px-0"
          )}
          aria-label="Search or jump to…"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search or jump to…</span>
              <kbd className="rounded border border-border-strong bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      <nav className={cn("mt-4 space-y-0.5 px-3", collapsed && "px-2")}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const link = (
            <Link
              href={item.href}
              className={cn(
                "focus-ring group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
          if (!collapsed) return <div key={item.href}>{link}</div>;
          return (
            <Tooltip key={item.href} delayDuration={300}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-3">
        {favoriteProjects.length > 0 && (
          <div>
            {!collapsed && (
              <p className="mb-1 flex items-center gap-1 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <Star className="h-3 w-3" /> Favorites
              </p>
            )}
            <div className="space-y-0.5">
              {favoriteProjects.map((p) => (
                <WorkspaceLink
                  key={p.id}
                  href={`/projects/${p.id}`}
                  color={p.color}
                  name={p.name}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        )}

        {activeProjects.length > 0 && (
          <div>
            {!collapsed && (
              <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Active projects
              </p>
            )}
            <div className="space-y-0.5">
              {activeProjects.map((p) => (
                <WorkspaceLink
                  key={p.id}
                  href={`/projects/${p.id}`}
                  color={p.color}
                  name={p.name}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        )}

        {recentProjects.length > 0 && (
          <div>
            {!collapsed && (
              <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Recent
              </p>
            )}
            <div className="space-y-0.5">
              {recentProjects.map((p) => (
                <WorkspaceLink
                  key={p.id}
                  href={`/projects/${p.id}`}
                  color={p.color}
                  name={p.name}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border px-2 py-2">
        <UserMenu collapsed={collapsed} />
        <button
          onClick={toggleSidebar}
          className={cn(
            "focus-ring mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
