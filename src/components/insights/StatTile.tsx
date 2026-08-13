import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}

export function StatTile({ label, value, icon: Icon, hint }: StatTileProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
