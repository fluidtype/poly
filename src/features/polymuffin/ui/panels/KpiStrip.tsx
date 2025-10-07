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
      <div className="card-surface card-surface--secondary card-hover flex h-full items-center justify-center rounded-2xl text-sm text-[#ff9da8]">
        {error}
      </div>
    );
  }

  return (
    <div className="card-surface card-surface--secondary card-hover flex h-full flex-col justify-between rounded-2xl p-4 md:p-5">
      <header className="space-y-1">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">Impact snapshot</h3>
        <p className="text-[11px] text-white/50">Key indicators from the active window</p>
      </header>
      <div className="grid grid-cols-2 gap-3 text-sm text-white/60">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/5 bg-white/5 px-3 py-3 backdrop-blur-sm"
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{item.label}</p>
            <p className="mt-2 text-[28px] font-semibold tracking-tight text-white tabular-nums">
              {loading ? <span className="inline-block h-6 w-20 skeleton" /> : item.value}
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
