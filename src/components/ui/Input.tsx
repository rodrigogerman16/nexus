import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "focus-ring h-9 w-full rounded-sm border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "focus-ring w-full resize-none rounded-sm border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
