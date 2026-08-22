"use client";

import { useEffect, useState } from "react";
import { Keyboard as KeyboardIcon } from "lucide-react";
import { useUIStore } from "@/lib/store/useUIStore";
import {
  RESERVED_KEYS,
  SHORTCUT_ACTIONS,
  useShortcutsStore,
  type ShortcutActionId,
} from "@/lib/store/useShortcutsStore";
import { toast } from "@/lib/store/useToastStore";
import { Button } from "@/components/ui/Button";
import { SettingsSection, Row } from "@/components/settings/SettingsLayout";

function displayKey(key: string): string {
  if (key === " ") return "Space";
  if (/^[a-z]$/.test(key)) return key.toUpperCase();
  if (/^[A-Z]$/.test(key)) return `Shift+${key}`;
  return key;
}

export function KeyboardShortcutsSection() {
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);
  const shortcutBindings = useShortcutsStore((s) => s.bindings);
  const setShortcutBinding = useShortcutsStore((s) => s.setBinding);
  const resetShortcutBinding = useShortcutsStore((s) => s.resetBinding);
  const resetAllShortcuts = useShortcutsStore((s) => s.resetAll);
  const [listeningId, setListeningId] = useState<ShortcutActionId | null>(null);

  useEffect(() => {
    if (!listeningId) return;
    const actionId = listeningId;
    function onKeyDown(e: KeyboardEvent) {
      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        setListeningId(null);
        return;
      }
      if (RESERVED_KEYS.includes(e.key)) {
        toast.error(`"${displayKey(e.key)}" is reserved and can't be reassigned.`);
        return;
      }
      const conflict = SHORTCUT_ACTIONS.find(
        (a) => a.id !== actionId && shortcutBindings[a.id] === e.key
      );
      if (conflict) {
        toast.error(`"${displayKey(e.key)}" is already used for "${conflict.label}".`);
        return;
      }
      setShortcutBinding(actionId, e.key);
      setListeningId(null);
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [listeningId, shortcutBindings, setShortcutBinding]);

  return (
    <SettingsSection
      title="Keyboard"
      description="Click Change, then press the key you want to use instead."
    >
      {SHORTCUT_ACTIONS.map((action) => {
        const key = shortcutBindings[action.id];
        const isCustom = key !== action.defaultKey;
        const listening = listeningId === action.id;
        return (
          <Row key={action.id} label={action.label}>
            <div className="flex items-center gap-2">
              {listening ? (
                <span className="rounded border border-accent bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
                  Press a key…
                </span>
              ) : (
                <kbd className="rounded border border-border-strong bg-surface px-2 py-1 font-mono text-xs text-muted-foreground">
                  {displayKey(key)}
                </kbd>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setListeningId(listening ? null : action.id)}
              >
                {listening ? "Cancel" : "Change"}
              </Button>
              {isCustom && !listening && (
                <Button variant="ghost" size="sm" onClick={() => resetShortcutBinding(action.id)}>
                  Reset
                </Button>
              )}
            </div>
          </Row>
        );
      })}
      {SHORTCUT_ACTIONS.some((a) => shortcutBindings[a.id] !== a.defaultKey) && (
        <Row label="Reset all shortcuts" hint="Restore every shortcut above to its default key.">
          <Button variant="ghost" size="sm" onClick={resetAllShortcuts}>
            Reset all
          </Button>
        </Row>
      )}
      <Row
        label="Full list"
        hint="See every keyboard shortcut available in NEXUS, including navigation."
      >
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => setShortcutsOpen(true)}
        >
          <KeyboardIcon className="h-3.5 w-3.5" /> View shortcuts
        </Button>
      </Row>
    </SettingsSection>
  );
}
