"use client";

import ActivityPanel from "@/components/system/ActivityPanel";
import type { ComponentProps } from "react";

type DatasetStatusEntry = NonNullable<ComponentProps<typeof ActivityPanel>["datasets"]>[number];
type RecentQueryEntry = NonNullable<ComponentProps<typeof ActivityPanel>["recentQueries"]>[number];

type ActiveMarketsPanelProps = {
  datasets: DatasetStatusEntry[];
  recentQueries: RecentQueryEntry[];
  loading: boolean;
  error: string | null;
};

export default function ActiveMarketsPanel({ datasets, recentQueries, loading, error }: ActiveMarketsPanelProps) {
  return (
    <div className="card-surface card-hover flex h-full flex-col overflow-hidden rounded-2xl">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 md:px-5 md:py-4">
        <div className="space-y-1">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">Dataset activity</h3>
          <p className="text-[11px] text-white/50">Monitor sync health and recent lookups</p>
        </div>
      </header>
      <div className="flex-1 overflow-hidden px-3 py-3 md:px-4">
        <div className="scroll-stable h-full overflow-auto pr-1">
          <ActivityPanel datasets={datasets} recentQueries={recentQueries} isLoading={loading} error={error ?? undefined} />
        </div>
      </div>
    </div>
  );
}
