import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-white/5 bg-[var(--panel)]/90 p-4 shadow-[var(--glow)] backdrop-blur transition-colors",
        "md:p-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring)] focus-visible:ring-opacity-50",
        "focus-within:border-white/10 focus-within:ring-1 focus-within:ring-[color:var(--ring)] focus-within:ring-opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = "Card";
