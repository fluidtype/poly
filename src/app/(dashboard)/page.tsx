"use client";

import { useMemo } from "react";

import NavRail from "@/features/polymuffin/ui/layout/NavRail";
import Topbar from "@/features/polymuffin/ui/layout/Topbar";
import TimeseriesPanel from "@/features/polymuffin/ui/panels/TimeseriesPanel";
import ActiveMarketsPanel from "@/features/polymuffin/ui/panels/ActiveMarketsPanel";
import KpiStrip from "@/features/polymuffin/ui/panels/KpiStrip";
import OddsDistribution from "@/features/polymuffin/ui/panels/OddsDistribution";
import GdeltSummary from "@/features/polymuffin/ui/panels/GdeltSummary";
import MarketsGrid from "@/features/polymuffin/ui/panels/MarketsGrid";
import NewsList from "@/features/polymuffin/ui/panels/NewsList";
import { usePolymuffinData } from "@/features/polymuffin/hooks/usePolymuffinData";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

export default function Page() {
  const data = usePolymuffinData();
  const datasets = useGlobalFilters((state) => state.datasets);
  const activeTint = useMemo(() => {
    if (datasets.twitter) {
      return "twitter" as const;
    }
    if (datasets.polymuffin) {
      return "polymarket" as const;
    }
    if (datasets.gdelt) {
      return "gdelt" as const;
    }
    return null;
  }, [datasets]);

  const desktop = (
    <div className="flex h-screen w-full bg-[color:var(--bg)] text-[color:var(--fg)]">
      <aside className="flex h-full w-[88px] flex-none items-center justify-center px-4 py-6">
        <NavRail />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="px-6 pt-6">
          <Topbar
            loading={data.isFetchingAny}
            onRefresh={data.refresh}
            error={data.combinedError}
            tint={activeTint}
          />
        </header>
        <main className="h-[calc(100vh-64px)] overflow-hidden px-6 pb-6">
          <div className="grid h-full grid-cols-12 grid-rows-[repeat(7,minmax(0,1fr))] gap-4">
            <div className="col-span-8 row-span-4 overflow-hidden">
              <TimeseriesPanel
                enabled={data.gdelt.enabled}
                series={data.gdelt.series}
                aggregation={data.gdelt.aggregation}
                loading={data.gdelt.loading}
                error={data.gdelt.error}
                onDateClick={data.gdelt.setActiveDate}
              />
            </div>
            <div className="col-span-4 row-span-4 overflow-hidden">
              <ActiveMarketsPanel
                datasets={data.activity.datasets}
                recentQueries={data.activity.recentQueries}
                loading={data.gdelt.loading || data.polymuffin.loading}
                error={data.combinedError}
              />
            </div>
            <div className="col-span-8 row-span-3 overflow-hidden">
              <MarketsGrid
                markets={data.polymuffin.markets}
                enabled={data.polymuffin.enabled}
                loading={data.polymuffin.loading}
                error={data.polymuffin.error}
                onOpenMarket={data.openMarket}
              />
            </div>
            <div className="col-span-4 row-span-3 grid h-full grid-rows-[auto_auto_auto_1fr] gap-4 overflow-hidden">
              <div className="overflow-hidden">
                <KpiStrip
                  totalEvents={data.kpis.totalEvents}
                  avgTone={data.kpis.avgTone}
                  avgImpact={data.kpis.avgImpact}
                  topPair={data.kpis.topPair}
                  loading={data.gdelt.loading}
                  error={data.gdelt.error}
                />
              </div>
              <div className="overflow-hidden">
                <OddsDistribution
                  markets={data.polymuffin.markets}
                  enabled={data.polymuffin.enabled}
                  loading={data.polymuffin.loading}
                  error={data.polymuffin.error}
                />
              </div>
              <div className="overflow-hidden">
                <GdeltSummary
                  insights={data.gdelt.insights}
                  loading={data.gdelt.loading}
                  error={data.gdelt.error}
                />
              </div>
              <div className="overflow-hidden">
                <NewsList
                  events={data.gdelt.events}
                  enabled={data.gdelt.enabled}
                  loading={data.gdelt.loading}
                  error={data.gdelt.error}
                  onOpenEvent={data.openEvent}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)]">
      <div className="hidden lg:block">{desktop}</div>
      <div className="flex h-screen w-full items-center justify-center px-6 text-center text-sm text-[color:var(--muted)] lg:hidden">
        Switch to a desktop viewport (≥1024px) to access the full dashboard experience.
      </div>
    </div>
  );
}
