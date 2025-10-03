import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  className?: string;
  headerAction?: ReactNode;
  children?: ReactNode;
}

export function Panel({
  title,
  subtitle,
  className,
  headerAction,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        "group relative flex h-full flex-col",
        "rounded-2xl border border-white/5 bg-[var(--panel)]/90 p-6",
        "text-sm text-[var(--fg)] shadow-[var(--glow)] backdrop-blur transition-colors",
        "hover:border-white/10 focus-within:border-white/10",
        "focus-within:shadow-[0_0_0_1px_rgba(255,106,106,0.35)]",
        className,
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight text-[var(--fg)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {headerAction ? (
          <div className="shrink-0 text-xs text-[var(--muted)]">{headerAction}</div>
        ) : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">{children}</div>
    </section>
  );
}
