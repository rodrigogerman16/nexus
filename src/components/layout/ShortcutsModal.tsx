"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { useUIStore } from "@/lib/store/useUIStore";
import { navItems } from "@/components/layout/nav";

const actionShortcuts: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["/"], label: "Search" },
  { keys: ["N"], label: "New task" },
  { keys: ["Shift", "N"], label: "New note" },
  { keys: ["P"], label: "New project" },
  { keys: ["Esc"], label: "Close dialog / palette" },
  { keys: ["?"], label: "Show this shortcuts panel" },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded border border-border-strong bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  );
}

export function ShortcutsModal() {
  const open = useUIStore((s) => s.shortcutsOpen);
  const setOpen = useUIStore((s) => s.setShortcutsOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <div className="mt-4 space-y-5">
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </h3>
            <ul className="space-y-2">
              {actionShortcuts.map((s) => (
                <li key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{s.label}</span>
                  <span className="flex gap-1">
                    {s.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Navigate
            </h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className="flex gap-1">
                    {item.shortcut.split(" ").map((k, i) => (
                      <Kbd key={i}>{k}</Kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
