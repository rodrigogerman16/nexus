"use client";

import Link from "next/link";
import { Activity as ActivityIcon } from "lucide-react";
import { useActivityStore } from "@/lib/store/useActivityStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function ActivityPreview() {
  const activities = useActivityStore((s) => s.activities);

  const recent = [...activities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-accent" /> Activity
        </CardTitle>
        <Link href="/activity" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {recent.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate text-foreground">{item.description}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
          </div>
        ))}
        {recent.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
