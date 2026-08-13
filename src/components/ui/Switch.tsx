"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "focus-ring relative h-5 w-9 shrink-0 rounded-full bg-border-strong transition-colors data-[state=checked]:bg-accent",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-150 data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  );
}
