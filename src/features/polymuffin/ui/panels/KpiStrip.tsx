"use client";

import { useMemo } from "react";

interface KpiStripProps {
  totalEvents?: number;
  avgTone?: number;
  avgImpact?: number;
  topPair?: string;
  loading: boolean;
  error: string | null;
}

export default function KpiStrip({ totalEvents, avgTone, avgImpact, topPair, loading, error }: KpiStripProps) {
  const items = useMemo(
    () => [
      {
        label: "Total events",
        value: formatNumber(totalEvents, { maximumFractionDigits: 0 }),
      },
      {
        label: "Avg tone",
        value: formatNumber(avgTone, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
      },
      {
        label: "Avg impact",
        value: formatNumber(avgImpact, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
      },
      {
        label: "Top pair",
        value: topPair ?? "—",
      },
    ],
    [avgImpact, avgTone, topPair, totalEvents],
  );

  if (error) {
    return (
      <div className="card flex h-full items-center justify-center text-sm text-[color:var(--accent-light)]">
        {error}
      </div>
    );
  }

  return (
    <div className="card flex h-full flex-col justify-between px-5 py-4">
      <header>
        <h3 className="text-base font-semibold text-[color:var(--fg)]">Impact snapshot</h3>
        <p className="text-xs text-[color:var(--muted)]">Key indicators from the active window</p>
      </header>
      <div className="grid grid-cols-2 gap-3 text-sm text-[color:var(--muted)]">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--panel)]/50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.28em]">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--fg)] tabular-nums">
              {loading ? <span className="inline-block h-4 w-16 animate-pulse rounded-full bg-[color:var(--panel-strong)]" /> : item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatNumber(value?: number, options?: Intl.NumberFormatOptions) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return value.toLocaleString(undefined, options);
}
