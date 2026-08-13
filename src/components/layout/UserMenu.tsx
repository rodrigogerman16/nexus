"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { HelpCircle, Moon, Settings, Sun } from "lucide-react";
import { Avatar, AvatarFallback, initialsFor } from "@/components/ui/Avatar";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/Dropdown";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { cn } from "@/lib/utils";

export function UserMenu({
  className,
  align = "start",
  collapsed = false,
}: {
  className?: string;
  align?: "start" | "end";
  collapsed?: boolean;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const fullName = useSettingsStore((s) => s.fullName);
  const email = useSettingsStore((s) => s.email);
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <button
          className={cn(
            "focus-ring flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-sunken",
            collapsed && "justify-center px-0",
            className
          )}
          aria-label={`${fullName} — account menu`}
        >
          <Avatar>
            <AvatarFallback>{initialsFor(fullName)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{fullName}</span>
              <span className="block truncate text-xs text-muted-foreground">{email}</span>
            </span>
          )}
        </button>
      </DropdownTrigger>
      <DropdownContent align={align} className="w-56">
        <DropdownItem onSelect={() => router.push("/settings")}>
          <Settings className="h-4 w-4" /> Settings
        </DropdownItem>
        <DropdownItem onSelect={() => setShortcutsOpen(true)}>
          <HelpCircle className="h-4 w-4" /> Help &amp; shortcuts
        </DropdownItem>
        <DropdownItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
