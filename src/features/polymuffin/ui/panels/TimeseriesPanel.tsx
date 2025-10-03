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
      <div className="card flex h-full items-center justify-center text-sm text-[color:var(--muted)]">
        Enable the GDELT dataset to view the temporal distribution.
      </div>
    );
  }

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-[color:var(--border)]/60 px-5 py-3">
        <div>
          <h3 className="text-base font-semibold text-[color:var(--fg)]">Conflict activity</h3>
          <p className="text-xs text-[color:var(--muted)]">{aggregation === "monthly" ? "Monthly" : "Daily"} aggregation</p>
        </div>
      </header>
      <div className="flex-1 px-2 py-2">
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
