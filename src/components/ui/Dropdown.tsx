"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export const Dropdown = DropdownPrimitive.Root;
export const DropdownTrigger = DropdownPrimitive.Trigger;

export function DropdownContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[10rem] rounded-md border border-border bg-surface-raised p-1 shadow-overlay data-[state=open]:animate-popover-in",
          className
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownItem({
  className,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground outline-none data-[highlighted]:bg-surface-sunken data-[highlighted]:outline-none",
        className
      )}
      {...props}
    />
  );
}

export const DropdownSeparator = DropdownPrimitive.Separator;
