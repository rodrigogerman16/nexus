"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useTasksStore } from "@/lib/store/useTasksStore";
import { useLifeStore } from "@/lib/store/useLifeStore";
import { useNotesStore } from "@/lib/store/useNotesStore";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { useAIContextStore } from "@/lib/ai/context";
import { TodayTasks } from "@/components/today/TodayTasks";
import { TodaySchedule } from "@/components/today/TodaySchedule";
import { TodayHabits } from "@/components/today/TodayHabits";
import { TodayNotes } from "@/components/today/TodayNotes";
import { AIBriefCard } from "@/components/today/AIBriefCard";
import { DailyOverview } from "@/components/today/DailyOverview";
import { ProjectsOverview } from "@/components/today/ProjectsOverview";
import { ActivityPreview } from "@/components/today/ActivityPreview";
import { HabitTracker } from "@/components/life/HabitTracker";
import { GoalsPanel } from "@/components/life/GoalsPanel";
import { DashboardSkeleton } from "@/components/today/DashboardSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

function useGreeting() {
  const [greeting, setGreeting] = useState("Hello");
  // This page is statically prerendered, so the visitor's local hour is only
  // known after mount — computing it during render would mismatch the
  // prerendered markup.
  useEffect(() => {
    const hour = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hour < 5) setGreeting("Working late");
    else if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);
  return greeting;
}

export default function TodayPage() {
  const greeting = useGreeting();
  const fullName = useSettingsStore((s) => s.fullName);
  const firstName = fullName.trim().split(/\s+/)[0] || fullName;
  const setAIContext = useAIContextStore((s) => s.setContext);
  const tasksStatus = useTasksStore((s) => s.status);
  const lifeStatus = useLifeStore((s) => s.status);
  const notesStatus = useNotesStore((s) => s.status);
  const activityStatus = useActivityStore((s) => s.status);

  useEffect(() => {
    setAIContext({ type: "dashboard" });
  }, [setAIContext]);

  // Distinct from src/app/loading.tsx: that covers Next's route-level
  // Suspense boundary, not the real client-side Supabase fetches this
  // page's many widgets depend on. Without this, each widget fell through
  // to its own "nothing here" empty state while those fetches were still
  // in flight.
  const notReady = [tasksStatus, lifeStatus, notesStatus, activityStatus].some(
    (s) => s === "idle" || s === "loading"
  );
  if (notReady) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&rsquo;s what needs your attention today.
        </p>
      </div>

      <div className="mb-6">
        <DailyOverview />
      </div>

      <div className="mb-6">
        <AIBriefCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TodayTasks />
          <TodaySchedule />
          <ProjectsOverview />
        </div>
        <div className="space-y-4">
          <TodayHabits />
          <TodayNotes />
          <ActivityPreview />
        </div>
      </div>

      <div id="habits-goals" className="mt-8 scroll-mt-6">
        <h2 className="mb-4 text-sm font-semibold tracking-tight">Habits &amp; goals</h2>
        <Tabs defaultValue="habits">
          <TabsList className="mb-4">
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>
          <TabsContent value="habits">
            <HabitTracker />
          </TabsContent>
          <TabsContent value="goals">
            <GoalsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
