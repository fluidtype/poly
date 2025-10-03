"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { Card } from "./Card";

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
    <motion.div
      className={cn("min-h-[220px] lg:min-h-[240px] xl:min-h-0", className)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <Card className="group relative flex h-full flex-col">
        <header className="mb-4 flex items-start justify-between gap-4 md:mb-5">
          <div className="space-y-1">
            {accent ? (
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">
                {accent}
              </p>
            ) : null}
            <h2 className="text-sm font-medium tracking-wide text-[var(--muted)]">
              {title}
            </h2>
            {subtitle && accent && subtitle !== accent ? (
              <p className="text-xs text-white/70">{subtitle}</p>
            ) : null}
          </div>
          {headerAction ? (
            <div className="shrink-0 text-xs text-white/70">{headerAction}</div>
          ) : null}
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden md:gap-5">
          {children}
        </div>
      </Card>
    </motion.div>
  );
}
