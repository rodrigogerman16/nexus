"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export const Avatar = ({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root
    className={cn("relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
);

export const AvatarImage = AvatarPrimitive.Image;

export const AvatarFallback = ({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex h-full w-full items-center justify-center bg-accent-soft text-xs font-semibold text-accent",
      className
    )}
    {...props}
  />
);

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
