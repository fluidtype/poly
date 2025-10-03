import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface ToolbarPillItem {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  active?: boolean;
  disabled?: boolean;
  activeClassName?: string;
  onClick?: () => void;
}

interface ToolbarPillsProps {
  items: ToolbarPillItem[];
  ariaLabel?: string;
  className?: string;
}

export function ToolbarPills({ items, ariaLabel, className }: ToolbarPillsProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {items.map(({ id, label, icon: Icon, active, disabled, activeClassName, onClick }) => (
        <Button
          key={id}
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={onClick}
          className={cn(
          "rounded-full border border-white/5 px-4 text-xs font-semibold text-[var(--muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-0",
            active &&
              cn(
                "border-white/15 bg-[var(--primary)]/15 text-[var(--fg)] shadow-[var(--glow)]",
                activeClassName,
              ),
          )}
        >
          {Icon ? (
            <Icon
              className={cn(
                "mr-1.5 h-4 w-4",
                active ? "text-[var(--fg)]" : "text-[var(--muted)]",
              )}
            />
          ) : null}
          {label}
        </Button>
      ))}
    </div>
  );
}
