import type { Metadata } from "next";
import { ActivityFeed } from "@/components/activity/ActivityFeed";

export const metadata: Metadata = { title: "Activity" };

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <h1 className="mb-6 text-lg font-semibold tracking-tight">Activity</h1>
      <ActivityFeed />
    </div>
  );
}
