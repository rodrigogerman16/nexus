"use client";

import { useTheme } from "next-themes";
import { Keyboard as KeyboardIcon, Monitor, Moon, Sun } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useSettingsStore, type AIResponseStyle } from "@/lib/store/useSettingsStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-6 first:pt-0 last:border-0">
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const mounted = useHasMounted();
  const { theme, setTheme } = useTheme();
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);

  const fullName = useSettingsStore((s) => s.fullName);
  const email = useSettingsStore((s) => s.email);
  const setAccount = useSettingsStore((s) => s.setAccount);
  const aiResponseStyle = useSettingsStore((s) => s.aiResponseStyle);
  const setAIResponseStyle = useSettingsStore((s) => s.setAIResponseStyle);
  const aiContextEnabled = useSettingsStore((s) => s.aiContextEnabled);
  const setAIContextEnabled = useSettingsStore((s) => s.setAIContextEnabled);
  const notifyTaskReminders = useSettingsStore((s) => s.notifyTaskReminders);
  const notifyCalendarReminders = useSettingsStore((s) => s.notifyCalendarReminders);
  const notifyEmail = useSettingsStore((s) => s.notifyEmail);
  const notifyPush = useSettingsStore((s) => s.notifyPush);
  const setNotificationPref = useSettingsStore((s) => s.setNotificationPref);
  const privacyShareUsageData = useSettingsStore((s) => s.privacyShareUsageData);
  const setPrivacyShareUsageData = useSettingsStore((s) => s.setPrivacyShareUsageData);

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <h1 className="mb-6 text-lg font-semibold tracking-tight">Settings</h1>

      <SettingsSection title="Account">
        <Row label="Full name">
          <Input
            value={fullName}
            onChange={(e) => setAccount({ fullName: e.target.value })}
            className="w-56"
          />
        </Row>
        <Row label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setAccount({ email: e.target.value })}
            className="w-56"
          />
        </Row>
      </SettingsSection>

      <SettingsSection title="Appearance">
        <Row label="Theme">
          <div className="flex overflow-hidden rounded-sm border border-border">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "focus-ring flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  mounted && theme === value
                    ? "bg-accent-soft text-accent"
                    : "text-muted-foreground hover:bg-surface-sunken"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </Row>
      </SettingsSection>

      <SettingsSection title="AI" description="Control how NEXUS responds and what it can see.">
        <Row label="Response style">
          <Select
            value={aiResponseStyle}
            onValueChange={(v) => setAIResponseStyle(v as AIResponseStyle)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row
          label="Context permissions"
          hint="Let NEXUS read the page you're on to answer questions about it."
        >
          <Switch checked={aiContextEnabled} onCheckedChange={setAIContextEnabled} />
        </Row>
      </SettingsSection>

      <SettingsSection title="Notifications">
        <Row label="Task reminders">
          <Switch
            checked={notifyTaskReminders}
            onCheckedChange={(v) => setNotificationPref("notifyTaskReminders", v)}
          />
        </Row>
        <Row label="Calendar reminders">
          <Switch
            checked={notifyCalendarReminders}
            onCheckedChange={(v) => setNotificationPref("notifyCalendarReminders", v)}
          />
        </Row>
        <Row label="Email notifications">
          <Switch
            checked={notifyEmail}
            onCheckedChange={(v) => setNotificationPref("notifyEmail", v)}
          />
        </Row>
        <Row label="Push notifications">
          <Switch
            checked={notifyPush}
            onCheckedChange={(v) => setNotificationPref("notifyPush", v)}
          />
        </Row>
      </SettingsSection>

      <SettingsSection title="Keyboard">
        <Row label="Shortcuts" hint="See every keyboard shortcut available in NEXUS.">
          <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setShortcutsOpen(true)}>
            <KeyboardIcon className="h-3.5 w-3.5" /> View shortcuts
          </Button>
        </Row>
      </SettingsSection>

      <SettingsSection title="Privacy">
        <Row
          label="Share usage data"
          hint="Help improve NEXUS by sharing anonymous product usage data."
        >
          <Switch
            checked={privacyShareUsageData}
            onCheckedChange={setPrivacyShareUsageData}
          />
        </Row>
      </SettingsSection>
    </div>
  );
}
