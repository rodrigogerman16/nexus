import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-sunken text-muted-foreground",
  accent: "bg-accent-soft text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  outline: "border border-border-strong text-muted-foreground",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium leading-none",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
