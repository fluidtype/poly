"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "secondary";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-[color:var(--primary)] text-[color:var(--text)] shadow-[0_12px_35px_rgba(224,36,36,0.35)] hover:bg-[color:var(--primary-600)]",
  outline:
    "border border-[color:var(--border)]/70 bg-transparent text-[color:var(--text)] hover:border-[color:var(--primary)]/45 hover:bg-[color:var(--primary)]/10",
  ghost:
    "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--primary)]/10",
  secondary:
    "bg-[color:var(--surface-2)] text-[color:var(--text)] hover:bg-[color:var(--surface)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2 text-sm font-semibold",
  sm: "h-8 px-3 text-xs font-semibold",
  lg: "h-12 px-6 text-sm font-semibold",
  icon: "h-10 w-10",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/45 disabled:pointer-events-none disabled:opacity-50",
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

export { Button };
