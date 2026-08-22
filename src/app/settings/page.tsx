"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useSettingsStore, type AIResponseStyle } from "@/lib/store/useSettingsStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { toast } from "@/lib/store/useToastStore";
import { exportUserDataToFile } from "@/lib/account/dataManagement";
import { Avatar, AvatarFallback, AvatarImage, initialsFor } from "@/components/ui/Avatar";
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
import { SettingsSection, Row } from "@/components/settings/SettingsLayout";
import { KeyboardShortcutsSection } from "@/components/settings/KeyboardShortcutsSection";
import { DeleteAllDataDialog } from "@/components/settings/DeleteAllDataDialog";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const mounted = useHasMounted();
  const { theme, setTheme } = useTheme();

  const fullName = useSettingsStore((s) => s.fullName);
  const email = useSettingsStore((s) => s.email);
  const avatarUrl = useSettingsStore((s) => s.avatarUrl);
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

  const userId = useTasksStore((s) => s.userId);

  function handleExport() {
    exportUserDataToFile();
    toast.success("Your data was exported.");
  }

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
        <Row label="Avatar" hint="Paste an image URL, or leave blank to use your initials.">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
              <AvatarFallback className="text-sm">{initialsFor(fullName)}</AvatarFallback>
            </Avatar>
            <Input
              value={avatarUrl}
              onChange={(e) => setAccount({ avatarUrl: e.target.value.trim() })}
              placeholder="https://…"
              className="w-56"
            />
          </div>
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

      <KeyboardShortcutsSection />

      <SettingsSection title="Privacy">
        <Row
          label="Share usage data"
          hint="Help improve NEXUS by sharing anonymous product usage data."
        >
          <Switch checked={privacyShareUsageData} onCheckedChange={setPrivacyShareUsageData} />
        </Row>
        <Row label="Export your data" hint="Download everything NEXUS has stored for you as JSON.">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            Export data
          </Button>
        </Row>
        <DeleteAllDataDialog userId={userId} />
      </SettingsSection>
    </div>
  );
}
