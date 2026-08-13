import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:brightness-110 active:brightness-95 shadow-sm",
  secondary:
    "bg-surface-sunken text-foreground hover:bg-border border border-border",
  ghost: "bg-transparent text-foreground hover:bg-surface-sunken",
  outline: "bg-transparent border border-border-strong text-foreground hover:bg-surface-sunken",
  danger: "bg-danger text-white hover:brightness-110",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-sm",
  md: "h-9 px-4 text-sm gap-2 rounded-sm",
  lg: "h-11 px-5 text-base gap-2 rounded-sm",
  icon: "h-9 w-9 rounded-sm justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "focus-ring inline-flex items-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none select-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
