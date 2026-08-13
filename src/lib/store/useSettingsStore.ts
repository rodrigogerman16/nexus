import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIResponseStyle = "concise" | "balanced" | "detailed";

interface SettingsState {
  fullName: string;
  email: string;
  aiResponseStyle: AIResponseStyle;
  aiContextEnabled: boolean;
  notifyTaskReminders: boolean;
  notifyCalendarReminders: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  privacyShareUsageData: boolean;
  setAccount: (patch: Partial<Pick<SettingsState, "fullName" | "email">>) => void;
  setAIResponseStyle: (style: AIResponseStyle) => void;
  setAIContextEnabled: (enabled: boolean) => void;
  setNotificationPref: (
    key: "notifyTaskReminders" | "notifyCalendarReminders" | "notifyEmail" | "notifyPush",
    value: boolean
  ) => void;
  setPrivacyShareUsageData: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fullName: "Rodrigo",
      email: "rodrigoezequielgerman@gmail.com",
      aiResponseStyle: "balanced",
      aiContextEnabled: true,
      notifyTaskReminders: true,
      notifyCalendarReminders: true,
      notifyEmail: false,
      notifyPush: true,
      privacyShareUsageData: false,
      setAccount: (patch) => set(patch),
      setAIResponseStyle: (style) => set({ aiResponseStyle: style }),
      setAIContextEnabled: (enabled) => set({ aiContextEnabled: enabled }),
      setNotificationPref: (key, value) => set({ [key]: value }),
      setPrivacyShareUsageData: (value) => set({ privacyShareUsageData: value }),
    }),
    { name: "acc-settings-store" }
  )
);
