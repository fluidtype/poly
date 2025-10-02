"use client";

import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ReactNode, useMemo } from "react";

interface KpiCardsProps {
  totalEvents?: number;
  avgTone?: number;
  avgImpact?: number;
  topPair?: string;
  isLoading?: boolean;
  error?: string | null;
}

interface KpiCardProps {
  label: string;
  value: ReactNode;
  trend?: number | null;
}

const formatNumber = (value?: number, options?: Intl.NumberFormatOptions) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return value.toLocaleString(undefined, options);
};

const TrendIndicator = ({ value }: { value: number }) => {
  if (!value) return null;

  const isPositive = value > 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition",
        isPositive
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-[color:var(--accent)]/20 text-[color:var(--accent-light)]",
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {formatNumber(Math.abs(value), {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      })}
    </span>
  );
};

const KpiCard = ({ label, value, trend }: KpiCardProps) => {
  return (
    <div className="card flex flex-col gap-3 rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--card)]/90 p-5">
      <p className="meta uppercase tracking-[0.12em]">{label}</p>
      <div className="flex items-baseline gap-3">
        <p className="kpi tabular-nums">{value}</p>
        {typeof trend === "number" && trend !== 0 ? <TrendIndicator value={trend} /> : null}
      </div>
    </div>
  );
};

export function KpiCards({
  totalEvents,
  avgTone,
  avgImpact,
  topPair,
  isLoading = false,
  error,
}: KpiCardsProps) {
  const items = useMemo(
    () => [
      {
        label: "Total Events",
        value: formatNumber(totalEvents, { maximumFractionDigits: 0 }),
      },
      {
        label: "Avg Tone",
        value: formatNumber(avgTone, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
        trend: avgTone ?? null,
      },
      {
        label: "Avg Impact",
        value: formatNumber(avgImpact, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
        trend: avgImpact ?? null,
      },
      {
        label: "Top Actor Pair",
        value: topPair ?? "—",
      },
    ],
    [avgImpact, avgTone, topPair, totalEvents],
  );

  if (error) {
    return (
      <div className="card rounded-2xl border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 p-5 text-sm text-[color:var(--accent-light)]">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="card h-28 animate-pulse rounded-2xl bg-[color:var(--elev-2)]/60"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <KpiCard key={item.label} label={item.label} value={item.value} trend={item.trend ?? undefined} />
      ))}
    </div>
  );
}
