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
    <div className="card flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-[color:var(--border)]/60 px-5 py-3">
        <div>
          <h3 className="text-base font-semibold text-[color:var(--fg)]">Dataset activity</h3>
          <p className="text-xs text-[color:var(--muted)]">Monitor sync health and recent lookups</p>
        </div>
      </header>
      <div className="flex-1 overflow-hidden px-4 py-3">
        <ActivityPanel datasets={datasets} recentQueries={recentQueries} isLoading={loading} error={error ?? undefined} />
      </div>
    </div>
  );
}
