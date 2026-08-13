"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, mobilePrimaryHrefs } from "@/components/layout/nav";
import { MobileMoreDrawer } from "@/components/layout/MobileMoreDrawer";

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryItems = navItems.filter((item) => mobilePrimaryHrefs.includes(item.href));
  const secondaryActive = navItems.some(
    (item) => !mobilePrimaryHrefs.includes(item.href) && item.href === pathname
  );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden">
        {primaryItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium",
                active ? "text-accent" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "focus-ring flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium",
            secondaryActive || pathname === "/settings" ? "text-accent" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
          More
        </button>
      </nav>
      <MobileMoreDrawer open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
