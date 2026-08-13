"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, mobilePrimaryHrefs } from "@/components/layout/nav";
import { useUIStore } from "@/lib/store/useUIStore";

export function MobileMoreDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);
  const secondaryItems = navItems.filter((item) => !mobilePrimaryHrefs.includes(item.href));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-surface-raised p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-overlay focus:outline-none data-[state=open]:animate-drawer-in">
            <DialogPrimitive.Title className="sr-only">More</DialogPrimitive.Title>
          <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-border-strong" />
          <div className="grid grid-cols-3 gap-1.5">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "focus-ring flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium",
                    active ? "bg-accent-soft text-accent" : "text-muted-foreground hover:bg-surface-sunken"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/settings"
              onClick={() => onOpenChange(false)}
              className={cn(
                "focus-ring flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium",
                pathname === "/settings" ? "bg-accent-soft text-accent" : "text-muted-foreground hover:bg-surface-sunken"
              )}
            >
              <Settings className="h-5 w-5" strokeWidth={2} />
              Settings
            </Link>
            <button
              onClick={() => {
                onOpenChange(false);
                setShortcutsOpen(true);
              }}
              className="focus-ring flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium text-muted-foreground hover:bg-surface-sunken"
            >
              <HelpCircle className="h-5 w-5" strokeWidth={2} />
              Shortcuts
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
