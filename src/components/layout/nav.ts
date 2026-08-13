import {
  Activity,
  BarChart3,
  CalendarDays,
  FileText,
  FolderKanban,
  Home,
  ListTodo,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  shortcut: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home, shortcut: "G H" },
  { href: "/tasks", label: "Tasks", icon: ListTodo, shortcut: "G T" },
  { href: "/projects", label: "Projects", icon: FolderKanban, shortcut: "G P" },
  { href: "/notes", label: "Notes", icon: FileText, shortcut: "G N" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, shortcut: "G C" },
  { href: "/activity", label: "Activity", icon: Activity, shortcut: "G A" },
  { href: "/insights", label: "Insights", icon: BarChart3, shortcut: "G I" },
];

/** Primary items shown in the mobile bottom nav; the rest live behind "More". */
export const mobilePrimaryHrefs = ["/", "/tasks", "/projects", "/notes"];
