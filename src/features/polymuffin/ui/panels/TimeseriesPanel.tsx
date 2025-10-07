"use client";

import { GdeltChart } from "@/components/gdelt/GdeltChart";
import type { GdeltSeriesPoint } from "@/types";

interface TimeseriesPanelProps {
  enabled: boolean;
  series: GdeltSeriesPoint[];
  aggregation: "daily" | "monthly";
  loading: boolean;
  error: string | null;
  onDateClick?: (iso: string) => void;
  onResetDate?: () => void;
}

export default function TimeseriesPanel({
  enabled,
  series,
  aggregation,
  loading,
  error,
  onDateClick,
}: TimeseriesPanelProps) {
  if (!enabled) {
    return (
      <div className="card-surface card-hover flex h-full items-center justify-center rounded-2xl text-sm text-white/60">
        Enable the GDELT dataset to view the temporal distribution.
      </div>
    );
  }

  return (
    <div className="card-surface card-hover flex h-full flex-col overflow-hidden rounded-2xl">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 md:px-5 md:py-4">
        <div className="space-y-1">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">Conflict activity</h3>
          <p className="text-[11px] text-white/50">
            {aggregation === "monthly" ? "Monthly" : "Daily"} aggregation
          </p>
        </div>
      </header>
      <div className="flex-1 px-2 py-2 md:px-4 md:py-3">
        <GdeltChart
          series={series}
          aggregation={aggregation}
          onDateClick={onDateClick}
          isLoading={loading}
          error={error ?? undefined}
        />
      </div>
    </div>
  );
}
