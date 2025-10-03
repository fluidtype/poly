import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

import { Card } from "./card";

interface PanelProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
  headerAction?: ReactNode;
  children?: ReactNode;
}

export function Panel({
  title,
  subtitle,
  eyebrow,
  className,
  headerAction,
  children,
}: PanelProps) {
  const accent = eyebrow ?? subtitle;

  return (
    <Card className={cn("group relative flex h-full flex-col", className)}>
      <header className="mb-4 flex items-start justify-between gap-4 md:mb-5">
        <div className="space-y-1">
          {accent ? (
            <p className="text-sm font-medium tracking-wide text-[var(--muted)]">
              {accent}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold text-[var(--fg)]">{title}</h2>
          {subtitle && accent && subtitle !== accent ? (
            <p className="text-xs text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
        {headerAction ? (
          <div className="shrink-0 text-xs text-[var(--muted)]">{headerAction}</div>
        ) : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden md:gap-5">{children}</div>
    </Card>
  );
}
