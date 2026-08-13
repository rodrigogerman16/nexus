"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md border border-border bg-surface-raised p-3 shadow-overlay data-[state=open]:animate-popover-in",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
